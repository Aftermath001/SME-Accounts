import DatabaseService from './database.service';
import { Invoice } from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Invoice Status Service
 * Handles invoice status transitions and validation
 * Enforces state machine rules:
 * - draft → sent
 * - sent → paid
 * - Prevents illegal transitions
 */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Valid status transitions
 * Maps current status to allowed next statuses
 */
const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'cancelled'],
  paid: [],
  overdue: ['paid', 'cancelled'],
  cancelled: [],
};

export class InvoiceStatusService extends DatabaseService {
  /**
   * Check if status transition is valid
   * Returns true only if transition is allowed
   */
  isValidTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): boolean {
    if (currentStatus === newStatus) {
      return false; // No-op transition
    }

    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus];
    return allowedNextStatuses?.includes(newStatus) || false;
  }

  /**
   * Get allowed next statuses for current status
   */
  getAllowedNextStatuses(currentStatus: InvoiceStatus): InvoiceStatus[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Transition invoice to sent status
   * Checks:
   * - Invoice is in draft status
   * - Invoice has at least one item
   * - Invoice has valid totals
   */
  async markAsSent(invoiceId: string, businessId: string): Promise<Invoice> {
    try {
      Logger.info('Marking invoice as sent', { invoiceId, businessId });

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        Logger.error('Failed to fetch invoice', invoiceError as Error);
        throw new Error('Invoice not found');
      }

      const invoice = invoiceData as Invoice;

      // Check current status
      if (invoice.status !== 'draft') {
        throw new Error(
          `Cannot send invoice with status '${invoice.status}'. Only draft invoices can be sent.`
        );
      }

      // Ensure invoice has items and valid totals
      if (!invoice.grand_total || invoice.grand_total <= 0) {
        throw new Error('Cannot send invoice without items or valid totals');
      }

      // Update status and set sent_at timestamp
      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Failed to mark invoice as sent', error as Error);
        throw new Error(`Failed to mark invoice as sent: ${(error as any)?.message}`);
      }

      const updatedInvoice = data[0] as Invoice;
      Logger.info('Invoice marked as sent', { invoiceId, sentAt: updatedInvoice.sent_at });

      return updatedInvoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceStatusService.markAsSent error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Transition invoice to paid status
   * Checks:
   * - Invoice is in sent status
   * - Sets paid_at timestamp
   */
  async markAsPaid(invoiceId: string, businessId: string): Promise<Invoice> {
    try {
      Logger.info('Marking invoice as paid', { invoiceId, businessId });

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        Logger.error('Failed to fetch invoice', invoiceError as Error);
        throw new Error('Invoice not found');
      }

      const invoice = invoiceData as Invoice;

      // Check current status
      if (invoice.status !== 'sent' && invoice.status !== 'overdue') {
        throw new Error(
          `Cannot mark invoice as paid with status '${invoice.status}'. Only sent or overdue invoices can be paid.`
        );
      }

      // Update status and set paid_at timestamp
      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Failed to mark invoice as paid', error as Error);
        throw new Error(`Failed to mark invoice as paid: ${(error as any)?.message}`);
      }

      const updatedInvoice = data[0] as Invoice;
      Logger.info('Invoice marked as paid', { invoiceId, paidAt: updatedInvoice.paid_at });

      return updatedInvoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceStatusService.markAsPaid error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Cancel an invoice
   * Only draft and sent invoices can be cancelled
   */
  async cancel(invoiceId: string, businessId: string): Promise<Invoice> {
    try {
      Logger.info('Cancelling invoice', { invoiceId, businessId });

      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        Logger.error('Failed to fetch invoice', invoiceError as Error);
        throw new Error('Invoice not found');
      }

      const invoice = invoiceData as Invoice;

      // Check if cancellation is allowed
      if (!this.isValidTransition(invoice.status as InvoiceStatus, 'cancelled')) {
        throw new Error(
          `Cannot cancel invoice with status '${invoice.status}'. Only draft and sent invoices can be cancelled.`
        );
      }

      // Update status
      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Failed to cancel invoice', error as Error);
        throw new Error(`Failed to cancel invoice: ${(error as any)?.message}`);
      }

      const updatedInvoice = data[0] as Invoice;
      Logger.info('Invoice cancelled', { invoiceId });

      return updatedInvoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceStatusService.cancel error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get current invoice status
   */
  async getStatus(invoiceId: string, businessId: string): Promise<InvoiceStatus> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('status')
        .eq('id', invoiceId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error || !data) {
        throw new Error('Invoice not found');
      }

      return (data as any).status as InvoiceStatus;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceStatusService.getStatus error', new Error(errorMessage));
      throw error;
    }
  }
}

export default InvoiceStatusService;
