import PDFDocument from 'pdfkit';
import supabaseAdmin from '../../config/supabase';
import { BasePdfService } from './pdf.base';
import { formatCurrencyKES, formatDate } from '../../utils/pdf.util';

interface InvoiceItemRow {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceViewModel {
  id: string;
  invoice_number: string;
  tenant_id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  business_name: string;
  issue_date: string;
  status: string;
  subtotal: number;
  vat: number;
  total: number;
  items: InvoiceItemRow[];
}

export class InvoicePdfService extends BasePdfService {
  private invoicesTable = 'invoices';
  private invoiceItemsTable = 'invoice_items';
  private customersTable = 'customers';
  private businessesTable = 'businesses';

  async getInvoiceForTenant(tenant_id: string, invoice_id: string): Promise<InvoiceViewModel> {
    // Fetch invoice
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from(this.invoicesTable)
      .select('id, tenant_id, number, issue_date, status, total')
      .eq('id', invoice_id)
      .eq('tenant_id', tenant_id)
      .single();
    if (invErr || !invoice) throw new Error('Invoice not found');

    // Fetch items
    const { data: itemsData, error: itemsErr } = await supabaseAdmin
      .from(this.invoiceItemsTable)
      .select('description, quantity, unit_price, total')
      .eq('invoice_id', invoice_id);
    if (itemsErr) throw itemsErr;

    // Fetch customer and business references
    const { data: customerData } = await supabaseAdmin
      .from(this.customersTable)
      .select('name, email, phone')
      .eq('id', (invoice as any).customer_id)
      .single();

    const { data: businessData } = await supabaseAdmin
      .from(this.businessesTable)
      .select('name')
      .eq('id', (invoice as any).business_id)
      .single();

    const subtotal = (itemsData ?? []).reduce((acc: number, i: any) => acc + Number(i.unit_price) * Number(i.quantity), 0);
    const vat = Number((subtotal * 0.16).toFixed(2));
    const total = Number((subtotal + vat).toFixed(2));

    return {
      id: invoice.id,
      tenant_id: invoice.tenant_id,
      invoice_number: (invoice as any).number,
      customer_name: customerData?.name || 'Customer',
      customer_email: customerData?.email || null,
      customer_phone: customerData?.phone || null,
      business_name: businessData?.name || 'Business',
      issue_date: invoice.issue_date,
      status: invoice.status,
      subtotal,
      vat,
      total,
      items: (itemsData ?? []).map((i: any) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        total: Number(i.total),
      })),
    };
  }

  async generateInvoicePdf(tenant_id: string, invoice_id: string): Promise<Buffer> {
    const vm = await this.getInvoiceForTenant(tenant_id, invoice_id);
    const doc: PDFDocument = this.createDocument();

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    this.drawHeader(doc, { title: 'TAX INVOICE', subtitle: `Invoice #${vm.invoice_number}`, tenantName: vm.business_name });

    // Parties
    doc.moveDown(0.5);
    this.addKeyValue(doc, 'Invoice Number:', vm.invoice_number);
    this.addKeyValue(doc, 'Issue Date:', formatDate(vm.issue_date));
    this.addKeyValue(doc, 'Status:', vm.status);

    doc.moveDown(0.5);
    this.addKeyValue(doc, 'Bill To:', vm.customer_name);
    if (vm.customer_email) this.addKeyValue(doc, 'Email:', vm.customer_email);
    if (vm.customer_phone) this.addKeyValue(doc, 'Phone:', vm.customer_phone);

    // Items table
    doc.moveDown(1);
    this.addTableHeader(doc, ['Description', 'Qty', 'Unit Price', 'Total']);
    vm.items.forEach((item) => {
      this.addTableRow(doc, [item.description, item.quantity.toString(), formatCurrencyKES(item.unit_price), item.total]);
    });

    // Totals
    doc.moveDown(1);
    const x = 300;
    doc.font('Helvetica-Bold').text('Subtotal:', x, doc.y);
    doc.font('Helvetica').text(formatCurrencyKES(vm.subtotal), x + 120, doc.y);
    doc.font('Helvetica-Bold').text('VAT (16%):', x, doc.y + 15);
    doc.font('Helvetica').text(formatCurrencyKES(vm.vat), x + 120, doc.y + 15);
    doc.font('Helvetica-Bold').text('Total:', x, doc.y + 30);
    doc.font('Helvetica').text(formatCurrencyKES(vm.total), x + 120, doc.y + 30);

    // Footer
    this.drawFooter(doc);

    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  }
}

export default InvoicePdfService;
