# MVP Scope Lock

**Project:** SME-Accounts – Kenyan SME Accounting & KRA Compliance SaaS  
**Date:** January 2026  
**Status:** FINAL – Locked for Development  
**Branch:** main (commit reference: [to be updated])

---

## Overview

This document defines the exact scope boundary for the MVP. Once this document is approved and committed, all feature requests must go through change control process. No scope creep is permitted without explicit re-planning and timeline adjustment.

**Scope Lock Rule:** Features not listed in "INCLUDED" are OUT OF SCOPE, period.

---

## 1. FEATURES EXPLICITLY INCLUDED IN MVP

### Authentication & Authorization
- [x] User registration with email/password
- [x] Email verification via OTP
- [x] User login and JWT token issuance
- [x] Token expiry (7 days)
- [x] User logout
- [x] Role-based access control (Owner, Accountant, Viewer)
- [x] User invitation and team management (add/remove users)

### Business Setup
- [x] Business profile creation (legal name, KRA PIN, VAT number, industry)
- [x] Business profile immutability (after creation)
- [x] Optional fields editability (phone, email, address)
- [x] Multi-tenant data isolation (complete separation per business)
- [x] Customer directory (create, read, update, delete)
- [x] Customer search by name

### Invoicing
- [x] Create invoice (customer, dates, line items)
- [x] Auto-generated invoice number (INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE})
- [x] Line items with quantity, unit price, VAT %
- [x] Auto-calculation of subtotals, VAT, grand totals
- [x] Invoice status workflow (Draft → Sent → Paid)
- [x] Edit draft invoices only
- [x] Mark invoice as Paid with payment date
- [x] List invoices with filtering (status, date range, customer)
- [x] Invoice detail view
- [x] PDF invoice download (basic single-page format)
- [x] Delete draft invoices only

### Expense Tracking
- [x] Create expense (date, category, amount, VAT)
- [x] Predefined expense categories (Utilities, Supplies, Travel, Meals, Professional Fees, Other)
- [x] Optional receipt file attachment (PDF, JPG, PNG)
- [x] Mark expense as VAT-Recoverable (input VAT tracking)
- [x] Edit expenses
- [x] Delete expenses
- [x] List expenses with filtering (date range, category, VAT status)
- [x] Bulk CSV import of expenses (simple 5-column format)

### Financial Reports (MVP Tier)
- [x] Profit & Loss report (monthly/quarterly, revenue/expenses/net profit)
- [x] Balance Sheet summary (simplified, assets/liabilities/equity)
- [x] Tax Summary (revenue, output VAT, expenses, input VAT, net VAT)
- [x] Period selection (month or quarter)
- [x] PDF download of reports
- [x] CSV download of reports

### KRA Compliance & VAT
- [x] Automatic VAT calculation (16% Kenyan standard rate)
- [x] Output VAT tracking (from invoices)
- [x] Input VAT tracking (from expenses)
- [x] Monthly VAT summary report
- [x] iTax CSV export format (invoice headers, item details, VAT amounts)
- [x] VAT compliance validation (warnings for outstanding invoices, VAT discrepancies)

### Data & Security
- [x] PostgreSQL database
- [x] JWT-based API authentication
- [x] Bcrypt password hashing (10 salt rounds)
- [x] API rate limiting (future implementation, basic structure ready)
- [x] HTTPS enforcement (production)
- [x] CORS configuration (frontend domain only)
- [x] Secrets management via environment variables

### Deployment
- [x] Docker-ready architecture (Dockerfile, docker-compose.yml)
- [x] Environment variable configuration (.env.example)
- [x] Database migrations (reproducible)
- [x] README with setup and deployment instructions

---

## 2. FEATURES EXPLICITLY EXCLUDED FROM MVP

### Not Included – By Design Decision

| Feature | Rationale | Post-MVP Timeline |
|---------|-----------|------------------|
| **Payroll & Salary Management** | Complex Kenyan labor law; separate bounded context. Requires tax tables, PAYE rules, statutory deductions. Too large for MVP scope. | Q2 2026 |
| **AI Tax Optimization** | Requires ML algorithms, advanced tax rule engine, integration with KRA systems. Not feasible in MVP timeline. | Q3 2026 |
| **Multi-Country Tax Rules** | Kenya-only scope for MVP. Expansion to Uganda, Tanzania deferred. | 2027 |
| **Advanced Analytics Dashboards** | Dashboard UI is complex; basic reports sufficient for MVP users. Custom reporting can be added later. | Q2 2026 |
| **Real M-Pesa Integration** | API complexity, security overhead, mock payment flow sufficient for MVP validation. | Post-launch |
| **Recurring/Automated Invoicing** | Manual invoice creation acceptable for MVP user base. Auto-scheduling deferred. | Q1 2026 |
| **Email Notifications** | Notification system (SMTP, queuing, templates) adds infrastructure complexity. MVP users can check system manually. | Q2 2026 |
| **Inventory Management** | Separate product domain; not core to MVP accounting scope. | Future product |
| **Bank Reconciliation** | Requires bank API integration; export/import sufficient for MVP. | Q2 2026 |
| **Fixed Asset Depreciation** | Manual asset tracking only. Depreciation schedules post-MVP. | Q2 2026 |
| **Customer Credit Terms & Aging** | Simplified: no credit tracking or aging analysis. Pay-in-full or cash only. | Q1 2026 |
| **Accounting Software Integrations (Xero, QuickBooks, etc.)** | Third-party API integrations complex; CSV export sufficient for MVP. | Q3 2026 |
| **Mobile App (Native iOS/Android)** | Web-responsive design sufficient. Native apps deferred. | 2027 |
| **Multi-Language Support** | English-only for MVP. Swahili/other languages post-MVP. | Q2 2026 |
| **Two-Factor Authentication (2FA)** | Email OTP sufficient for MVP; SMS/authenticator apps deferred. | Q2 2026 |
| **Subscription Payment Processing** | Fixed pricing or manual invoicing acceptable for MVP. Stripe/M-Pesa integration post-launch. | Post-launch |
| **Audit Logging (Transaction-Level)** | Basic user action logging only. Detailed audit trail deferred. | Q2 2026 |
| **Customer Portal** | Owner/accountant-only access for MVP. Customer self-service portal post-MVP. | Q2 2026 |
| **Invoice Reminders (Automated)** | No email/SMS reminders. Manual follow-up required. | Q2 2026 |
| **Expense Categorization AI** | Auto-categorization deferred. Manual selection required. | Q3 2026 |
| **Tax Bracket Calculations** | Simplified approach; manual verification required. Advanced tax planning post-MVP. | Q3 2026 |

