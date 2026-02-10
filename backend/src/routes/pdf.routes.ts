import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import PdfController from '../controllers/pdf.controller';

const router = Router();

router.get('/invoices/:id/pdf', authMiddleware, tenantMiddleware, PdfController.getInvoicePdf);
router.get('/payments/:id/receipt/pdf', authMiddleware, tenantMiddleware, PdfController.getReceiptPdf);

export default router;
