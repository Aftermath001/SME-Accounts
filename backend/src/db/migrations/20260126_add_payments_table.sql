-- Migration: Add payments table with tenant isolation and indexes
-- Date: 2026-01-26

-- Table: payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  invoice_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  method text not null check (method in ('MPESA', 'MANUAL')),
  status text not null check (status in ('PENDING', 'SUCCESS', 'FAILED')),
  mpesa_reference text,
  created_at timestamptz not null default now(),
  raw_mpesa_payload jsonb,
  constraint fk_payments_invoice
    foreign key (invoice_id)
    references public.invoices (id)
    on update cascade
    on delete restrict,
  constraint fk_payments_tenant
    foreign key (tenant_id)
    references public.tenants (id)
    on update cascade
    on delete restrict
);

-- Enable Row Level Security
alter table public.payments enable row level security;

-- RLS Policies enforcing tenant isolation using current_setting('app.tenant_id', true)
-- Adjust if you rely on JWT claims via auth.jwt() ->> 'tenant_id'.
drop policy if exists "tenant_isolation_select_payments" on public.payments;
create policy "tenant_isolation_select_payments"
on public.payments
for select
using (tenant_id::text = current_setting('app.tenant_id', true));

drop policy if exists "tenant_isolation_insert_payments" on public.payments;
create policy "tenant_isolation_insert_payments"
on public.payments
for insert
with check (tenant_id::text = current_setting('app.tenant_id', true));

drop policy if exists "tenant_isolation_update_payments" on public.payments;
create policy "tenant_isolation_update_payments"
on public.payments
for update
using (tenant_id::text = current_setting('app.tenant_id', true))
with check (tenant_id::text = current_setting('app.tenant_id', true));

drop policy if exists "tenant_isolation_delete_payments" on public.payments;
create policy "tenant_isolation_delete_payments"
on public.payments
for delete
using (tenant_id::text = current_setting('app.tenant_id', true));

-- Helpful indexes
create index if not exists idx_payments_tenant_invoice on public.payments (tenant_id, invoice_id);
create index if not exists idx_payments_invoice on public.payments (invoice_id);
create index if not exists idx_payments_tenant on public.payments (tenant_id);
create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_payments_mpesa_reference on public.payments (mpesa_reference);

-- Uniqueness for M-Pesa reference per tenant (nullable-safe)
create unique index if not exists uq_payments_tenant_mpesa_reference
on public.payments (tenant_id, mpesa_reference)
where mpesa_reference is not null;
