/**
 * Business Domain Type
 * Represents a tenant in the multi-tenant SaaS
 * One Business = One tenant account
 */

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

export interface CreateBusinessInput {
  name: string;
  kra_pin?: string;
  vat_number?: string;
  industry?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateBusinessInput {
  name?: string;
  kra_pin?: string;
  vat_number?: string;
  industry?: string;
  phone?: string;
  email?: string;
  address?: string;
}
