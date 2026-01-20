# SME-Accounts MVP: Requirements Document

**Project:** AI-powered SME Accounting & KRA Compliance SaaS  
**Target Market:** Kenya  
**Date:** January 2026  
**Status:** Phase 1 – Requirements Definition

---

## 1. PROBLEM STATEMENT

Kenyan SMEs and freelancers lack affordable, localized accounting and tax compliance solutions. Manual bookkeeping is error-prone, and meeting KRA (Kenya Revenue Authority) tax obligations is complex and time-consuming. This MVP solves core bookkeeping and VAT compliance gaps with a simple, web-based platform.

---

## 2. TARGET USERS

- **Primary:** Non-technical small business owners (1–50 employees)
  - Retail traders
  - Service providers (plumbing, consulting, transport)
  - Freelancers and sole proprietors
  - Small manufacturing businesses

- **Secondary:** Business accountants/bookkeepers assisting SME owners

- **Tertiary (Post-MVP):** KRA tax compliance officers, accountant networks

---

## 3. USER ROLES & PERMISSIONS

| Role | Capabilities | Data Scope |
|------|------------|-----------|
| **Owner** | Create/edit all records, manage team, export compliance reports | All business data |
| **Accountant** | Create/edit invoices & expenses, view reports, export exports | All business data (no user management) |
| **Viewer** | Read-only access to invoices, expenses, reports | All business data (read-only) |

---

## 4. IN-SCOPE MVP FEATURES

### 4.1 Authentication & Tenant Setup
- **User Registration:** Email/password signup with basic validation (min 8 chars, 1 upper, 1 number)
- **Email Verification:** OTP-based verification (mock/non-production, can be enhanced)
- **JWT Authentication:** Token-based API authentication; 7-day expiry
- **Business Creation:** Owner sets up business profile post-registration
- **Multi-Tenant Isolation:** Complete data isolation per business (no cross-tenant data leakage)

### 4.2 Business Profile
- Legal business name
- KRA Personal Identification Number (PIN)
- VAT Registration Number (optional – small traders may not be VAT-registered)
- Industry classification (dropdown list)
- Business contact (phone, email)
- Address (for invoice headers)
- Immutable after creation (except optional fields like contact details)

### 4.3 Invoicing Module
- **Create Invoices:**
  - Invoice number auto-generated: `INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}`
  - Client/customer name
  - Invoice date and due date
  - Line items: description, quantity, unit price, VAT % (default 16%)
  - Auto-calculated subtotal, VAT total, grand total
  - Payment notes and terms
  - Invoice status: Draft, Sent, Paid, Overdue

- **Invoice Operations:**
  - Edit draft invoices; sent invoices locked (read-only)
  - Mark as Paid with payment date
  - List/search with filters (date range, status, client)
  - PDF download (basic, single-page format)
  
- **Customer Directory:**
  - Store customer info (name, email, phone)
  - Auto-populate when creating new invoice

### 4.4 Expense Tracking
- **Record Expenses:**
  - Date (cannot be future)
  - Category (predefined: Utilities, Supplies, Travel, Meals, Professional Fees, Other)
  - Description
  - Amount (in KES)
  - VAT (if applicable, default 16%)
  - Receipt file attachment (PDF/image)

- **Expense Operations:**
  - Edit/delete expenses
  - List/filter by date range, category, amount
  - Mark VAT-recoverable (input VAT tracking)
  - Bulk CSV import (simple format: Date, Category, Amount, Description, VAT%)

### 4.5 Financial Reports (MVP)
- **Profit & Loss Report**
  - Period: Monthly or quarterly view
  - Shows: Total revenue (from invoices), total expenses, net profit
  - Breakdown by invoice status (paid, unpaid, overdue)
  - Export as PDF or CSV

- **Balance Sheet Summary**
  - Simplified view: Current assets, current liabilities, equity
  - For MVP: calculated from invoices and expenses only
  - Not full double-entry bookkeeping

- **Tax Summary**
  - Total revenue, total VAT collected (output VAT)
  - Total expenses, total VAT recovered (input VAT)
  - Net VAT payable
  - Period selection (monthly)

### 4.6 KRA Compliance Features
- **VAT Calculation & Tracking**
  - Standard rate: 16% (Kenyan standard VAT)
  - Automatic VAT calculation on invoice items and expenses
  - Input VAT (expenses) and output VAT (invoices) tracking

- **VAT Summary Report**
  - Monthly summary: output VAT, input VAT, net payable
  - Compliance flag: indicates if outstanding invoices affect VAT calculation
  - Export as CSV for manual KRA iTax submission

- **iTax Export Format**
  - CSV export ready for KRA's iTax system
  - Columns: Invoice number, date, client name, gross amount, VAT, net amount
  - Includes expense VAT claims (input VAT)

- **Validation & Warnings**
  - Warn if outstanding (unpaid) invoices exist
  - Flag VAT discrepancies (e.g., output VAT > invoiced amount)
  - Align to Kenyan tax calendar (12-month periods, mid-year adjustments optional)

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### NFR-1: Security
- Password hashing: bcrypt (10 salt rounds)
- Secrets (JWT key, DB password) via environment variables
- API endpoints require valid JWT token
- **Tenant isolation:** All queries include `tenant_id` filter at database level
- Input validation: Prevent SQL injection, XSS, CSRF
- HTTPS enforced in production
- CORS configured for frontend domain(s) only

