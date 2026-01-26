import { SupabaseClient } from '@supabase/supabase-js';

export interface InvoiceRow {
  id: string;
  tenant_id: string;
  total: number; // numeric in DB
  balance: number; // numeric in DB
  status: 'DRAFT' | 'SENT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | string; // extend as needed
}

export class InvoiceRepository {
  private readonly table = 'invoices';
  constructor(private readonly db: SupabaseClient) {}

  async getInvoiceByIdForTenant(tenant_id: string, invoice_id: string): Promise<InvoiceRow | null> {
    const { data, error } = await this.db
      .from(this.table)
      .select('id, tenant_id, total, balance, status')
      .eq('tenant_id', tenant_id)
      .eq('id', invoice_id)
      .single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    return data as InvoiceRow;
  }

  async updateInvoiceBalanceAndStatus(
    invoice_id: string,
    tenant_id: string,
    balance: number,
    status: InvoiceRow['status']
  ): Promise<InvoiceRow> {
    const { data, error } = await this.db
      .from(this.table)
      .update({ balance, status })
      .eq('id', invoice_id)
      .eq('tenant_id', tenant_id)
      .select('id, tenant_id, total, balance, status')
      .single();
    if (error) throw error;
    return data as InvoiceRow;
  }
}
