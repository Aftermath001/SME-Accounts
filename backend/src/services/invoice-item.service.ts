import DatabaseService from './database.service';
import { InvoiceItem, CreateInvoiceItemInput } from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Invoice Item Service
 * Handles invoice line item CRUD operations
 * Responsible for:
 * - Creating/updating/deleting line items
 * - Validating quantities and unit prices
 * - Ensuring items belong to correct invoice
 */

export class InvoiceItemService extends DatabaseService {
  /**
   * Get invoice item by ID
   */
  async getById(itemId: string): Promise<InvoiceItem | null> {
    try {
      Logger.debug('Fetching invoice item', { itemId });

      const { data, error } = await this.supabase
        .from('invoice_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch invoice item', error as Error);
        throw new Error(`Failed to fetch invoice item: ${(error as any).message}`);
      }

      return (data as InvoiceItem) || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.getById error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get all items for an invoice
   */
  async listByInvoice(invoiceId: string): Promise<InvoiceItem[]> {
    try {
      Logger.debug('Fetching invoice items', { invoiceId });

      const { data, error } = await this.supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) {
        Logger.error('Failed to fetch invoice items', error as Error);
        throw new Error(`Failed to fetch invoice items: ${(error as any).message}`);
      }

      return (data as InvoiceItem[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.listByInvoice error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Validate item data
   * Ensures quantities and prices are positive and valid
   */
  private validateItem(input: CreateInvoiceItemInput): void {
    if (!input.description || input.description.trim() === '') {
      throw new Error('Item description is required');
    }

    if (input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (input.unit_price < 0) {
      throw new Error('Unit price cannot be negative');
    }

    if (input.vat_percent < 0 || input.vat_percent > 100) {
      throw new Error('VAT percent must be between 0 and 100');
    }
  }

  /**
   * Calculate line item totals
   * Returns line_total and vat_amount based on quantity, unit_price, and vat_percent
   */
  private calculateLineItem(
    quantity: number,
    unitPrice: number,
    vatPercent: number
  ): { lineTotal: number; vatAmount: number } {
    const lineTotal = quantity * unitPrice;
    const vatAmount = lineTotal * (vatPercent / 100);

    return {
      lineTotal: Math.round(lineTotal * 100) / 100, // Round to 2 decimals
      vatAmount: Math.round(vatAmount * 100) / 100,
    };
  }

  /**
   * Create a new invoice item
   * Used when creating new invoices
   */
  async create(invoiceId: string, input: CreateInvoiceItemInput): Promise<InvoiceItem> {
    try {
      // Validate input
      this.validateItem(input);

      Logger.info('Creating invoice item', { invoiceId, description: input.description });

      // Calculate totals
      const { lineTotal, vatAmount } = this.calculateLineItem(
        input.quantity,
        input.unit_price,
        input.vat_percent
      );

      const { data, error } = await this.supabase
        .from('invoice_items')
        .insert([
          {
            invoice_id: invoiceId,
            description: input.description.trim(),
            quantity: input.quantity,
            unit_price: input.unit_price,
            vat_percent: input.vat_percent,
            line_total: lineTotal,
            vat_amount: vatAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error || !data?.[0]) {
        Logger.error('Invoice item creation failed', error as Error);
        throw new Error(`Failed to create invoice item: ${(error as any)?.message}`);
      }

      return data[0] as InvoiceItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.create error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Create multiple invoice items (batch operation)
   * Used during invoice creation
   */
  async createBatch(invoiceId: string, inputs: CreateInvoiceItemInput[]): Promise<InvoiceItem[]> {
    try {
      if (!inputs || inputs.length === 0) {
        throw new Error('At least one invoice item is required');
      }

      // Validate all items
      inputs.forEach((input) => this.validateItem(input));

      Logger.info('Creating invoice items batch', { invoiceId, count: inputs.length });

      // Calculate all line items
      const itemsToInsert = inputs.map((input) => {
        const { lineTotal, vatAmount } = this.calculateLineItem(
          input.quantity,
          input.unit_price,
          input.vat_percent
        );

        return {
          invoice_id: invoiceId,
          description: input.description.trim(),
          quantity: input.quantity,
          unit_price: input.unit_price,
          vat_percent: input.vat_percent,
          line_total: lineTotal,
          vat_amount: vatAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { data, error } = await this.supabase
        .from('invoice_items')
        .insert(itemsToInsert)
        .select();

      if (error || !data) {
        Logger.error('Invoice items batch creation failed', error as Error);
        throw new Error(`Failed to create invoice items: ${(error as any)?.message}`);
      }

      return data as InvoiceItem[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.createBatch error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update an invoice item
   * Only allowed on draft invoices
   */
  async updateItem(itemId: string, input: CreateInvoiceItemInput): Promise<InvoiceItem> {
    try {
      // Validate input
      this.validateItem(input);

      Logger.debug('Updating invoice item', { itemId });

      // Verify item exists
      const existing = await this.getById(itemId);
      if (!existing) {
        throw new Error('Invoice item not found');
      }

      // Calculate new totals
      const { lineTotal, vatAmount } = this.calculateLineItem(
        input.quantity,
        input.unit_price,
        input.vat_percent
      );

      const { data, error } = await this.supabase
        .from('invoice_items')
        .update({
          description: input.description.trim(),
          quantity: input.quantity,
          unit_price: input.unit_price,
          vat_percent: input.vat_percent,
          line_total: lineTotal,
          vat_amount: vatAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Invoice item update failed', error as Error);
        throw new Error(`Failed to update invoice item: ${(error as any)?.message}`);
      }

      const updatedItem = data[0] as InvoiceItem;
      Logger.debug('Invoice item updated', { itemId, invoiceId: existing.invoice_id });

      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.updateItem error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete an invoice item
   * Only allowed on draft invoices
   */
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      Logger.info('Deleting invoice item', { itemId });

      // Verify item exists
      const existing = await this.getById(itemId);
      if (!existing) {
        throw new Error('Invoice item not found');
      }

      const { error } = await this.supabase.from('invoice_items').delete().eq('id', itemId);

      if (error) {
        Logger.error('Invoice item deletion failed', error as Error);
        throw new Error(`Failed to delete invoice item: ${(error as any).message}`);
      }

      Logger.info('Invoice item deleted', { itemId, invoiceId: existing.invoice_id });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.deleteItem error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete all items for an invoice
   * Used when deleting entire invoice
   */
  async deleteByInvoice(invoiceId: string): Promise<number> {
    try {
      Logger.info('Deleting all invoice items', { invoiceId });

      const { error, data } = await this.supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)
        .select();

      if (error) {
        Logger.error('Invoice items deletion failed', error as Error);
        throw new Error(`Failed to delete invoice items: ${(error as any).message}`);
      }

      const deletedCount = (data as any[])?.length || 0;
      Logger.info('Invoice items deleted', { invoiceId, count: deletedCount });

      return deletedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceItemService.deleteByInvoice error', new Error(errorMessage));
      throw error;
    }
  }
}

export default InvoiceItemService;
