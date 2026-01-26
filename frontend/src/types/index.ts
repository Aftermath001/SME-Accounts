export interface User {
  id: string;
  email: string;
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

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  vat_percent: number;
  vat_amount: number;
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
  items?: InvoiceItem[];
}

export interface CreateInvoiceInput {
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  items: CreateInvoiceItemInput[];
  notes?: string;
}

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
  vat_percent: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}