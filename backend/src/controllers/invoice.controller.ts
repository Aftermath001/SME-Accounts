import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import InvoiceService from '../services/invoice.service';
import InvoiceItemService from '../services/invoice-item.service';
import InvoiceCalculationService from '../services/invoice-calculation.service';
import InvoiceStatusService from '../services/invoice-status.service';
import { CreateInvoiceInput, UpdateInvoiceInput, CreateInvoiceItemInput } from '../types/domain';
import { Logger } from '../utils/logger';
import { sendError, sendSuccess } from '../utils/response';

/**
 * Invoice Controller
 * HTTP request handlers for invoice operations
 * Delegates to services, enforces tenant isolation
 */

export class InvoiceController {
  private invoiceService = new InvoiceService();
  private itemService = new InvoiceItemService();
  private calculationService = new InvoiceCalculationService();
  private statusService = new InvoiceStatusService();

  /**
   * Create a new invoice with items
   * POST /invoices
   * Body: { invoice_number, customer_id, invoice_date, due_date, items, notes? }
   */
  async createInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const input: CreateInvoiceInput = request.body;

      // Validate required fields
      if (!input.invoice_number || !input.customer_id || !input.invoice_date) {
        sendError(res, 'Missing required fields: invoice_number, customer_id, invoice_date', 400);
        return;
      }

      if (!input.items || input.items.length === 0) {
        sendError(res, 'Invoice must have at least one item', 400);
        return;
      }

      Logger.info('Creating invoice', { businessId, invoice_number: input.invoice_number });

      // Create invoice
      const invoice = await this.invoiceService.create(businessId, input);

      // Calculate and store totals
      const invoiceWithTotals = await this.calculationService.recalculateAndStore(invoice.id);

