import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import InvoiceController from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

/**
 * Invoice Routes
 * All routes protected by auth + tenant middleware
 * Base path: /invoices
 */

const router = Router();
const controller = new InvoiceController();

// Apply middleware to all invoice routes
// 1. authMiddleware - validates JWT and sets req.user
// 2. tenantMiddleware - resolves business context and sets req.tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * POST /invoices
 * Create a new invoice with items
 * Body: {
 *   invoice_number: string,
 *   customer_id: string,
 *   invoice_date: string (ISO 8601),
 *   due_date: string (ISO 8601),
 *   items: Array<{ description, quantity, unit_price, vat_percent }>,
 *   notes?: string
 * }
 */
router.post('/', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.createInvoice(req, res);
});

/**
 * GET /invoices
 * List invoices for current business (tenant-scoped)
 * Query params:
 *   - status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' (optional)
 *   - customerId: string (optional)
 *   - limit: number (default: 50, max: 500)
 *   - offset: number (default: 0)
 */
router.get('/', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.listInvoices(req, res);
});

/**
 * GET /invoices/:id
 * Get single invoice with line items and VAT breakdown
 */
router.get('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getInvoice(req, res);
});

/**
 * PATCH /invoices/:id
 * Update invoice (draft only)
 * Body: {
 *   due_date?: string,
 *   notes?: string
 * }
 * Note: Cannot change invoice_number or customer_id after creation
 */
router.patch('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.updateInvoice(req, res);
});

/**
 * POST /invoices/:id/send
 * Transition invoice from draft → sent
 * Sets sent_at timestamp
 */
router.post('/:id/send', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.sendInvoice(req, res);
});

/**
 * POST /invoices/:id/pay
 * Transition invoice from sent/overdue → paid
 * Sets paid_at timestamp
 */
router.post('/:id/pay', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.markAsPaid(req, res);
});

/**
 * POST /invoices/:id/cancel
 * Transition invoice to cancelled status
 * Allowed from draft or sent status
 */
router.post('/:id/cancel', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.cancelInvoice(req, res);
});

/**
 * DELETE /invoices/:id
 * Delete invoice (draft only)
 * Removes invoice and all associated items
 */
router.delete('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.deleteInvoice(req, res);
});

/**
 * POST /invoices/:id/items
 * Add item to invoice (draft only)
 * Body: { description, quantity, unit_price, vat_percent }
 */
router.post('/:id/items', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.addInvoiceItem(req, res);
});

/**
 * PATCH /invoices/:id/items/:itemId
 * Update invoice item (draft only)
 * Body: { description, quantity, unit_price, vat_percent }
 */
router.patch('/:id/items/:itemId', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.updateInvoiceItem(req, res);
});

/**
 * DELETE /invoices/:id/items/:itemId
 * Delete invoice item (draft only)
 * Automatically recalculates invoice totals
 */
router.delete('/:id/items/:itemId', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.deleteInvoiceItem(req, res);
});

export default router;
