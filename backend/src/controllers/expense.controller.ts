import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import ExpenseService from '../services/expense.service';
import { CreateExpenseInput, UpdateExpenseInput } from '../types/domain';
import { EXPENSE_CATEGORIES } from '../constants/expense-categories';
import { Logger } from '../utils/logger';
import { sendError, sendSuccess } from '../utils/response';

/**
 * Expense Controller
 * HTTP request handlers for expense operations
 * Delegates to services, enforces tenant isolation
 */

export class ExpenseController {
  private expenseService = new ExpenseService();

  /**
   * Create a new expense
   * POST /expenses
   * Body: { date, category, description?, amount, vat_percent, vat_recoverable?, receipt_url? }
   */
  async createExpense(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const input: CreateExpenseInput = request.body;

      Logger.info('Creating expense', { businessId, category: input.category });

      const expense = await this.expenseService.create(businessId, input);

      sendSuccess(res, expense, 201);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.createExpense error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * List expenses for current business
   * GET /expenses?category=meals&startDate=2024-01-01&endDate=2024-01-31&limit=50&offset=0
   */
  async listExpenses(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      const category = request.query.category as string | undefined;
      const startDate = request.query.startDate as string | undefined;
      const endDate = request.query.endDate as string | undefined;
      const limit = request.query.limit ? parseInt(request.query.limit as string, 10) : 50;
      const offset = request.query.offset ? parseInt(request.query.offset as string, 10) : 0;

      Logger.debug('Listing expenses', { businessId, category, startDate, endDate, limit, offset });

      const expenses = await this.expenseService.listByBusiness(businessId, {
        category,
        startDate,
        endDate,
        limit,
        offset,
      });

      sendSuccess(res, expenses);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.listExpenses error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Get single expense
   * GET /expenses/:id
   */
  async getExpense(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const expenseId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!expenseId) {
        sendError(res, 'Expense ID is required', 400);
        return;
      }

      Logger.debug('Fetching expense', { expenseId, businessId });

      const expense = await this.expenseService.getById(businessId, expenseId);

      if (!expense) {
        sendError(res, 'Expense not found', 404);
        return;
      }

      sendSuccess(res, expense);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.getExpense error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Update expense (same-day only)
   * PATCH /expenses/:id
   * Body: { date?, category?, description?, amount?, vat_percent?, vat_recoverable?, receipt_url? }
   */
  async updateExpense(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const expenseId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!expenseId) {
        sendError(res, 'Expense ID is required', 400);
        return;
      }

      const input: UpdateExpenseInput = request.body;

      Logger.info('Updating expense', { expenseId, businessId });

      const updated = await this.expenseService.updateExpense(businessId, expenseId, input);

      sendSuccess(res, updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.updateExpense error', new Error(errorMessage));
      sendError(res, errorMessage, 400);
    }
  }

  /**
   * Delete expense
   * DELETE /expenses/:id
   */
  async deleteExpense(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      const request = req as any;
      const businessId = request.tenant?.businessId;
      const expenseId = request.params.id;

      if (!businessId) {
        sendError(res, 'Tenant context not found', 401);
        return;
      }

      if (!expenseId) {
        sendError(res, 'Expense ID is required', 400);
        return;
      }

      Logger.info('Deleting expense', { expenseId, businessId });

      const deleted = await this.expenseService.delete(businessId, expenseId);

      if (!deleted) {
        sendError(res, 'Failed to delete expense', 500);
        return;
      }

      sendSuccess(res, { id: expenseId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.deleteExpense error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }

  /**
   * Get expense categories
   * GET /expenses/categories
   */
  async getCategories(_req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
      Logger.debug('Fetching expense categories');

      sendSuccess(res, EXPENSE_CATEGORIES);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('ExpenseController.getCategories error', new Error(errorMessage));
      sendError(res, errorMessage, 500);
    }
  }
}

export default ExpenseController;