---

## 3. FEATURES DEFERRED TO POST-MVP (PHASE 2+)

### Planned for Explicit Future Releases

**Q1 2026 (1 month post-MVP launch):**
- Customer credit terms and invoice aging
- Recurring invoice templates
- Advanced invoice customization (custom fields, logo upload)

**Q2 2026 (3 months post-MVP launch):**
- Email notifications (invoice sent, payment due reminders)
- 2FA (SMS + authenticator apps)
- Advanced P&L reports (multi-period comparison, departmental breakdown)
- Bank reconciliation UI
- Transaction tagging for categorization
- Basic audit log (user actions, timestamps)

**Q3 2026 (6 months post-MVP launch):**
- AI-powered expense categorization
- AI tax optimization recommendations
- Multi-accounting period management
- Quarterly estimated tax calculations
- Third-party integrations (Xero, QuickBooks read-only)
- Invoice payment tracking (customer pays via system)

**2027 (Post-MVP Year):**
- Multi-country tax rules (Uganda, Tanzania, others)
- Native mobile apps (iOS, Android)
- Accountant network features
- Multi-language support (Swahili, French, others)
- Advanced analytics and KPIs

---

## 4. RATIONALE FOR KEY EXCLUSIONS

### Why Payroll is Excluded
Payroll requires knowledge of Kenyan employment law, PAYE calculations, statutory deductions (NHIF, NSSF), and monthly filing obligations. It is a separate product domain with different user personas (HR managers, not accountants). Including payroll would delay MVP by 4+ weeks.

### Why AI Tax Optimization is Excluded
AI features require:
- Historical tax data (not available in MVP with new accounts)
- Integration with KRA tax tables (not publicly available via API)
- Machine learning model training (requires 6+ months of user data)
- Legal review of tax advice claims (compliance risk)

### Why Multi-Country Support is Excluded
Kenyan VAT rules are specific (16% standard, exempt categories, reverse charge rules). Each country has different rates, exemptions, and filing requirements. Adding Uganda would require full schema redesign and testing. Kenya-only scope reduces complexity by 70%.

### Why Email Notifications are Excluded
Notification infrastructure (SMTP setup, email templates, unsubscribe management, bounce handling) adds 5+ days of development. MVP users can check dashboard manually. Notifications are nice-to-have, not blocking.

### Why Integrations are Excluded
Third-party integrations (M-Pesa, Xero, QuickBooks) require:
- Third-party API documentation (often incomplete or changing)
- OAuth 2.0 flow implementation
- Webhook handling for payment confirmations
- Error handling for API failures

CSV export/import is sufficient for MVP data exchange.

### Why Mobile App (Native) is Excluded
Developing native iOS and Android apps in parallel with MVP web app would require 3x the development time. Web-responsive design addresses 80% of mobile use cases. Native apps can follow post-MVP with React Native or Flutter.

---

## 5. CHANGE CONTROL PROCESS

**If a feature not in "INCLUDED" is requested during MVP development:**

1. **Request Documentation** – Requestor documents the feature, rationale, and impact
2. **Scope Impact Analysis** – Tech lead assesses timeline impact (in days)
3. **Stakeholder Decision** – Product owner decides: proceed (with delay) or defer
4. **Timeline Adjustment** – If approved, MVP launch date is re-planned
5. **This Document Update** – Scope lock is updated with approval date and rationale

**Example:** If invoice payment processing is requested mid-development:
- Impact: +10 days (M-Pesa API integration, webhook handling)
- Decision: Defer to post-MVP (not critical for MVP launch)
- Timeline: No change to MVP launch date

---

## 6. SIGN-OFF

**Scope is LOCKED as of January 2026.**

Development team proceeding with features listed in Section 1 only.

All other features require explicit change control approval and timeline re-planning.

---

| Role | Name | Approval | Date |
|------|------|----------|------|
| **Senior Engineer & Architect** | [Your Name] | ✓ | 2026-01-20 |
| **Product Owner** | [To be signed] | ⏳ | [Pending] |
| **Tech Lead** | [To be signed] | ⏳ | [Pending] |

---

**Questions?** Contact: [Product Owner / Tech Lead]  
**Last Updated:** 2026-01-20  
**Next Review:** After each SDLC phase completion
