/**
 * Expense Domain Type
 * Represents a business expense
 * Used for tracking deductible expenses and VAT recovery
 */

export interface Expense {
  id: string;
  business_id: string;
  date: string;
  category: string;
  description?: string;
  amount: number;
  vat_percent: number;
  vat_amount: number;
  total_amount: number;
  vat_recoverable: boolean;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  date: string;
  category: string;
  description?: string;
  amount: number;
  vat_percent: number;
  vat_recoverable: boolean;
  receipt_url?: string;
}

export interface UpdateExpenseInput {
  date?: string;
  category?: string;
  description?: string;
  amount?: number;
  vat_percent?: number;
  vat_recoverable?: boolean;
  receipt_url?: string;
}

export type ExpenseCategoryValue =
  | 'meals'
  | 'transport'
  | 'utilities'
  | 'office_supplies'
  | 'software'
  | 'professional_services'
  | 'advertising'
  | 'other';

export interface ExpenseCategory {
  value: ExpenseCategoryValue;
  label: string;
  description?: string;
  vat_recoverable: boolean;
}
