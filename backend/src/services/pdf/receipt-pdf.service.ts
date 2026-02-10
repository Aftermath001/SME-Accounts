import PDFDocument from 'pdfkit';
import supabaseAdmin from '../../config/supabase';
import { BasePdfService } from './pdf.base';
import { formatCurrencyKES, formatDate } from '../../utils/pdf.util';
import { Payment, PaymentMethod, PaymentStatus } from '../../models/payment.model';

interface ReceiptViewModel {
  id: string;
  tenant_id: string;
  invoice_id: string;
  receipt_number: string;
  amount: number;
  method: PaymentMethod;
  mpesa_reference?: string | null;
  created_at: string;
  invoice_number: string;
  business_name: string;
}

export class ReceiptPdfService extends BasePdfService {
  private paymentsTable = 'payments';
  private invoicesTable = 'invoices';
  private businessesTable = 'businesses';

  private buildReceiptNumber(payment: Payment): string {
    // Simple format: RCT-YYYYMMDD-XXXX (last 4 of id)
    const date = new Date(payment.created_at);
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    const suffix = payment.id.replace(/-/g, '').slice(-6).toUpperCase();
    return `RCT-${y}${m}${d}-${suffix}`;
  }

  async getReceiptForTenant(tenant_id: string, payment_id: string): Promise<ReceiptViewModel> {
    const { data: payment, error: payErr } = await supabaseAdmin
      .from(this.paymentsTable)
      .select('*')
      .eq('id', payment_id)
      .eq('tenant_id', tenant_id)
      .single();
    if (payErr || !payment) throw new Error('Payment not found');
    if (payment.status !== PaymentStatus.SUCCESS) throw new Error('Receipt available for successful payments only');

    const { data: invoice } = await supabaseAdmin
      .from(this.invoicesTable)
      .select('number, business_id')
      .eq('id', payment.invoice_id)
      .single();

    const { data: business } = await supabaseAdmin
      .from(this.businessesTable)
      .select('name')
      .eq('id', (invoice as any).business_id)
      .single();

    return {
      id: payment.id,
      tenant_id: payment.tenant_id,
      invoice_id: payment.invoice_id,
      receipt_number: this.buildReceiptNumber(payment as Payment),
      amount: Number(payment.amount),
      method: payment.method as PaymentMethod,
      mpesa_reference: payment.mpesa_reference,
      created_at: payment.created_at,
      invoice_number: (invoice as any)?.number || payment.invoice_id,
      business_name: (business as any)?.name || 'Business',
    };
  }

  async generateReceiptPdf(tenant_id: string, payment_id: string): Promise<Buffer> {
    const vm = await this.getReceiptForTenant(tenant_id, payment_id);
    const doc: PDFDocument = this.createDocument();

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    this.drawHeader(doc, { title: 'PAYMENT RECEIPT', subtitle: vm.receipt_number, tenantName: vm.business_name });

    this.addKeyValue(doc, 'Receipt Number:', vm.receipt_number);
    this.addKeyValue(doc, 'Invoice Number:', vm.invoice_number);
    this.addKeyValue(doc, 'Amount Paid:', formatCurrencyKES(vm.amount));
    this.addKeyValue(doc, 'Payment Method:', vm.method);
    if (vm.method === PaymentMethod.MPESA && vm.mpesa_reference) {
      this.addKeyValue(doc, 'M-Pesa Receipt:', vm.mpesa_reference);
    }
    this.addKeyValue(doc, 'Payment Date:', formatDate(vm.created_at));

    this.drawFooter(doc);

    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  }
}

export default ReceiptPdfService;
