import { CreateExpenseInput, UpdateExpenseInput } from '../types/domain';
import { getValidCategoryValues, getCategoryByValue } from '../constants/expense-categories';
import { Logger } from '../utils/logger';

/**
 * Expense Validation Service
 * Handles all expense validation logic including:
 * - Amount validation (>= 0)
 * - Category validation (from fixed list)
 * - Date validation
 * - Immutability rules (edit only same day)
 */

export class ExpenseValidationService {
  private static readonly VAT_RATE = 16; // 16% VAT rate for MVP

  /**
   * Validate expense creation input
   */
  static validateCreateInput(input: CreateExpenseInput): void {
    // Validate required fields
    if (!input.date) {
      throw new Error('Expense date is required');
    }

    if (!input.category) {
      throw new Error('Expense category is required');
    }

    if (input.amount === undefined || input.amount === null) {
      throw new Error('Expense amount is required');
    }

    // Validate date format (ISO 8601)
    if (!this.isValidDate(input.date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Validate amount
    this.validateAmount(input.amount);

    // Validate category
    this.validateCategory(input.category);

    // Validate VAT percent
    this.validateVatPercent(input.vat_percent);

    Logger.debug('Expense create input validated', { category: input.category, amount: input.amount });
  }

  /**
   * Validate expense update input and check immutability rules
   */
  static validateUpdateInput(input: UpdateExpenseInput, existingExpenseDate: string): void {
    // Check immutability rule - can only edit same day
    if (!this.canEditExpense(existingExpenseDate)) {
      throw new Error('Expenses can only be edited on the same day they were created');
    }

    // Validate individual fields if provided
    if (input.date !== undefined) {
      if (!this.isValidDate(input.date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
    }

    if (input.amount !== undefined) {
      this.validateAmount(input.amount);
    }

    if (input.category !== undefined) {
      this.validateCategory(input.category);
    }

    if (input.vat_percent !== undefined) {
      this.validateVatPercent(input.vat_percent);
    }

    Logger.debug('Expense update input validated');
  }

  /**
   * Validate amount is >= 0
   */
  private static validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }

    if (amount < 0) {
      throw new Error('Amount must be greater than or equal to 0');
    }

    // Check for reasonable precision (2 decimal places max)
    if (Math.round(amount * 100) !== amount * 100) {
      throw new Error('Amount cannot have more than 2 decimal places');
    }
  }

  /**
   * Validate category is from the fixed list
   */
  private static validateCategory(category: string): void {
    if (!category || typeof category !== 'string') {
      throw new Error('Category must be a valid string');
    }

    const validCategories = getValidCategoryValues();
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  /**
   * Validate VAT percentage
   */
  private static validateVatPercent(vatPercent: number): void {
    if (typeof vatPercent !== 'number' || isNaN(vatPercent)) {
      throw new Error('VAT percent must be a valid number');
    }

    if (vatPercent < 0 || vatPercent > 100) {
      throw new Error('VAT percent must be between 0 and 100');
    }

    // For MVP, we primarily use 16% or 0%
    if (vatPercent !== 0 && vatPercent !== this.VAT_RATE) {
      Logger.warn('Non-standard VAT rate used', { vatPercent });
    }
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private static isValidDate(dateString: string): boolean {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
  }

  /**
   * Check if expense can be edited (same day rule)
   */
  private static canEditExpense(expenseDate: string): boolean {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const expenseDay = expenseDate.split('T')[0]; // Handle both date and datetime formats
    
    return today === expenseDay;
  }

  /**
   * Calculate VAT amount based on amount and VAT percent
   */
  static calculateVatAmount(amount: number, vatPercent: number): number {
    const vatAmount = amount * (vatPercent / 100);
    return Math.round(vatAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate total amount (amount + VAT)
   */
  static calculateTotalAmount(amount: number, vatPercent: number): number {
    const vatAmount = this.calculateVatAmount(amount, vatPercent);
    return Math.round((amount + vatAmount) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Determine if VAT is recoverable based on category
   */
  static isVatRecoverable(category: string): boolean {
    const categoryDetails = getCategoryByValue(category);
    return categoryDetails?.vat_recoverable || false;
  }

  /**
   * Get standard VAT rate for MVP
   */
  static getStandardVatRate(): number {
    return this.VAT_RATE;
  }
}

export default ExpenseValidationService;