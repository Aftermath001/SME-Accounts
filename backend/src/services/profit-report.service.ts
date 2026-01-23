import ReportAggregationService, { ProfitSummary } from './report-aggregation.service';
import { Logger } from '../utils/logger';

/**
 * Profit Report Service
 * Handles profit summary reporting
 * Responsible for:
 * - Generating profit summaries for date ranges
 * - Monthly profit reports
 * - Custom date range reports
 * - Profit trend analysis
 */

export interface ProfitReportOptions {
  startDate: string;
  endDate: string;
  includeBreakdown?: boolean;
}

export interface ProfitReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: ProfitSummary;
  breakdown?: {
    invoices: Array<{
      invoiceNumber: string;
      customerName: string;
      invoiceDate: string;
      subtotal: number;
      vatTotal: number;
      grandTotal: number;
      status: string;
    }>;
    expenses: Array<{
      date: string;
      category: string;
      description: string;
      amount: number;
      vatAmount: number;
      vatRecoverable: boolean;
      totalAmount: number;
    }>;
  };
}

export class ProfitReportService {
  private aggregationService: ReportAggregationService;

  constructor() {
    this.aggregationService = new ReportAggregationService();
  }

  /**
   * Generate profit report for custom date range
   */
  async generateProfitReport(
    businessId: string,
    options: ProfitReportOptions
  ): Promise<ProfitReport> {
    try {
      Logger.info('Generating profit report', { businessId, options });

      // Validate date range
      this.validateDateRange(options.startDate, options.endDate);

      // Get profit summary
      const summary = await this.aggregationService.computeProfitSummary(
        businessId,
        options.startDate,
        options.endDate
      );

      const report: ProfitReport = {
        period: {
          startDate: options.startDate,
          endDate: options.endDate,
        },
        summary,
      };

      // Include breakdown if requested
      if (options.includeBreakdown) {
        const [invoices, expenses] = await Promise.all([
          this.aggregationService.getInvoiceBreakdown(businessId, options.startDate, options.endDate),
          this.aggregationService.getExpenseBreakdown(businessId, options.startDate, options.endDate),
        ]);

        report.breakdown = {
          invoices,
          expenses,
        };
      }

      Logger.info('Profit report generated', { businessId, reportPeriod: report.period });
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ProfitReportService.generateProfitReport error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate monthly profit report
   */
  async generateMonthlyReport(
    businessId: string,
    year: number,
    month: number,
    includeBreakdown = false
  ): Promise<ProfitReport> {
    try {
      Logger.info('Generating monthly profit report', { businessId, year, month });

      const { startDate, endDate } = this.getMonthDateRange(year, month);

      return await this.generateProfitReport(businessId, {
        startDate,
        endDate,
        includeBreakdown,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ProfitReportService.generateMonthlyReport error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate quarterly profit report
   */
  async generateQuarterlyReport(
    businessId: string,
    year: number,
    quarter: number,
    includeBreakdown = false
  ): Promise<ProfitReport> {
    try {
      Logger.info('Generating quarterly profit report', { businessId, year, quarter });

      const { startDate, endDate } = this.getQuarterDateRange(year, quarter);

      return await this.generateProfitReport(businessId, {
        startDate,
        endDate,
        includeBreakdown,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ProfitReportService.generateQuarterlyReport error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Generate yearly profit report
   */
  async generateYearlyReport(
    businessId: string,
    year: number,
    includeBreakdown = false
  ): Promise<ProfitReport> {
    try {
      Logger.info('Generating yearly profit report', { businessId, year });

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      return await this.generateProfitReport(businessId, {
        startDate,
        endDate,
        includeBreakdown,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ProfitReportService.generateYearlyReport error', new Error(errorMessage));
      throw error;
    }
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

export default ProfitReportService;