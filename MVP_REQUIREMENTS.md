# SME-Accounts MVP: Requirements & Scope Definition

**Project:** AI-powered SME Accounting & KRA Compliance SaaS for Kenya  
**Phase:** 1 – Requirements & Scope Definition  
**Date:** January 2026  

---

## 1. MVP FEATURE SET

### Core Features (In-Scope)
1. **User Authentication & Authorization**
   - Email/password registration and login
   - JWT-based session management
   - Role-based access control (Owner, Accountant, Viewer)

2. **Business Profile Setup**
   - Create and manage business information (name, PIN, VAT number, industry)
   - Business contact details
   - Multi-currency support (KES primary, USD as secondary)

3. **Invoicing Module**
   - Create and manage invoices (sales documents)
   - Invoice line items with quantity, unit price, VAT
   - Invoice templates (basic)
   - Invoice status tracking (Draft, Sent, Paid, Overdue)
   - PDF generation and download
   - Invoice search and filtering
   - Client/customer directory

4. **Expense Tracking**
   - Record business expenses (with categories)
   - Expense categories (utilities, supplies, travel, etc.)
   - Receipt upload and attachment
   - Expense date, amount, VAT tracking
   - Bulk expense entry capability

5. **Financial Reports (MVP)**
   - Profit & Loss statement (monthly/quarterly)
   - Balance sheet summary
   - Revenue and expense breakdown
   - Tax summary view

6. **KRA Compliance**
   - VAT calculation and tracking (standard rate: 16%)
   - VAT Summary Report (input VAT, output VAT, net)
   - iTax-ready CSV export format
   - KRA-compliant invoice numbering

7. **Multi-Tenancy**
   - Complete data isolation per business/tenant
   - Single sign-on with business selection
   - Role-based features per tenant

### Out-of-Scope (MVP)
- Payroll and employee management
- AI-powered tax optimization
- Multi-country tax rules and compliance
- Advanced analytics dashboards
- Recurring/automated invoicing
- Payment gateway integration (M-Pesa real integration)
- Accounting integrations (QuickBooks, Xero, etc.)
- Mobile app (web-first, mobile-responsive only)
- Audit trail and detailed logging per transaction
- Advanced forecasting and budgeting
- Purchase order management
- Inventory management
- Customer credit terms and aging reports

---

## 2. USER ROLES & PERMISSIONS

### Role Definitions

| Role | Capabilities | Data Access |
|------|------------|-------------|
| **Owner** | Full access: create invoices, expenses, view reports, manage team, access compliance features | All business data |
| **Accountant** | Create/edit invoices & expenses, view reports, export compliance data | All business data (no user management) |
| **Viewer** | Read-only access to invoices, expenses, reports | Read-only business data |

---

## 3. FUNCTIONAL REQUIREMENTS

### FR-1: User Authentication
- Users can register with email and password
- Minimum password: 8 characters, 1 uppercase, 1 number
- Email verification via OTP (simple mock for MVP)
- JWT tokens expire after 7 days
- Logout invalidates session token

### FR-2: Business Setup
- Owner must complete business profile before using system
- Business profile contains: legal name, KRA PIN, VAT number, industry, phone, email
- VAT registration is optional (small traders may not be VAT-registered)
- Business data is immutable after creation (except optional fields)

### FR-3: Invoicing
- Invoice number format: `INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}`
- Invoice must have: client name, items (description, quantity, unit price, VAT %), date, due date, notes
- Automatic VAT calculation per item
- Invoice subtotal, VAT total, and grand total auto-calculated
- Invoice can be marked as Paid (with payment date)
- PDF must include business info and QR code (optional, deferred)

### FR-4: Expense Tracking
- Expense record: date, category, description, amount, VAT (if applicable), receipt file
- Categories are predefined (can be extended later)
- Expense date cannot be in future
- VAT on expenses can be marked for recovery (input VAT)
- Bulk CSV import for expenses (simple format)

### FR-5: Financial Reports
- P&L Report: grouped by month/quarter, shows revenue, expenses, net profit
- Balance Sheet: simplified (assets, liabilities, equity snapshots)
- Revenue breakdown by invoice status (paid, unpaid, overdue)
- All reports downloadable as PDF or CSV

### FR-6: KRA Compliance
- VAT Summary: period-based (monthly), shows:
  - Total output VAT (from invoices)
  - Total input VAT (from expenses)
  - Net VAT payable
  - Compliance status
- iTax Export: CSV format with invoice headers, item details, VAT amounts
- Validation: warn if outstanding invoices or VAT discrepancies

