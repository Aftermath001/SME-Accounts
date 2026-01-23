import ReportAggregationService from './report-aggregation.service';
import CsvHelper, { CsvColumn } from '../utils/csv-helper';
import { Logger } from '../utils/logger';

/**
 * VAT Report Service
 * Handles VAT summary reporting for KRA compliance
 * Responsible for:
 * - Generating VAT summaries for date ranges
 * - Monthly VAT returns
 * - Output VAT vs Input VAT calculations
 * - KRA-ready VAT reporting
 */

export interface VatSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  outputVat: {
    totalSales: number;
    vatAmount: number;
    invoiceCount: number;
  };
  inputVat: {
    totalPurchases: number;
    totalVatAmount: number;
    recoverableVatAmount: number;
    expenseCount: number;
  };
  vatPayable: number;
  vatRate: number;
}

export interface VatReportOptions {
  startDate: string;
  endDate: string;
  includeDetails?: boolean;
}

export interface VatReport {
  summary: VatSummary;
  details?: {
    salesBreakdown: Array<{
      invoiceNumber: string;
      customerName: string;
      invoiceDate: string;
      subtotal: number;
      vatAmount: number;
      total: number;
    }>;
    purchaseBreakdown: Array<{
      date: string;
      category: string;
      description: string;
      amount: number;
      vatAmount: number;
      vatRecoverable: boolean;
    }>;
  };
}

export class VatReportService {
  private aggregationService: ReportAggregationService;
  private readonly VAT_RATE = 16; // 16% VAT rate for Kenya

  constructor() {
    this.aggregationService = new ReportAggregationService();
  }

