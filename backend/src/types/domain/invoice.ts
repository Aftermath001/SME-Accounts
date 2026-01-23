/**
 * Invoice Domain Types
 * Represents an invoice issued by a business to a customer
 */

export interface Invoice {
  id: string;
  business_id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  vat_total: number;
  grand_total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
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

export interface UpdateInvoiceInput {
  invoice_date?: string;
  due_date?: string;
  status?: Invoice['status'];
  notes?: string;
  sent_at?: string;
  paid_at?: string;
  items?: CreateInvoiceItemInput[];
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}
