/**
 * Type definitions for authenticated request context
 */
export interface AuthContext {
  userId: string;
  businessId: string;
  email: string;
  role: 'owner' | 'accountant' | 'viewer';
}

/**
 * Extended Express Request with auth context
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  kra_pin: string;
  vat_number?: string;
  industry: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  subtotal: number;
  vat_total: number;
  grand_total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
}

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
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}