### NFR-2: Performance
- Page load time: < 2 seconds (P95)
- API response time: < 500ms (P95)
- Support ~100 concurrent users per instance
- Pagination: Default 20 items/page on list endpoints

### NFR-3: Availability & Reliability
- Target uptime: 99% (post-MVP hardening can improve)
- Daily database backups
- Graceful error handling and user-friendly error messages

### NFR-4: Scalability
- Stateless API (horizontal scaling ready)
- Database indexes on frequently filtered columns (date, tenant_id, status)
- Async task queuing for long-running operations (PDF generation, exports)
- Docker-ready architecture

### NFR-5: Usability
- Mobile-responsive design (readable on 320px width)
- Core features accessible in ≤ 3 clicks
- Clear form validation and error messages
- Simplified, non-technical UI (no accounting jargon where avoidable)

### NFR-6: Data Compliance
- GDPR-ready: Users can export all their data
- Data retention: 7-year retention policy for tax records (Kenya tax law)
- Basic audit logging: Who performed what action and when (deferred if time-constrained)

---

## 6. ASSUMPTIONS

- All users are in Kenya; currency is KES
- Users have email access for account verification
- PDF generation is server-side (acceptable latency up to 5 seconds)
- Business owners are English-speaking (MVP language: English only)
- Initial user base is small (< 1,000 active businesses in Year 1)
- Internet connectivity is available (not offline-first)
- Businesses operate on a standard 12-month calendar (Jan–Dec)

---

## 7. CONSTRAINTS

- **Database:** Single PostgreSQL instance (no sharding in MVP)
- **Payments:** No real M-Pesa integration; mock payment flow only
- **Customization:** Fixed invoice templates (no custom fields)
- **Languages:** English only (localization post-MVP)
- **Users per Business:** No hard limit, but recommended ≤ 5 for MVP
- **Data Limits:** Up to 10,000 invoices and expenses per business (soft limit)

---

## 8. OUT-OF-SCOPE FEATURES (EXPLICIT)

| Feature | Reason | When Post-MVP |
|---------|--------|---------------|
| Payroll & Salary Management | Requires complex Kenyan labor law rules; separate domain | Phase 2 |
| AI Tax Optimization | Requires ML algorithms and advanced tax rule engine | Q2 2026 |
| Multi-Country Tax Rules | Kenya-only scope for MVP | Post-2026 |
| Advanced Analytics & Dashboards | Basic reports sufficient for MVP; can be enhanced | Post-hardening |
| Real M-Pesa Integration | Too complex for MVP; mock sufficient | Post-launch |
| Recurring/Automated Invoicing | Manual entry acceptable for MVP | Phase 2 |
| Email Notifications | Notification system adds complexity; deferred | Post-MVP |
| Inventory Management | Separate bounded context; not in MVP scope | Future product |
| Bank Reconciliation | Too complex; export/import sufficient | Phase 2 |
| Fixed Asset Depreciation | Manual tracking only (post-MVP) | Phase 2 |
| Customer Credit Terms & Aging | Simplified: no credit tracking | Phase 2 |
| Accounting Integrations (Xero, QB) | API integrations complex; deferred | Q3 2026 |
| Mobile App (native) | Web-responsive MVP sufficient | Post-MVP |

---

## 9. MVP SUCCESS CRITERIA

### Functional Success
- [ ] User can register, create business, and add first invoice in < 5 minutes
- [ ] 100% data isolation between tenants (no data leakage in any scenario)
- [ ] All API endpoints require and validate JWT authentication
- [ ] Invoice PDF generation works (basic single-page format)
- [ ] VAT Summary calculation matches Kenyan tax rates and logic
- [ ] iTax CSV export format is valid and accepted format for KRA

### Performance & Reliability
- [ ] Can create and list 50+ invoices and 100+ expenses without performance degradation
- [ ] Page load times consistently < 2 seconds
- [ ] Zero 5xx errors for 99% of requests
- [ ] Basic error handling with user-friendly messages

### Security
- [ ] Zero critical vulnerabilities (OWASP Top 10 assessment passed)
- [ ] Passwords hashed with bcrypt (no plaintext storage)
- [ ] Secrets managed via environment variables (no hardcoded credentials)
- [ ] API rate limiting implemented (future: 100 req/min per user)

### Code Quality
- [ ] Clean architecture pattern: Controllers → Services → Repositories
- [ ] No business logic in controllers or routes
- [ ] Database schema supports future multi-tenancy features (no redesign needed)
- [ ] Meaningful error messages (not generic "something went wrong")

### Deployment Readiness
- [ ] Dockerfile and docker-compose.yml for local dev and production
- [ ] Environment variables documented (`.env.example`)
- [ ] Database migrations tracked and reproducible
- [ ] README with setup and deployment instructions

---

## 10. SIGN-OFF

**Phase 1 Complete.** This document defines the MVP scope, user needs, and success criteria.

**Next Steps:**
1. ✓ Phase 1: Requirements (this document)
2. → Phase 2: System & Data Design (architecture, DB schema, API spec)
3. → Phase 3: Project Setup & Scaffolding
4. → Phase 4: Core Feature Implementation
5. → Phase 5: KRA Compliance Hardening
6. → Phase 6: Testing & Security Review
7. → Phase 7: Scale-Ready Plan & Go-Live Readiness

---

**Prepared by:** Senior Software Engineer & Product Architect  
**Ready for:** Development team handoff
