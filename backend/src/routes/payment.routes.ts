import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { rawBodyMiddleware } from '../middleware/raw-body.middleware';

const router = Router();

// Initiate STK Push (authenticated)
router.post('/payments/mpesa/initiate', authMiddleware, tenantMiddleware, PaymentController.initiateMpesa);

// M-Pesa Callback (public, requires raw body)
router.post('/payments/mpesa/callback', rawBodyMiddleware, PaymentController.mpesaCallback);

// Get payments for an invoice (authenticated)
router.get('/invoices/:invoiceId/payments', authMiddleware, tenantMiddleware, PaymentController.getPaymentsForInvoice);

export default router;
