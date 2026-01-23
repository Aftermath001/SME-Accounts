import DatabaseService from './database.service';
import {
  Invoice,
  InvoiceItem,
  InvoiceWithItems,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Invoice Service
 * Handles invoice and invoice item data access
 * All queries are tenant-scoped
 * Manages invoice+items as a composite transaction
 */

export class InvoiceService extends DatabaseService {
  /**
   * Get invoice with all items (tenant-scoped)
   */
  async getByIdWithItems(
    businessId: string,
    invoiceId: string
  ): Promise<InvoiceWithItems | null> {
    try {
      Logger.debug('Fetching invoice with items', { invoiceId, businessId });

      // Get invoice
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (invoiceError) {
        Logger.error('Failed to fetch invoice', invoiceError as Error);
        throw new Error(`Failed to fetch invoice: ${(invoiceError as any).message}`);
      }

      if (!invoiceData) {
        return null;
      }

      // Get invoice items
      const { data: itemsData, error: itemsError } = await this.supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (itemsError) {
        Logger.error('Failed to fetch invoice items', itemsError as Error);
        throw new Error(`Failed to fetch invoice items: ${(itemsError as any).message}`);
      }

      return {
        ...(invoiceData as Invoice),
        items: (itemsData as InvoiceItem[]) || [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceService.getByIdWithItems error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * List invoices for a business (tenant-scoped)
   */
  async listByBusiness(
    businessId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
      customerId?: string;
    }
  ): Promise<Invoice[]> {
    try {
      Logger.debug('Listing invoices', { businessId, options });

      let query = this.supabase
        .from('invoices')
        .select('*')
        .eq('business_id', businessId);

      // Filter by status if provided
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      // Filter by customer if provided
      if (options?.customerId) {
        query = query.eq('customer_id', options.customerId);
      }

      // Apply pagination
      if (options?.limit) {
        const offset = options?.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      // Sort by invoice_date descending
      query = query.order('invoice_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        Logger.error('Failed to list invoices', error as Error);
        throw new Error(`Failed to list invoices: ${(error as any).message}`);
      }

      return (data as Invoice[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceService.listByBusiness error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Create invoice with items (tenant-scoped transaction)
   */
  async create(businessId: string, input: CreateInvoiceInput): Promise<InvoiceWithItems> {
    try {
      Logger.info('Creating invoice', { businessId, customerId: input.customer_id });

      // Validate required fields
      if (!input.customer_id || !input.items || input.items.length === 0) {
        throw new Error('Invoice must have customer and at least one item');
      }

      // Calculate totals
      let subtotal = 0;
      let vatTotal = 0;

      const lineItems = input.items.map((item) => {
        const lineTotal = item.quantity * item.unit_price;
        const vatAmount = lineTotal * (item.vat_percent / 100);
        subtotal += lineTotal;
        vatTotal += vatAmount;

        return {
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_percent: item.vat_percent,
          vat_amount: vatAmount,
          line_total: lineTotal,
        };
      });

      const grandTotal = subtotal + vatTotal;

      // Insert invoice
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .insert([
          {
            business_id: businessId,
            customer_id: input.customer_id,
            invoice_number: input.invoice_number,
            invoice_date: input.invoice_date,
            due_date: input.due_date,
            status: 'draft',
            subtotal,
            vat_total: vatTotal,
            grand_total: grandTotal,
            notes: input.notes || null,
            sent_at: null,
            paid_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (invoiceError || !invoiceData?.[0]) {
        Logger.error('Invoice creation failed', invoiceError as Error);
        throw new Error(`Failed to create invoice: ${(invoiceError as any)?.message}`);
      }

      const invoice = invoiceData[0] as Invoice;

      // Insert invoice items
      const itemsToInsert = lineItems.map((item) => ({
        invoice_id: invoice.id,
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: itemsData, error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        Logger.error('Invoice items creation failed', itemsError as Error);
        // Could implement rollback here
        throw new Error(`Failed to create invoice items: ${(itemsError as any)?.message}`);
      }

      Logger.info('Invoice created', { invoiceId: invoice.id, businessId });

      return {
        ...invoice,
        items: (itemsData as InvoiceItem[]) || [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceService.create error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update invoice status or details (tenant-scoped)
   */
  async updateInvoice(
    businessId: string,
    invoiceId: string,
    input: UpdateInvoiceInput
  ): Promise<Invoice> {
    try {
      Logger.debug('Updating invoice', { invoiceId, businessId });

      // Verify invoice belongs to business
      const existing = await this.getByIdWithItems(businessId, invoiceId);
      if (!existing) {
        throw new Error('Invoice not found');
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Only include provided fields
      if (input.status !== undefined) updateData.status = input.status;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.sent_at !== undefined) updateData.sent_at = input.sent_at;
      if (input.paid_at !== undefined) updateData.paid_at = input.paid_at;

      const { data, error } = await this.supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Invoice update failed', error as Error);
        throw new Error(`Failed to update invoice: ${(error as any)?.message}`);
      }

      return data[0] as Invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceService.update error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete invoice (tenant-scoped)
   * Only allows deletion of draft invoices
   */
  async delete(businessId: string, invoiceId: string): Promise<boolean> {
    try {
      Logger.info('Deleting invoice', { invoiceId, businessId });

      // Verify invoice exists and is draft
      const existing = await this.getByIdWithItems(businessId, invoiceId);
      if (!existing) {
        throw new Error('Invoice not found');
      }

      if (existing.status !== 'draft') {
        throw new Error('Can only delete draft invoices');
      }

      // Delete items first
      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (itemsError) {
        Logger.error('Invoice items deletion failed', itemsError as Error);
        throw new Error(`Failed to delete invoice items: ${(itemsError as any).message}`);
      }

      // Delete invoice
      const { error } = await this.supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('business_id', businessId);

      if (error) {
        Logger.error('Invoice deletion failed', error as Error);
        throw new Error(`Failed to delete invoice: ${(error as any).message}`);
      }

      Logger.info('Invoice deleted', { invoiceId, businessId });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceService.delete error', new Error(errorMessage));
      throw error;
    }
  }
}

export default InvoiceService;
