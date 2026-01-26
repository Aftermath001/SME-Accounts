import { Request, Response } from 'express';
import { MpesaService } from '../services/mpesa.service';
import { PaymentService } from '../services/payment.service';
import supabaseAdmin from '../config/supabase';
import { validateInitiatePayment } from '../validators/payment.validator';
import Logger from '../utils/logger';

const mpesaService = new MpesaService();
const paymentService = new PaymentService(supabaseAdmin);

export class PaymentController {
  // POST /payments/mpesa/initiate (auth required)
  static async initiateMpesa(req: Request, res: Response): Promise<void> {
    try {
      const { invoice_id, amount, phone_number } = validateInitiatePayment(req.body);
      const tenant_id = (req as any).tenant?.id as string;
      if (!tenant_id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const result = await mpesaService.initiateStkPush({
        tenant_id,
        invoice_id,
        amount,
        phone_number,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      Logger.warn('Payment initiation failed', { message });
      let status = 400;
      if (/Unauthorized/.test(message)) status = 401;
      if (/not accessible|not found/.test(message)) status = 404;
      if (/already fully paid|exceeds remaining balance|greater than 0/.test(message)) status = 422;
      res.status(status).json({ success: false, error: { message } });
    }
  }

  // POST /payments/mpesa/callback (no auth)
  static async mpesaCallback(req: Request, res: Response): Promise<void> {
    try {
      const payload = (req as any).rawBody ? JSON.parse((req as any).rawBody) : req.body;
      await mpesaService.processCallback(payload);
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
      // Always 200 OK to acknowledge Safaricom, do not leak internals
      Logger.warn('Error while processing M-Pesa callback');
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Processed' });
    }
  }

  // GET /invoices/:invoiceId/payments (auth required)
  static async getPaymentsForInvoice(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = (req as any).tenant?.id as string;
      if (!tenant_id) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const invoice_id = req.params.invoiceId;
      if (!invoice_id) {
        res.status(400).json({ success: false, error: { message: 'invoiceId is required' } });
        return;
      }

      const payments = await paymentService.getPaymentsForInvoice({ tenant_id, invoice_id });
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch payments';
      const status = /not accessible|not found/.test(message) ? 404 : 400;
      res.status(status).json({ success: false, error: { message } });
    }
  }
}

export default PaymentController;
