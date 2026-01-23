import { ExpenseCategory } from '../types/domain';

/**
 * Fixed expense categories for MVP
 * These are the allowed expense categories that users can select from
 * VAT recoverability is determined by the category
 */

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    value: 'meals',
    label: 'Meals & Entertainment',
    description: 'Office meals, client entertainment, team lunches',
    vat_recoverable: true,
  },
  {
    value: 'transport',
    label: 'Transport & Travel',
    description: 'Vehicle fuel, public transport, taxi/ride-sharing, travel tickets',
    vat_recoverable: true,
  },
  {
    value: 'utilities',
    label: 'Utilities',
    description: 'Electricity, water, internet, phone bills',
    vat_recoverable: true,
  },
  {
    value: 'office_supplies',
    label: 'Office Supplies',
    description: 'Stationery, office equipment, printing materials',
    vat_recoverable: true,
  },
  {
    value: 'software',
    label: 'Software & Subscriptions',
    description: 'SaaS subscriptions, software licenses, cloud services',
    vat_recoverable: true,
  },
  {
    value: 'professional_services',
    label: 'Professional Services',
    description: 'Legal fees, accounting services, consulting, audit fees',
    vat_recoverable: true,
  },
  {
    value: 'advertising',
    label: 'Advertising & Marketing',
    description: 'Digital marketing, print advertising, social media promotion',
    vat_recoverable: true,
  },
  {
    value: 'other',
    label: 'Other Expenses',
    description: 'Miscellaneous business expenses not covered above',
    vat_recoverable: false,
  },
];

/**
 * Map category value to category details
 * Useful for lookups by value
 */
export const CATEGORY_MAP = EXPENSE_CATEGORIES.reduce(
  (map, category) => {
    map[category.value] = category;
    return map;
  },
  {} as Record<string, ExpenseCategory>
);

/**
 * Get category details by value
 * @param value The category value
 * @returns The category details or undefined if not found
 */
export function getCategoryByValue(value: string): ExpenseCategory | undefined {
  return CATEGORY_MAP[value];
}

/**
 * Check if a category is VAT recoverable
 * @param value The category value
 * @returns true if VAT is recoverable, false otherwise
 */
export function isCategoryVatRecoverable(value: string): boolean {
  const category = getCategoryByValue(value);
  return category?.vat_recoverable || false;
}

/**
 * Get all category values (for validation)
 * @returns Array of valid category values
 */
export function getValidCategoryValues(): string[] {
  return EXPENSE_CATEGORIES.map((cat) => cat.value);
}
