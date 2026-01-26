import { SupabaseClient } from '@supabase/supabase-js';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment.model';
import { PaymentRepository } from '../repositories/payment.repository';
import { InvoiceRepository, InvoiceRow } from '../repositories/invoice.repository';

export class PaymentService {
  private paymentRepo: PaymentRepository;
  private invoiceRepo: InvoiceRepository;

  constructor(db: SupabaseClient) {
    this.paymentRepo = new PaymentRepository(db);
    this.invoiceRepo = new InvoiceRepository(db);
  }

  // Utility to compute invoice status based on balance
  private computeInvoicePaymentStatus(invoice: InvoiceRow, totalSuccessfulPayments: number): InvoiceRow['status'] {
    const remaining = Number(invoice.total) - totalSuccessfulPayments;
    if (remaining <= 0) return 'PAID';
    if (totalSuccessfulPayments > 0) return 'PARTIALLY_PAID';
    return 'UNPAID';
  }

  // 1️⃣ createPaymentIntent
  async createPaymentIntent(params: {
    tenant_id: string;
    invoice_id: string;
    amount: number;
    method: PaymentMethod; // MPESA | MANUAL
  }): Promise<Payment> {
    const { tenant_id, invoice_id, amount, method } = params;

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Ensure invoice exists and belongs to tenant
    const invoice = await this.invoiceRepo.getInvoiceByIdForTenant(tenant_id, invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found or not accessible for tenant');
    }

    // Fetch current successful payment sum to compute remaining balance server-side
    const totalSuccessfulPayments = await this.paymentRepo.sumSuccessfulPaymentsForInvoice(invoice_id);
    const remaining = Number(invoice.total) - totalSuccessfulPayments;

    if (remaining <= 0) {
      throw new Error('Invoice is already fully paid');
    }

    if (amount > remaining) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    const paymentToInsert: Omit<Payment, 'id' | 'created_at'> = {
      tenant_id,
      invoice_id,
      amount,
      method,
      status: PaymentStatus.PENDING,
      mpesa_reference: null,
      raw_mpesa_payload: null,
    };

    const payment = await this.paymentRepo.insertPayment(paymentToInsert);
    return payment;
  }

  // 2️⃣ applySuccessfulPayment
  async applySuccessfulPayment(params: {
    payment_id: string;
    mpesa_reference?: string | null;
    raw_mpesa_payload?: unknown | null;
  }): Promise<{ payment: Payment; invoice: InvoiceRow }> {
    const { payment_id, mpesa_reference, raw_mpesa_payload } = params;

    // Load payment and validate it's pending
    const payment = await this.paymentRepo.getPaymentById(payment_id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be updated');
    }

    // Mark payment success first (idempotency should be handled upstream in callbacks, Part C)
    const updatedPayment = await this.paymentRepo.markPaymentStatus(payment_id, PaymentStatus.SUCCESS, {
      mpesa_reference: mpesa_reference ?? payment.mpesa_reference ?? null,
      raw_mpesa_payload: raw_mpesa_payload ?? payment.raw_mpesa_payload ?? null,
    });

    // Recalculate invoice balance and status
    const invoice = await this.invoiceRepo.getInvoiceByIdForTenant(updatedPayment.tenant_id, updatedPayment.invoice_id);
    if (!invoice) throw new Error('Invoice not found for tenant');

    const totalSuccessfulPayments = await this.paymentRepo.sumSuccessfulPaymentsForInvoice(updatedPayment.invoice_id);
    const remaining = Math.max(0, Number(invoice.total) - totalSuccessfulPayments);
    const newStatus = this.computeInvoicePaymentStatus(invoice, totalSuccessfulPayments);

    const updatedInvoice = await this.invoiceRepo.updateInvoiceBalanceAndStatus(
      invoice.id,
      invoice.tenant_id,
      remaining,
      newStatus
    );

    return { payment: updatedPayment, invoice: updatedInvoice };
  }

  // 3️⃣ applyFailedPayment
  async applyFailedPayment(params: { payment_id: string; failure_reason?: string }): Promise<Payment> {
    const { payment_id, failure_reason } = params;

    const payment = await this.paymentRepo.getPaymentById(payment_id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be updated');
    }

    // For failures, we may want to store reason in raw payload for audit
    const updated = await this.paymentRepo.markPaymentStatus(payment_id, PaymentStatus.FAILED, {
      raw_mpesa_payload: failure_reason ? { failure_reason } : null,
    });

    return updated;
  }

  // 4️⃣ getPaymentsForInvoice
  async getPaymentsForInvoice(params: { tenant_id: string; invoice_id: string }): Promise<Payment[]> {
    const { tenant_id, invoice_id } = params;

    const invoice = await this.invoiceRepo.getInvoiceByIdForTenant(tenant_id, invoice_id);
    if (!invoice) throw new Error('Invoice not found or not accessible for tenant');

    return this.paymentRepo.listPaymentsForInvoice(tenant_id, invoice_id);
  }
}