### FR-7: Multi-Tenancy
- No data leakage between tenants
- Tenant isolation enforced at API level (tenant_id checks)
- Owner can invite other users to their business (multi-user per business)

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### NFR-1: Security
- All passwords hashed (bcrypt, salt rounds: 10)
- JWT secrets stored in environment variables
- API endpoints require valid JWT token
- Tenant ID enforced in all data queries (SQL-level isolation)
- Input validation on all endpoints (no SQL injection, XSS)
- HTTPS only in production
- CORS configured for frontend domain only

### NFR-2: Performance
- Page load time < 2 seconds for MVP features
- API response time < 500ms for 95th percentile
- Support ~100 concurrent users per database instance
- Pagination on all list endpoints (default 20 items/page)

### NFR-3: Availability
- Target 99% uptime (SLA can be tightened post-MVP)
- Database backups daily
- No single point of failure in architecture

### NFR-4: Scalability
- Stateless API design (horizontal scaling ready)
- Database indexing on commonly filtered fields
- Async tasks queued (e.g., PDF generation, email)
- Ready for containerization (Docker)

### NFR-5: Usability
- Mobile-responsive UI (90%+ readability on 320px width)
- Maximum 3 clicks to core features (invoicing, expenses, reports)
- Form validation with clear error messages
- Dark mode support (future, not MVP)

### NFR-6: Compliance
- GDPR-ready data export (user can download all data)
- Data retention policy: 7-year retention for tax records
- Audit log: who did what and when (basic, deferred if time)

---

## 5. ASSUMPTIONS & CONSTRAINTS

### Assumptions
- All users are in Kenya; KES is primary currency
- Users have email access for verification
- PDF generation is server-side (can be deferred)
- Business owners speak English (MVP language)
- Initial user acquisition is low (<1,000 accounts in Year 1)

### Constraints
- Single PostgreSQL database (no sharding in MVP)
- No real M-Pesa integration (mock payment flow only)
- Limited customization (invoice templates, not dynamic fields)
- No offline-first capability (web-only)
- Email notifications deferred (post-MVP)

---

## 6. OUT-OF-SCOPE ITEMS (EXPLICIT)

| Feature | Reason |
|---------|--------|
| Payroll & Salary Management | Complex Kenyan tax rules; separate domain |
| AI Tax Optimization | Requires advanced algorithms; post-MVP |
| Multi-country Tax Rules | Out of MVP scope; Kenya-only for now |
| Advanced Dashboard Analytics | Nice-to-have; basic reports sufficient |
| Real Payment Processing | M-Pesa integration complex; mock sufficient |
| Automated Invoice Reminders | Notification system can be added post-MVP |
| Recurring Invoices | Manual entry acceptable for MVP |
| Inventory Tracking | Separate bounded context; not in scope |
| Customer Credit Terms | Simplified: no credit tracking in MVP |
| Fixed Asset Depreciation | Out of scope; manual entry only |
| Bank Reconciliation | Too complex for MVP; export/import sufficient |

---

## 7. SUCCESS CRITERIA (MVP COMPLETE)

- [ ] 100% data isolation between tenants (no data leakage)
- [ ] User can register, create business, and add invoices within 5 minutes
- [ ] 50+ invoices and 100+ expenses can be created without performance degradation
- [ ] VAT summary accurate for Kenyan rates and rules
- [ ] All core endpoints have JWT authentication
- [ ] PDF invoice generation works (basic, no fancy formatting)
- [ ] Database schema supports future multi-tenancy features (no redesign needed)
- [ ] Code follows clean architecture patterns (services, repositories, controllers)
- [ ] Deployment-ready (Docker, environment config)
- [ ] Zero critical security vulnerabilities (OWASP Top 10 checked)

---

## 8. DELIVERY TIMELINE (ESTIMATED)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Requirements | 1 day | This document |
| Phase 2: System & Data Design | 1 day | Architecture doc, DB schema, API spec |
| Phase 3: Project Setup | 1 day | Scaffolded project, CI/CD pipeline ready |
| Phase 4: Core Features | 7 days | Auth, invoicing, expenses, reports |
| Phase 5: KRA Compliance | 2 days | VAT logic, exports |
| Phase 6: Hardening | 2 days | Tests, error handling, security review |
| Phase 7: Scale-Ready Plan | 1 day | Technical debt doc, roadmap |
| **Total** | **~15 days** | **Production-ready MVP** |

---

## 9. TECHNICAL NOTES

- **Frontend:** React + Vite (faster dev, smaller bundles than Next.js for MVP)
- **Backend:** Express.js (simpler than NestJS; Nest if complexity grows)
- **Database:** PostgreSQL (ACID guarantees, JSON support for flexible fields)
- **Authentication:** JWT (stateless, scales horizontally)
- **PDF Generation:** PDFKit (server-side, simple)
- **CSV Export:** Built-in Node.js (no external dependency)

---

## 10. SIGN-OFF

**Phase 1 Complete.** Awaiting confirmation to proceed to Phase 2 (System & Data Design).

