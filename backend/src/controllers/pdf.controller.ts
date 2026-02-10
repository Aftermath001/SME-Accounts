import { Request, Response } from 'express';
import InvoicePdfService from '../services/pdf/invoice-pdf.service';
import ReceiptPdfService from '../services/pdf/receipt-pdf.service';

const invoicePdfService = new InvoicePdfService();
const receiptPdfService = new ReceiptPdfService();

export class PdfController {
  static async getInvoicePdf(req: Request, res: Response): Promise<void> {
    const tenant_id = (req as any).tenant?.id as string;
    if (!tenant_id) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const invoice_id = req.params.id;
    if (!invoice_id) {
      res.status(400).json({ success: false, error: { message: 'Invoice id required' } });
      return;
    }

    const pdf = await invoicePdfService.generateInvoicePdf(tenant_id, invoice_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice_id}.pdf`);
    res.status(200).send(pdf);
  }

  static async getReceiptPdf(req: Request, res: Response): Promise<void> {
    const tenant_id = (req as any).tenant?.id as string;
    if (!tenant_id) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const payment_id = req.params.id;
    if (!payment_id) {
      res.status(400).json({ success: false, error: { message: 'Payment id required' } });
      return;
    }

    const pdf = await receiptPdfService.generateReceiptPdf(tenant_id, payment_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${payment_id}.pdf`);
    res.status(200).send(pdf);
  }
}

export default PdfController;