      sendSuccess(res, invoiceWithTotals, 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.createInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * List invoices for current business
   * GET /invoices?status=draft&limit=10&offset=0
   */
  async listInvoices(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const status = request.query.status as string | undefined;
      const limit = request.query.limit ? parseInt(request.query.limit as string, 10) : 50;
      const offset = request.query.offset ? parseInt(request.query.offset as string, 10) : 0;
      const customerId = request.query.customerId as string | undefined;

      Logger.debug('Listing invoices', { businessId, status, limit, offset });

      const invoices = await this.invoiceService.listByBusiness(businessId, {
        status,
        limit,
        offset,
        customerId,
      });

      sendSuccess(res, invoices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.listInvoices error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Get single invoice with items
   * GET /invoices/:id
   */
  async getInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      Logger.debug('Fetching invoice', { invoiceId, businessId });

      const invoice = await this.invoiceService.getByIdWithItems(businessId, invoiceId);

      if (!invoice) {
        sendError(res, 'Invoice not found', 404);
        return;
      }

      // Get VAT breakdown for transparency
      const vatBreakdown = await this.calculationService.getVatBreakdown(invoiceId);

      const response = {
        ...invoice,
        vat_breakdown: vatBreakdown,
      };

      sendSuccess(res, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.getInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Update invoice (draft only)
   * PATCH /invoices/:id
   * Body: { due_date?, notes? } - Cannot change invoice_number or customer after creation
   */
  async updateInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      // Verify invoice is draft
      const currentStatus = await this.statusService.getStatus(invoiceId, businessId);
      if (currentStatus !== 'draft') {
        sendError(
          res,
          `Cannot update invoice with status '${currentStatus}'. Only draft invoices can be edited.`,
          400
        );
        return;
      }

      const input: UpdateInvoiceInput = request.body;

      Logger.info('Updating invoice', { invoiceId, businessId });

      // Update invoice metadata only
      const updated = await this.invoiceService.updateInvoice(businessId, invoiceId, input);

      sendSuccess(res, updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.updateInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Send invoice (mark as sent)
   * POST /invoices/:id/send
   */
  async sendInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      Logger.info('Sending invoice', { invoiceId, businessId });

      const updated = await this.statusService.markAsSent(invoiceId, businessId);

      sendSuccess(res, updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.sendInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 400); // 400 for business rule violations
    }
  }

  /**
   * Mark invoice as paid
   * POST /invoices/:id/pay
   */
  async markAsPaid(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      Logger.info('Marking invoice as paid', { invoiceId, businessId });

      const updated = await this.statusService.markAsPaid(invoiceId, businessId);

      sendSuccess(res, updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.markAsPaid error', new Error(errorMessage));
      sendError(res, errorMessage, 400); // 400 for business rule violations
    }
  }

  /**
   * Cancel invoice
   * POST /invoices/:id/cancel
   */
  async cancelInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      Logger.info('Cancelling invoice', { invoiceId, businessId });

      const updated = await this.statusService.cancel(invoiceId, businessId);

      sendSuccess(res, updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.cancelInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 400); // 400 for business rule violations
    }
  }

  /**
   * Delete invoice (draft only)
   * DELETE /invoices/:id
   */
  async deleteInvoice(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      Logger.info('Deleting invoice', { invoiceId, businessId });

      // Verify invoice is draft before deletion
      const currentStatus = await this.statusService.getStatus(invoiceId, businessId);
      if (currentStatus !== 'draft') {
        sendError(res, 'Only draft invoices can be deleted', 400);
        return;
      }

      const deleted = await this.invoiceService.delete(businessId, invoiceId);

      if (!deleted) {
        sendError(res, 'Failed to delete invoice', 500);
        return;
      }

      sendSuccess(res, { id: invoiceId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.deleteInvoice error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Add item to invoice (draft only)
   * POST /invoices/:id/items
   * Body: { description, quantity, unit_price, vat_percent }
   */
  async addInvoiceItem(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId) {
        sendError(res, 'Invoice ID is required', 400);
        return;
      }

      // Verify invoice exists and is draft
      const currentStatus = await this.statusService.getStatus(invoiceId, businessId);
      if (currentStatus !== 'draft') {
        sendError(res, 'Can only add items to draft invoices', 400);
        return;
      }

      const input: CreateInvoiceItemInput = request.body;

      Logger.info('Adding invoice item', { invoiceId, businessId });

      const item = await this.itemService.create(invoiceId, input);

      sendSuccess(res, item, 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.addInvoiceItem error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Update invoice item (draft only)
   * PATCH /invoices/:id/items/:itemId
   * Body: { description, quantity, unit_price, vat_percent }
   */
  async updateInvoiceItem(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;
      const itemId = request.params.itemId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId || !itemId) {
        sendError(res, 'Invoice ID and Item ID are required', 400);
        return;
      }

      // Verify invoice exists and is draft
      const currentStatus = await this.statusService.getStatus(invoiceId, businessId);
      if (currentStatus !== 'draft') {
        sendError(res, 'Can only update items on draft invoices', 400);
        return;
      }

      const input: CreateInvoiceItemInput = request.body;

      Logger.info('Updating invoice item', { invoiceId, itemId, businessId });

      const item = await this.itemService.updateItem(itemId, input);

      sendSuccess(res, item);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.updateInvoiceItem error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Delete invoice item (draft only)
   * DELETE /invoices/:id/items/:itemId
   */
  async deleteInvoiceItem(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const invoiceId = request.params.id;
      const itemId = request.params.itemId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!invoiceId || !itemId) {
        sendError(res, 'Invoice ID and Item ID are required', 400);
        return;
      }

      // Verify invoice exists and is draft
      const currentStatus = await this.statusService.getStatus(invoiceId, businessId);
      if (currentStatus !== 'draft') {
        sendError(res, 'Can only delete items from draft invoices', 400);
        return;
      }

      Logger.info('Deleting invoice item', { invoiceId, itemId, businessId });

      const deleted = await this.itemService.deleteItem(itemId);

      if (!deleted) {
        sendError(res, 'Failed to delete invoice item', 500);
        return;
      }

      sendSuccess(res, { id: itemId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('InvoiceController.deleteInvoiceItem error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }
}

export default InvoiceController;
