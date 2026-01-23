import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ReportController from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

/**
 * Report Routes
 * All routes protected by auth + tenant middleware
 * Base path: /reports
 */

const router = Router();
const controller = new ReportController();

// Apply middleware to all report routes
// 1. authMiddleware - validates JWT and sets req.user
// 2. tenantMiddleware - resolves business context and sets req.tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /reports/profit
 * Get profit summary report for custom date range
 * Query params:
 *   - startDate: string (YYYY-MM-DD) - required
 *   - endDate: string (YYYY-MM-DD) - required
 *   - includeBreakdown: boolean (default: false)
 */
router.get('/profit', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getProfitReport(req, res);
});

/**
 * GET /reports/profit/monthly
 * Get monthly profit report
 * Query params:
 *   - year: number - required
 *   - month: number (1-12) - required
 *   - includeBreakdown: boolean (default: false)
 */
router.get('/profit/monthly', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getMonthlyProfitReport(req, res);
});

/**
 * GET /reports/vat-summary
 * Get VAT summary report for custom date range
 * Query params:
 *   - startDate: string (YYYY-MM-DD) - required
 *   - endDate: string (YYYY-MM-DD) - required
 *   - includeDetails: boolean (default: false)
 */
router.get('/vat-summary', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getVatSummary(req, res);
});

/**
 * GET /reports/vat-summary/monthly
 * Get monthly VAT return
 * Query params:
 *   - year: number - required
 *   - month: number (1-12) - required
 *   - includeDetails: boolean (default: false)
 */
router.get('/vat-summary/monthly', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getMonthlyVatReturn(req, res);
});

/**
 * GET /reports/vat-summary/export
 * Export VAT summary as CSV (KRA-ready)
 * Query params:
 *   - startDate: string (YYYY-MM-DD) - required
 *   - endDate: string (YYYY-MM-DD) - required
 *   - type: string ('summary' | 'details') - default: 'summary'
 * Response: CSV file download
 */
router.get('/vat-summary/export', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.exportVatSummary(req, res);
});

/**
 * GET /reports/vat-summary/kra
 * Get KRA-ready VAT summary for iTax
 * Query params:
 *   - startDate: string (YYYY-MM-DD) - required
 *   - endDate: string (YYYY-MM-DD) - required
 */
router.get('/vat-summary/kra', async (req: ExpressRequest, res: ExpressResponse) => {
  await controller.getKraVatSummary(req, res);
});

export default router;