// Payment model definitions for the payments domain
// Mirrors the database schema introduced in PART A

export const PAYMENTS_TABLE = 'payments';

export enum PaymentMethod {
  MPESA = 'MPESA',
  MANUAL = 'MANUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number; // numeric(14,2) in DB, represented as number in TS
  method: PaymentMethod;
  status: PaymentStatus;
  mpesa_reference?: string | null;
  created_at: string; // ISO string from timestamptz
  raw_mpesa_payload?: unknown | null; // stores raw callback payload when applicable
}

export interface NewPayment {
  tenant_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  // When creating intents, status may default to PENDING
  status?: PaymentStatus;
  mpesa_reference?: string | null;
  raw_mpesa_payload?: unknown | null;
}

export interface PaymentQueryFilters {
  tenant_id: string;
  invoice_id?: string;
  status?: PaymentStatus;
}
