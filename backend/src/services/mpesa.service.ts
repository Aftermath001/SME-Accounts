import axios from 'axios';
import Logger from '../utils/logger';
import { MpesaTokenService, loadMpesaConfigFromEnv } from './mpesa-token.service';
import { buildPassword, formatTimestamp, extractReceiptNumber } from '../utils/mpesa.util';
import { InitiateStkResult, StkCallbackPayload, StkPushRequest, StkPushSyncResponse } from '../types/mpesa.types';
import { PaymentMethod, PaymentStatus } from '../models/payment.model';
import { PaymentService } from './payment.service';
import { PaymentRepository } from '../repositories/payment.repository';
import supabaseAdmin from '../config/supabase';

export class MpesaService {
  private tokenService: MpesaTokenService;
  private paymentService: PaymentService;
  private paymentRepo: PaymentRepository;

  constructor() {
    const cfg = loadMpesaConfigFromEnv();
    this.tokenService = new MpesaTokenService(cfg);
    this.paymentService = new PaymentService(supabaseAdmin);
    this.paymentRepo = new PaymentRepository(supabaseAdmin);
  }

  async initiateStkPush(params: {
    tenant_id: string;
    invoice_id: string;
    amount: number;
    phone_number: string; // 2547...
    account_reference?: string; // invoice number
    description?: string;
  }): Promise<InitiateStkResult> {
    const { tenant_id, invoice_id, amount, phone_number, account_reference, description } = params;

    // Create PENDING payment intent (server-side rules enforce overpayment prevention)
    const payment = await this.paymentService.createPaymentIntent({
      tenant_id,
      invoice_id,
      amount,
      method: PaymentMethod.MPESA,
    });

    const cfg = loadMpesaConfigFromEnv();
    const accessToken = await this.tokenService.getAccessToken();
    const timestamp = formatTimestamp();
    const password = buildPassword(cfg.shortcode, cfg.passkey, timestamp);

    const payload: StkPushRequest = {
      BusinessShortCode: cfg.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone_number,
      PartyB: cfg.shortcode,
      PhoneNumber: phone_number,
      CallBackURL: cfg.callbackUrl,
      AccountReference: account_reference || invoice_id,
      TransactionDesc: description || `Invoice ${invoice_id}`,
    };

    try {
      const { data } = await axios.post<StkPushSyncResponse>(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15_000,
      });

      // Persist CheckoutRequestID on the payment for callback correlation
      await this.paymentRepo.setCheckoutRequestId(payment.id, data.CheckoutRequestID);

      Logger.info('STK push initiated', { payment_id: payment.id });

      return {
        payment_id: payment.id,
        checkout_request_id: data.CheckoutRequestID,
        response: data,
      };
    } catch (err) {
      Logger.error('STK push initiation failed');
      // Mark payment as failed to reflect initiation failure
      try {
        await this.paymentService.applyFailedPayment({ payment_id: payment.id, failure_reason: 'INITIATION_FAILED' });
      } catch (e) {
        Logger.warn('Failed to mark payment as failed after initiation error');
      }
      throw err;
    }
  }

  // Process asynchronous callbacks from Daraja
  async processCallback(payload: StkCallbackPayload): Promise<void> {
    const cb = payload?.Body?.stkCallback;
    if (!cb || !cb.CheckoutRequestID) {
      Logger.warn('Invalid M-Pesa callback payload');
      return;
    }

    // Idempotency: find payment by CheckoutRequestID and verify current status
    const payment = await this.paymentRepo.findByCheckoutRequestId(cb.CheckoutRequestID);

    if (!payment) {
      // Unknown payment; log and ignore for safety
      Logger.warn('Callback received for unknown CheckoutRequestID', { checkout: cb.CheckoutRequestID });
      return;
    }

    // Store raw payload for audit regardless of outcome
    try {
      await this.paymentRepo.updateRawPayload(payment.id, {
        checkout_request_id: cb.CheckoutRequestID,
        merchant_request_id: cb.MerchantRequestID,
        result_code: cb.ResultCode,
        result_desc: cb.ResultDesc,
        raw: payload,
      });
    } catch (e) {
      Logger.warn('Failed to persist raw callback payload', { payment_id: payment.id });
    }

    if (payment.status !== PaymentStatus.PENDING) {
      // Already processed (SUCCESS/FAILED). Ignore duplicates.
      Logger.info('Duplicate callback ignored', { payment_id: payment.id, status: payment.status });
      return;
    }

    if (cb.ResultCode === 0) {
      const receipt = extractReceiptNumber(cb) || undefined;
      await this.paymentService.applySuccessfulPayment({
        payment_id: payment.id,
        mpesa_reference: receipt,
        raw_mpesa_payload: payload,
      });
      Logger.info('Payment marked SUCCESS from callback', { payment_id: payment.id, receipt });
    } else {
      await this.paymentService.applyFailedPayment({
        payment_id: payment.id,
        failure_reason: cb.ResultDesc || `ResultCode ${cb.ResultCode}`,
      });
      Logger.info('Payment marked FAILED from callback', { payment_id: payment.id });
    }
  }
}
