import { SupabaseClient } from '@supabase/supabase-js';
import { Payment, PaymentStatus, PAYMENTS_TABLE } from '../models/payment.model';

export class PaymentRepository {
  constructor(private readonly db: SupabaseClient) {}

  async setCheckoutRequestId(paymentId: string, checkoutRequestId: string): Promise<Payment> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .update({ mpesa_reference: checkoutRequestId })
      .eq('id', paymentId)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async findByCheckoutRequestId(checkoutRequestId: string): Promise<Payment | null> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .select('*')
      .eq('mpesa_reference', checkoutRequestId)
      .single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    return data as Payment;
  }

  async insertPayment(p: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .insert(p)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await this.db.from(PAYMENTS_TABLE).select('*').eq('id', id).single();
    if (error) {
      if ((error as any).code === 'PGRST116' /* No rows */) return null;
      throw error;
    }
    return data as Payment;
  }

  async markPaymentStatus(
    id: string,
    status: PaymentStatus,
    opts?: { mpesa_reference?: string | null; raw_mpesa_payload?: unknown | null }
  ): Promise<Payment> {
    const update: Partial<Payment> = { status };
    if (opts && 'mpesa_reference' in opts) {
      (update as any).mpesa_reference = opts.mpesa_reference ?? null;
    }
    if (opts && 'raw_mpesa_payload' in opts) {
      (update as any).raw_mpesa_payload = opts.raw_mpesa_payload ?? null;
    }

    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async listPaymentsForInvoice(tenant_id: string, invoice_id: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('invoice_id', invoice_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Payment[];
  }

  async updateRawPayload(id: string, payload: unknown): Promise<Payment> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .update({ raw_mpesa_payload: payload })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  }

  async findByCheckoutRequestIdInPayload(checkoutRequestId: string): Promise<Payment | null> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .select('*')
      .contains('raw_mpesa_payload', { checkout_request_id: checkoutRequestId } as any);
    if (error) throw error;
    const list = (data ?? []) as Payment[];
    return list.length > 0 ? list[0] : null;
  }

  async sumSuccessfulPaymentsForInvoice(invoice_id: string): Promise<number> {
    const { data, error } = await this.db
      .from(PAYMENTS_TABLE)
      .select('amount')
      .eq('invoice_id', invoice_id)
      .eq('status', PaymentStatus.SUCCESS);
    if (error) throw error;
    const rows = (data ?? []) as Pick<Payment, 'amount'>[];
    return rows.reduce((acc, r) => acc + Number(r.amount), 0);
  }
}
