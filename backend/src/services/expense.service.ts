import DatabaseService from './database.service';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types/domain';
import ExpenseValidationService from './expense-validation.service';
import { Logger } from '../utils/logger';

/**
 * Expense Service
 * Handles all expense data access operations
 * All queries are scoped to the current business (tenant)
 * VAT calculations managed at service layer
 */

export class ExpenseService extends DatabaseService {
  /**
   * Get expense by ID (tenant-scoped)
   */
  async getById(businessId: string, expenseId: string): Promise<Expense | null> {
    try {
      Logger.debug('Fetching expense', { expenseId, businessId });

      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch expense', error as Error);
        throw new Error(`Failed to fetch expense: ${(error as any).message}`);
      }

      return (data as Expense) || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.getById error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * List expenses for a business (tenant-scoped)
   */
  async listByBusiness(
    businessId: string,
    options?: {
      limit?: number;
      offset?: number;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Expense[]> {
    try {
      Logger.debug('Listing expenses', { businessId, options });

      let query = this.supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId);

      // Filter by category if provided
      if (options?.category) {
        query = query.eq('category', options.category);
      }

      // Filter by date range if provided
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      // Apply pagination
      if (options?.limit) {
        const offset = options?.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      // Sort by date descending
      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        Logger.error('Failed to list expenses', error as Error);
        throw new Error(`Failed to list expenses: ${(error as any).message}`);
      }

      return (data as Expense[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.listByBusiness error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get expenses by category for reporting (tenant-scoped)
   */
  async listByCategory(businessId: string, category: string): Promise<Expense[]> {
    try {
      Logger.debug('Listing expenses by category', { businessId, category });

      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) {
        Logger.error('Failed to list expenses by category', error as Error);
        throw new Error(`Failed to list expenses by category: ${(error as any).message}`);
      }

      return (data as Expense[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.listByCategory error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Create a new expense (tenant-scoped)
   * Validates input and calculates VAT automatically
   */
  async create(businessId: string, input: CreateExpenseInput): Promise<Expense> {
    try {
      Logger.info('Creating expense', { businessId, category: input.category });

      // Validate input using validation service
      ExpenseValidationService.validateCreateInput(input);

      // Calculate VAT amounts using validation service
      const vatAmount = ExpenseValidationService.calculateVatAmount(input.amount, input.vat_percent);
      const totalAmount = ExpenseValidationService.calculateTotalAmount(input.amount, input.vat_percent);

      // Determine VAT recoverability if not explicitly set
      const vatRecoverable = input.vat_recoverable !== undefined 
        ? input.vat_recoverable 
        : ExpenseValidationService.isVatRecoverable(input.category);

      const { data, error } = await this.supabase
        .from('expenses')
        .insert([
          {
            business_id: businessId,
            date: input.date,
            category: input.category,
            description: input.description || null,
            amount: input.amount,
            vat_percent: input.vat_percent,
            vat_amount: vatAmount,
            vat_recoverable: vatRecoverable,
            receipt_url: input.receipt_url || null,
            total_amount: totalAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error || !data?.[0]) {
        Logger.error('Expense creation failed', error as Error);
        throw new Error(`Failed to create expense: ${(error as any)?.message}`);
      }

      const expense = data[0] as Expense;
      Logger.info('Expense created', { expenseId: expense.id, businessId });

      return expense;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.create error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update expense details (tenant-scoped)
   * Validates input and enforces same-day edit rule
   */
  async updateExpense(
    businessId: string,
    expenseId: string,
    input: UpdateExpenseInput
  ): Promise<Expense> {
    try {
      Logger.debug('Updating expense', { expenseId, businessId });

      // Verify expense belongs to business
      const existing = await this.getById(businessId, expenseId);
      if (!existing) {
        throw new Error('Expense not found');
      }

      // Validate input and check immutability rules
      ExpenseValidationService.validateUpdateInput(input, existing.date);

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Handle amount/vat_percent changes with proper validation
      const newAmount = input.amount !== undefined ? input.amount : existing.amount;
      const newVatPercent = input.vat_percent !== undefined ? input.vat_percent : existing.vat_percent;

      if (input.amount !== undefined || input.vat_percent !== undefined) {
        const vatAmount = ExpenseValidationService.calculateVatAmount(newAmount, newVatPercent);
        const totalAmount = ExpenseValidationService.calculateTotalAmount(newAmount, newVatPercent);

        updateData.amount = newAmount;
        updateData.vat_percent = newVatPercent;
        updateData.vat_amount = vatAmount;
        updateData.total_amount = totalAmount;
      }

      // Handle category change - update VAT recoverability if not explicitly set
      if (input.category !== undefined) {
        updateData.category = input.category;
        if (input.vat_recoverable === undefined) {
          updateData.vat_recoverable = ExpenseValidationService.isVatRecoverable(input.category);
        }
      }

      // Only include other provided fields
      if (input.date !== undefined) updateData.date = input.date;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.vat_recoverable !== undefined) updateData.vat_recoverable = input.vat_recoverable;
      if (input.receipt_url !== undefined) updateData.receipt_url = input.receipt_url;

      const { data, error } = await this.supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Expense update failed', error as Error);
        throw new Error(`Failed to update expense: ${(error as any)?.message}`);
      }

      return data[0] as Expense;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.update error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete an expense (tenant-scoped)
   */
  async delete(businessId: string, expenseId: string): Promise<boolean> {
    try {
      Logger.info('Deleting expense', { expenseId, businessId });

      // Verify expense belongs to business
      const existing = await this.getById(businessId, expenseId);
      if (!existing) {
        throw new Error('Expense not found');
      }

      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('business_id', businessId);

      if (error) {
        Logger.error('Expense deletion failed', error as Error);
        throw new Error(`Failed to delete expense: ${(error as any).message}`);
      }

      Logger.info('Expense deleted', { expenseId, businessId });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.delete error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get expense summary for a date range (tenant-scoped)
   * Used for reporting and tax calculations
   */
  async getSummaryByDateRange(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalAmount: number;
    totalVatAmount: number;
    totalRecoverableVat: number;
    byCategory: Record<string, { amount: number; vatAmount: number }>;
  }> {
    try {
      Logger.debug('Getting expense summary', { businessId, startDate, endDate });

      const expenses = await this.listByBusiness(businessId, {
        startDate,
        endDate,
      });

      let totalAmount = 0;
      let totalVatAmount = 0;
      let totalRecoverableVat = 0;
      const byCategory: Record<string, { amount: number; vatAmount: number }> = {};

      expenses.forEach((expense) => {
        totalAmount += expense.amount;
        totalVatAmount += expense.vat_amount;

        if (expense.vat_recoverable) {
          totalRecoverableVat += expense.vat_amount;
        }

        if (!byCategory[expense.category]) {
          byCategory[expense.category] = { amount: 0, vatAmount: 0 };
        }

        byCategory[expense.category].amount += expense.amount;
        byCategory[expense.category].vatAmount += expense.vat_amount;
      });

      return {
        totalAmount,
        totalVatAmount,
        totalRecoverableVat,
        byCategory,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseService.getSummaryByDateRange error', new Error(errorMessage));
      throw error;
    }
  }
}

export default ExpenseService;
