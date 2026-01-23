import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ExpenseController from '../controllers/expense.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

/**
 * Expense Routes
 * All routes protected by auth + tenant middleware
 * Base path: /expenses
 */

const router = Router();
const controller = new ExpenseController();

// Apply middleware to all expense routes
// 1. authMiddleware - validates JWT and sets req.user
// 2. tenantMiddleware - resolves business context and sets req.tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /expenses/categories
 * Get available expense categories
 * Must come before /:id route
 */
router.get('/categories', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getCategories(req, res);
});

/**
 * POST /expenses
 * Create a new expense
 * Body: {
 *   date: string (YYYY-MM-DD),
 *   category: string,
 *   description?: string,
 *   amount: number,
 *   vat_percent: number,
 *   vat_recoverable?: boolean,
 *   receipt_url?: string
 * }
 */
router.post('/', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.createExpense(req, res);
});

/**
 * GET /expenses
 * List expenses for current business (tenant-scoped)
 * Query params:
 *   - category: string (optional)
 *   - startDate: string YYYY-MM-DD (optional)
 *   - endDate: string YYYY-MM-DD (optional)
 *   - limit: number (default: 50, max: 500)
 *   - offset: number (default: 0)
 */
router.get('/', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.listExpenses(req, res);
});

/**
 * GET /expenses/:id
 * Get single expense by ID
 */
router.get('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getExpense(req, res);
});

/**
 * PATCH /expenses/:id
 * Update expense (same-day only)
 * Body: {
 *   date?: string,
 *   category?: string,
 *   description?: string,
 *   amount?: number,
 *   vat_percent?: number,
 *   vat_recoverable?: boolean,
 *   receipt_url?: string
 * }
 */
router.patch('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.updateExpense(req, res);
});

/**
 * DELETE /expenses/:id
 * Delete expense
 */
router.delete('/:id', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.deleteExpense(req, res);
});

export default router;