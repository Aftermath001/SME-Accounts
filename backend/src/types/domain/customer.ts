/**
 * Customer Domain Type
 * Represents a customer of a business
 * Used for invoicing
 */

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

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
