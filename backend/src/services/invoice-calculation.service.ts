import DatabaseService from './database.service';
import { Invoice } from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Invoice Calculation Service
 * Handles invoice totals calculation and VAT computation
 * Responsible for:
 * - Calculating subtotal from items
 * - Calculating VAT total
 * - Computing grand total
 * - Storing computed totals on invoice
 * - Ensuring idempotency
 */

export interface InvoiceTotals {
  subtotal: number;
  vat_total: number;
  grand_total: number;
}

export class InvoiceCalculationService extends DatabaseService {

  /**
   * Calculate invoice totals from items
   * Never accepts totals from client input
   * Always derived from invoice items
   */
  async calculateTotals(invoiceId: string): Promise<InvoiceTotals> {
    try {
      Logger.debug('Calculating invoice totals', { invoiceId });

      // Fetch all items for invoice directly
      const { data: items, error } = await this.supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) {
        Logger.error('Failed to fetch invoice items', error as Error);
        throw new Error(`Failed to fetch invoice items: ${(error as any).message}`);
      }

      if (!items || items.length === 0) {
        throw new Error('Invoice must have at least one item');
      }

      // Sum all line totals for subtotal
      const subtotal = items.reduce((sum, item) => {
        return sum + item.line_total;
      }, 0);

      // Sum all VAT amounts
      const vatTotal = items.reduce((sum, item) => {
        return sum + item.vat_amount;
      }, 0);

      // Grand total = subtotal + VAT
      const grandTotal = subtotal + vatTotal;

      const totals: InvoiceTotals = {
        subtotal: Math.round(subtotal * 100) / 100,
        vat_total: Math.round(vatTotal * 100) / 100,
        grand_total: Math.round(grandTotal * 100) / 100,
      };

      Logger.debug('Calculated totals', { invoiceId, totals });

      return totals;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceCalculationService.calculateTotals error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Recalculate and store invoice totals
   * Updates the invoice record with computed totals
   * Ensures consistency between items and invoice
   */
  async recalculateAndStore(invoiceId: string): Promise<Invoice> {
    try {
      Logger.info('Recalculating and storing invoice totals', { invoiceId });

      // Calculate fresh totals from items
      const totals = await this.calculateTotals(invoiceId);

      // Update invoice record with computed totals
      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          subtotal: totals.subtotal,
          vat_total: totals.vat_total,
          grand_total: totals.grand_total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Failed to update invoice totals', error as Error);
        throw new Error(`Failed to update invoice totals: ${(error as any)?.message}`);
      }

      const invoice = data[0] as Invoice;
      Logger.info('Invoice totals updated', { invoiceId, totals });

      return invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceCalculationService.recalculateAndStore error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Verify invoice totals are correct
   * Audit function to ensure data integrity
   * Returns true if totals match items
   */
  async verifyTotals(invoiceId: string): Promise<boolean> {
    try {
      Logger.debug('Verifying invoice totals', { invoiceId });

      // Get current invoice record
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        Logger.error('Failed to fetch invoice', invoiceError as Error);
        throw new Error('Invoice not found');
      }

      const invoice = invoiceData as Invoice;

      // Calculate expected totals
      const expectedTotals = await this.calculateTotals(invoiceId);

      // Compare
      const isValid =
        invoice.subtotal === expectedTotals.subtotal &&
        invoice.vat_total === expectedTotals.vat_total &&
        invoice.grand_total === expectedTotals.grand_total;

      if (!isValid) {
        Logger.warn('Invoice totals mismatch', {
          invoiceId,
          stored: {
            subtotal: invoice.subtotal,
            vat_total: invoice.vat_total,
            grand_total: invoice.grand_total,
          },
          expected: expectedTotals,
        });
      }

      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceCalculationService.verifyTotals error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get invoice VAT details
   * Breaks down VAT by item for transparency
   */
  async getVatBreakdown(invoiceId: string): Promise<
    Array<{
      description: string;
      lineTotal: number;
      vatPercent: number;
      vatAmount: number;
    }>
  > {
    try {
      Logger.debug('Getting VAT breakdown', { invoiceId });

      // Fetch items directly
      const { data: items, error } = await this.supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) {
        Logger.error('Failed to fetch invoice items', error as Error);
        throw new Error(`Failed to fetch invoice items: ${(error as any).message}`);
      }

      return (items || []).map((item) => ({
        description: item.description,
        lineTotal: item.line_total,
        vatPercent: item.vat_percent,
        vatAmount: item.vat_amount,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceCalculationService.getVatBreakdown error', new Error(errorMessage));
      throw error;
    }
  }
}

export default InvoiceCalculationService;
