import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ProfitReportService from '../services/profit-report.service';
import VatReportService from '../services/vat-report.service';
import CsvHelper from '../utils/csv-helper';
import { Logger } from '../utils/logger';
import { sendError, sendSuccess } from '../utils/response';

/**
 * Report Controller
 * HTTP request handlers for reporting operations
 * Delegates to report services, enforces tenant isolation
 */

export class ReportController {
  private profitReportService = new ProfitReportService();
  private vatReportService = new VatReportService();

  /**
   * Get profit summary report
   * GET /reports/profit?startDate=2024-01-01&endDate=2024-01-31&includeBreakdown=true
   */
  async getProfitReport(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const startDate = request.query.startDate as string;
      const endDate = request.query.endDate as string;
      const includeBreakdown = request.query.includeBreakdown === 'true';

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate query parameters are required', 400);
        return;
      }

      Logger.info('Generating profit report', { businessId, startDate, endDate, includeBreakdown });

      const report = await this.profitReportService.generateProfitReport(businessId, {
        startDate,
        endDate,
        includeBreakdown,
      });

      sendSuccess(res, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.getProfitReport error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Get monthly profit report
   * GET /reports/profit/monthly?year=2024&month=1&includeBreakdown=false
   */
  async getMonthlyProfitReport(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const year = parseInt(request.query.year as string, 10);
      const month = parseInt(request.query.month as string, 10);
      const includeBreakdown = request.query.includeBreakdown === 'true';

      if (!year || !month) {
        sendError(res, 'year and month query parameters are required', 400);
        return;
      }

      Logger.info('Generating monthly profit report', { businessId, year, month, includeBreakdown });

      const report = await this.profitReportService.generateMonthlyReport(
        businessId,
        year,
        month,
        includeBreakdown
      );

      sendSuccess(res, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.getMonthlyProfitReport error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Get VAT summary report
   * GET /reports/vat-summary?startDate=2024-01-01&endDate=2024-01-31&includeDetails=true
   */
  async getVatSummary(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const startDate = request.query.startDate as string;
      const endDate = request.query.endDate as string;
      const includeDetails = request.query.includeDetails === 'true';

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate query parameters are required', 400);
        return;
      }

      Logger.info('Generating VAT summary', { businessId, startDate, endDate, includeDetails });

      const report = await this.vatReportService.generateVatReport(businessId, {
        startDate,
        endDate,
        includeDetails,
      });

      sendSuccess(res, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.getVatSummary error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Get monthly VAT return
   * GET /reports/vat-summary/monthly?year=2024&month=1&includeDetails=false
   */
  async getMonthlyVatReturn(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const year = parseInt(request.query.year as string, 10);
      const month = parseInt(request.query.month as string, 10);
      const includeDetails = request.query.includeDetails === 'true';

      if (!year || !month) {
        sendError(res, 'year and month query parameters are required', 400);
        return;
      }

      Logger.info('Generating monthly VAT return', { businessId, year, month, includeDetails });

      const report = await this.vatReportService.generateMonthlyVatReturn(
        businessId,
        year,
        month,
        includeDetails
      );

      sendSuccess(res, report);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.getMonthlyVatReturn error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Export VAT summary as CSV
   * GET /reports/vat-summary/export?startDate=2024-01-01&endDate=2024-01-31&type=summary
   */
  async exportVatSummary(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const startDate = request.query.startDate as string;
      const endDate = request.query.endDate as string;
      const exportType = (request.query.type as string) || 'summary'; // 'summary' or 'details'

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate query parameters are required', 400);
        return;
      }

      Logger.info('Exporting VAT summary CSV', { businessId, startDate, endDate, exportType });

      let csvData: { csv: string; filename: string };

      if (exportType === 'details') {
        csvData = await this.vatReportService.generateVatDetailsCsv(businessId, startDate, endDate);
      } else {
        csvData = await this.vatReportService.generateVatSummaryCsv(businessId, startDate, endDate);
      }

      // Set CSV headers
      CsvHelper.setCsvHeaders(res, csvData.filename);

      // Send CSV content
      res.send(csvData.csv);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.exportVatSummary error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Get KRA-ready VAT summary
   * GET /reports/vat-summary/kra?startDate=2024-01-01&endDate=2024-01-31
   */
  async getKraVatSummary(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const startDate = request.query.startDate as string;
      const endDate = request.query.endDate as string;

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate query parameters are required', 400);
        return;
      }

      Logger.info('Generating KRA VAT summary', { businessId, startDate, endDate });

      const kraSummary = await this.vatReportService.getKraVatSummary(businessId, startDate, endDate);

      sendSuccess(res, kraSummary);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportController.getKraVatSummary error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }
}

export default ReportController;