  /**
   * Generate VAT summary report
   */
  async generateVatReport(
    businessId: string,
    options: VatReportOptions
  ): Promise<VatReport> {
    try {
      Logger.info('Generating VAT report', { businessId, options });

      // Validate date range
      this.validateDateRange(options.startDate, options.endDate);

      // Get aggregated data
      const [invoiceAgg, expenseAgg] = await Promise.all([
        this.aggregationService.aggregateInvoices(businessId, options.startDate, options.endDate),
        this.aggregationService.aggregateExpenses(businessId, options.startDate, options.endDate),
      ]);

      // Calculate VAT payable
      const vatPayable = invoiceAgg.outputVat - expenseAgg.recoverableVat;

      const summary: VatSummary = {
        period: {
          startDate: options.startDate,
          endDate: options.endDate,
        },
        outputVat: {
          totalSales: invoiceAgg.totalIncome,
          vatAmount: invoiceAgg.outputVat,
          invoiceCount: invoiceAgg.invoiceCount,
        },
        inputVat: {
          totalPurchases: expenseAgg.totalExpenses,
          totalVatAmount: expenseAgg.inputVat,
          recoverableVatAmount: expenseAgg.recoverableVat,
          expenseCount: expenseAgg.expenseCount,
        },
        vatPayable: Math.round(vatPayable * 100) / 100,
        vatRate: this.VAT_RATE,
      };

      const report: VatReport = { summary };

      // Include details if requested
      if (options.includeDetails) {
        const [invoices, expenses] = await Promise.all([
          this.aggregationService.getInvoiceBreakdown(businessId, options.startDate, options.endDate),
          this.aggregationService.getExpenseBreakdown(businessId, options.startDate, options.endDate),
        ]);

        report.details = {
          salesBreakdown: invoices.map((invoice) => ({
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            invoiceDate: invoice.invoiceDate,
            subtotal: invoice.subtotal,
            vatAmount: invoice.vatTotal,
            total: invoice.grandTotal,
          })),
          purchaseBreakdown: expenses.map((expense) => ({
            date: expense.date,
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            vatAmount: expense.vatAmount,
            vatRecoverable: expense.vatRecoverable,
          })),
        };
      }

      Logger.info('VAT report generated', { businessId, vatPayable: summary.vatPayable });
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.generateVatReport error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate monthly VAT return
   */
  async generateMonthlyVatReturn(
    businessId: string,
    year: number,
    month: number,
    includeDetails = false
  ): Promise<VatReport> {
    try {
      Logger.info('Generating monthly VAT return', { businessId, year, month });

      const { startDate, endDate } = this.getMonthDateRange(year, month);

      return await this.generateVatReport(businessId, {
        startDate,
        endDate,
        includeDetails,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.generateMonthlyVatReturn error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate quarterly VAT return
   */
  async generateQuarterlyVatReturn(
    businessId: string,
    year: number,
    quarter: number,
    includeDetails = false
  ): Promise<VatReport> {
    try {
      Logger.info('Generating quarterly VAT return', { businessId, year, quarter });

      const { startDate, endDate } = this.getQuarterDateRange(year, quarter);

      return await this.generateVatReport(businessId, {
        startDate,
        endDate,
        includeDetails,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.generateQuarterlyVatReturn error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get KRA-ready VAT summary for iTax
   * Formats data according to KRA requirements
   */
  async getKraVatSummary(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    taxPeriod: string;
    totalSales: number;
    outputVat: number;
    totalPurchases: number;
    inputVat: number;
    vatPayable: number;
    vatRefund: number;
  }> {
    try {
      Logger.info('Generating KRA VAT summary', { businessId, startDate, endDate });

      const report = await this.generateVatReport(businessId, { startDate, endDate });

      const vatPayable = report.summary.vatPayable;
      const vatRefund = vatPayable < 0 ? Math.abs(vatPayable) : 0;
      const netVatPayable = vatPayable > 0 ? vatPayable : 0;

      return {
        taxPeriod: this.formatTaxPeriod(startDate, endDate),
        totalSales: report.summary.outputVat.totalSales,
        outputVat: report.summary.outputVat.vatAmount,
        totalPurchases: report.summary.inputVat.totalPurchases,
        inputVat: report.summary.inputVat.recoverableVatAmount,
        vatPayable: netVatPayable,
        vatRefund,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.getKraVatSummary error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Format tax period for KRA reporting
   */
  private formatTaxPeriod(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if it's a full month
    const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    if (start.getTime() === startOfMonth.getTime() && end.getTime() === endOfMonth.getTime()) {
      return `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    return `${startDate} to ${endDate}`;
  }

  /**
   * Get month date range
   */
  private getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    return { startDate, endDate };
  }

  /**
   * Get quarter date range
   */
  private getQuarterDateRange(year: number, quarter: number): { startDate: string; endDate: string } {
    if (quarter < 1 || quarter > 4) {
      throw new Error('Quarter must be between 1 and 4');
    }

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    const startDate = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, endMonth, 0).getDate();
    const endDate = `${year}-${endMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    return { startDate, endDate };
  }

  /**
   * Generate VAT summary CSV export (KRA-ready)
   */
  async generateVatSummaryCsv(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{ csv: string; filename: string }> {
    try {
      Logger.info('Generating VAT summary CSV', { businessId, startDate, endDate });

      const report = await this.generateVatReport(businessId, {
        startDate,
        endDate,
        includeDetails: true,
      });

      // VAT Summary data
      const summaryData = [
        {
          description: 'Total Sales (Excl. VAT)',
          amount: report.summary.outputVat.totalSales,
          vatAmount: 0,
          category: 'Output',
        },
        {
          description: 'Output VAT',
          amount: 0,
          vatAmount: report.summary.outputVat.vatAmount,
          category: 'Output',
        },
        {
          description: 'Total Purchases (Excl. VAT)',
          amount: report.summary.inputVat.totalPurchases,
          vatAmount: 0,
          category: 'Input',
        },
        {
          description: 'Input VAT (Recoverable)',
          amount: 0,
          vatAmount: report.summary.inputVat.recoverableVatAmount,
          category: 'Input',
        },
        {
          description: 'VAT Payable',
          amount: 0,
          vatAmount: report.summary.vatPayable,
          category: 'Summary',
        },
      ];

      const columns: CsvColumn[] = [
        { header: 'Description', key: 'description' },
        { header: 'Amount (KES)', key: 'amount', formatter: (val) => CsvHelper.formatNumber(val) },
        { header: 'VAT Amount (KES)', key: 'vatAmount', formatter: (val) => CsvHelper.formatNumber(val) },
        { header: 'Category', key: 'category' },
      ];

      const csv = CsvHelper.arrayToCsv(summaryData, columns);
      const filename = CsvHelper.generateFilename('VAT_Summary', startDate, endDate);

      Logger.info('VAT summary CSV generated', { businessId, filename });
      return { csv, filename };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.generateVatSummaryCsv error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate detailed VAT transactions CSV export
   */
  async generateVatDetailsCsv(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{ csv: string; filename: string }> {
    try {
      Logger.info('Generating VAT details CSV', { businessId, startDate, endDate });

      const report = await this.generateVatReport(businessId, {
        startDate,
        endDate,
        includeDetails: true,
      });

      if (!report.details) {
        throw new Error('Report details not available');
      }

      // Combine sales and purchases into one dataset
      const transactions = [
        ...report.details.salesBreakdown.map((sale) => ({
          date: sale.invoiceDate,
          type: 'Sale',
          reference: sale.invoiceNumber,
          description: `Invoice to ${sale.customerName}`,
          amount: sale.subtotal,
          vatAmount: sale.vatAmount,
          total: sale.total,
          vatRecoverable: 'N/A',
        })),
        ...report.details.purchaseBreakdown.map((purchase) => ({
          date: purchase.date,
          type: 'Purchase',
          reference: purchase.category,
          description: purchase.description || purchase.category,
          amount: purchase.amount,
          vatAmount: purchase.vatAmount,
          total: purchase.amount + purchase.vatAmount,
          vatRecoverable: CsvHelper.formatBoolean(purchase.vatRecoverable),
        })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const columns: CsvColumn[] = [
        { header: 'Date', key: 'date', formatter: CsvHelper.formatDate },
        { header: 'Type', key: 'type' },
        { header: 'Reference', key: 'reference' },
        { header: 'Description', key: 'description' },
        { header: 'Amount (KES)', key: 'amount', formatter: (val) => CsvHelper.formatNumber(val) },
        { header: 'VAT Amount (KES)', key: 'vatAmount', formatter: (val) => CsvHelper.formatNumber(val) },
        { header: 'Total (KES)', key: 'total', formatter: (val) => CsvHelper.formatNumber(val) },
        { header: 'VAT Recoverable', key: 'vatRecoverable' },
      ];

      const csv = CsvHelper.arrayToCsv(transactions, columns);
      const filename = CsvHelper.generateFilename('VAT_Details', startDate, endDate);

      Logger.info('VAT details CSV generated', { businessId, filename, transactionCount: transactions.length });
      return { csv, filename };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('VatReportService.generateVatDetailsCsv error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Validate date range
   */
  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    // Prevent reports for future dates
    const today = new Date();
    if (start > today) {
      throw new Error('Start date cannot be in the future');
    }
  }
}

export default VatReportService;