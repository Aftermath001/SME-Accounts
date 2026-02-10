import PDFDocument from 'pdfkit';
import { formatCurrencyKES, formatDate } from '../../utils/pdf.util';

export interface PdfHeaderFooterOptions {
  title?: string;
  subtitle?: string;
  tenantName?: string;
}

export interface PdfBuildOptions {
  margins?: { top: number; right: number; bottom: number; left: number };
}

export class BasePdfService {
  createDocument(opts?: PdfBuildOptions): PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    if (opts?.margins) {
      (doc as any).page.margins = opts.margins;
    }
    return doc;
  }

  drawHeader(doc: PDFDocument, options: PdfHeaderFooterOptions = {}): void {
    const { title, subtitle, tenantName } = options;
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(title || 'Document', { align: 'left' })
      .moveDown(0.2);

    if (subtitle) {
      doc.font('Helvetica').fontSize(10).fillColor('#666666').text(subtitle, { align: 'left' });
    }
    if (tenantName) {
      doc.moveDown(0.2).font('Helvetica').fontSize(10).fillColor('#333333').text(`Tenant: ${tenantName}`);
    }

    doc.moveDown(0.5).strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8).fillColor('#000000');
  }

  drawFooter(doc: PDFDocument): void {
    const bottom = 780;
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, bottom).lineTo(545, bottom).stroke();
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#666666')
      .text(`Generated on ${formatDate(new Date())}`, 50, bottom + 5, { align: 'left' })
      .text('SME-Accounts', 50, bottom + 5, { align: 'right' });
  }

  addKeyValue(doc: PDFDocument, label: string, value: string, opts?: { x?: number; y?: number; width?: number }): void {
    const x = opts?.x ?? 50;
    const y = opts?.y ?? doc.y;
    const width = opts?.width ?? 250;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(label, x, y, { width });
    doc.font('Helvetica').fontSize(10).fillColor('#000').text(value, x + 120, y, { width });
  }

  addTableHeader(doc: PDFDocument, headers: string[], x = 50, y?: number): number {
    const rowY = y ?? doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    const colWidth = (545 - x) / headers.length;
    headers.forEach((h, i) => doc.text(h, x + i * colWidth, rowY));
    doc.moveDown(0.5).strokeColor('#cccccc').lineWidth(1).moveTo(x, doc.y).lineTo(545, doc.y).stroke();
    return doc.y;
  }

  addTableRow(doc: PDFDocument, cols: (string | number)[], x = 50): void {
    doc.font('Helvetica').fontSize(10);
    const colWidth = (545 - x) / cols.length;
    cols.forEach((c, i) => doc.text(typeof c === 'number' ? formatCurrencyKES(c) : c, x + i * colWidth, doc.y));
    doc.moveDown(0.2);
  }
}

export default BasePdfService;
