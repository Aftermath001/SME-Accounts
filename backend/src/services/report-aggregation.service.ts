import DatabaseService from './database.service';
import { Logger } from '../utils/logger';

/**
 * Report Aggregation Service
 * Handles data aggregation for reporting purposes
 * Responsible for:
 * - Aggregating invoices by date range
 * - Aggregating expenses by date range
 * - Computing totals, VAT amounts, and profit metrics
 * - Ensuring tenant isolation in all queries
 */

export interface InvoiceAggregation {
  totalIncome: number;
  outputVat: number;
  invoiceCount: number;
}

export interface ExpenseAggregation {
  totalExpenses: number;
  inputVat: number;
  recoverableVat: number;
  expenseCount: number;
}

export interface ProfitSummary {
  totalIncome: number;
  totalExpenses: number;
  grossProfit: number;
  outputVat: number;
  inputVat: number;
  vatPayable: number;
  invoiceCount: number;
  expenseCount: number;
}

export class ReportAggregationService extends DatabaseService {
  /**
   * Aggregate invoices for a date range (tenant-scoped)
   * Only includes sent and paid invoices
   */
  async aggregateInvoices(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<InvoiceAggregation> {
    try {
      Logger.debug('Aggregating invoices', { businessId, startDate, endDate });

      const { data, error } = await this.supabase
        .from('invoices')
        .select('subtotal, vat_total, status')
        .eq('business_id', businessId)
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .in('status', ['sent', 'paid']); // Only include invoices that generate revenue

      if (error) {
        Logger.error('Failed to aggregate invoices', error as Error);
        throw new Error(`Failed to aggregate invoices: ${(error as any).message}`);
      }

      const invoices = data || [];

      const totalIncome = invoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
      const outputVat = invoices.reduce((sum, invoice) => sum + invoice.vat_total, 0);

      const aggregation: InvoiceAggregation = {
        totalIncome: Math.round(totalIncome * 100) / 100,
        outputVat: Math.round(outputVat * 100) / 100,
        invoiceCount: invoices.length,
      };

      Logger.debug('Invoice aggregation completed', { businessId, aggregation });
      return aggregation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportAggregationService.aggregateInvoices error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Aggregate expenses for a date range (tenant-scoped)
   * Separates total VAT from recoverable VAT
   */
  async aggregateExpenses(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<ExpenseAggregation> {
    try {
      Logger.debug('Aggregating expenses', { businessId, startDate, endDate });

      const { data, error } = await this.supabase
        .from('expenses')
        .select('amount, vat_amount, vat_recoverable')
        .eq('business_id', businessId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        Logger.error('Failed to aggregate expenses', error as Error);
        throw new Error(`Failed to aggregate expenses: ${(error as any).message}`);
      }

      const expenses = data || [];

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const inputVat = expenses.reduce((sum, expense) => sum + expense.vat_amount, 0);
      const recoverableVat = expenses.reduce((sum, expense) => {
        return expense.vat_recoverable ? sum + expense.vat_amount : sum;
      }, 0);

      const aggregation: ExpenseAggregation = {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        inputVat: Math.round(inputVat * 100) / 100,
        recoverableVat: Math.round(recoverableVat * 100) / 100,
        expenseCount: expenses.length,
      };

      Logger.debug('Expense aggregation completed', { businessId, aggregation });
      return aggregation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportAggregationService.aggregateExpenses error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Compute complete profit summary for a date range
   * Combines invoice and expense aggregations
   */
  async computeProfitSummary(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<ProfitSummary> {
    try {
      Logger.info('Computing profit summary', { businessId, startDate, endDate });

      // Aggregate invoices and expenses in parallel
      const [invoiceAgg, expenseAgg] = await Promise.all([
        this.aggregateInvoices(businessId, startDate, endDate),
        this.aggregateExpenses(businessId, startDate, endDate),
      ]);

      // Calculate derived metrics
      const grossProfit = invoiceAgg.totalIncome - expenseAgg.totalExpenses;
      const vatPayable = invoiceAgg.outputVat - expenseAgg.recoverableVat;

      const summary: ProfitSummary = {
        totalIncome: invoiceAgg.totalIncome,
        totalExpenses: expenseAgg.totalExpenses,
        grossProfit: Math.round(grossProfit * 100) / 100,
        outputVat: invoiceAgg.outputVat,
        inputVat: expenseAgg.inputVat,
        vatPayable: Math.round(vatPayable * 100) / 100,
        invoiceCount: invoiceAgg.invoiceCount,
        expenseCount: expenseAgg.expenseCount,
      };

      Logger.info('Profit summary computed', { businessId, summary });
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportAggregationService.computeProfitSummary error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get detailed invoice breakdown for reporting
   * Returns individual invoice data for transparency
   */
  async getInvoiceBreakdown(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    invoiceNumber: string;
    customerName: string;
    invoiceDate: string;
    subtotal: number;
    vatTotal: number;
    grandTotal: number;
    status: string;
  }>> {
    try {
      Logger.debug('Getting invoice breakdown', { businessId, startDate, endDate });

      const { data, error } = await this.supabase
        .from('invoices')
        .select(`
          invoice_number,
          invoice_date,
          subtotal,
          vat_total,
          grand_total,
          status,
          customers!inner(name)
        `)
        .eq('business_id', businessId)
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .in('status', ['sent', 'paid'])
        .order('invoice_date', { ascending: false });

      if (error) {
        Logger.error('Failed to get invoice breakdown', error as Error);
        throw new Error(`Failed to get invoice breakdown: ${(error as any).message}`);
      }

      return (data || []).map((invoice: any) => ({
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customers?.name || 'Unknown',
        invoiceDate: invoice.invoice_date,
        subtotal: invoice.subtotal,
        vatTotal: invoice.vat_total,
        grandTotal: invoice.grand_total,
        status: invoice.status,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportAggregationService.getInvoiceBreakdown error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get detailed expense breakdown for reporting
   * Returns individual expense data for transparency
   */
  async getExpenseBreakdown(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    date: string;
    category: string;
    description: string;
    amount: number;
    vatAmount: number;
    vatRecoverable: boolean;
    totalAmount: number;
  }>> {
    try {
      Logger.debug('Getting expense breakdown', { businessId, startDate, endDate });

      const { data, error } = await this.supabase
        .from('expenses')
        .select('date, category, description, amount, vat_amount, vat_recoverable, total_amount')
        .eq('business_id', businessId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        Logger.error('Failed to get expense breakdown', error as Error);
        throw new Error(`Failed to get expense breakdown: ${(error as any).message}`);
      }

      return (data || []).map((expense) => ({
        date: expense.date,
        category: expense.category,
        description: expense.description || '',
        amount: expense.amount,
        vatAmount: expense.vat_amount,
        vatRecoverable: expense.vat_recoverable,
        totalAmount: expense.total_amount,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ReportAggregationService.getExpenseBreakdown error', new Error(errorMessage));
      throw error;
    }
  }
}

export default ReportAggregationService;