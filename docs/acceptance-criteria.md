# SME-Accounts MVP: Acceptance Criteria

**Project:** AI-powered SME Accounting & KRA Compliance SaaS  
**Target Market:** Kenya  
**Date:** January 2026  
**Status:** Acceptance Criteria for MVP Implementation

---

## Overview

This document defines objective, testable acceptance criteria for each MVP feature area. All criteria must be verifiable through testing (automated or manual) and do not include UI polish requirements.

---

## FEATURE AREA 1: AUTHENTICATION

### AC-AUTH-001: User Registration and Validation

**Given** a new user accessing the registration page  
**When** they submit the registration form with valid email and password  
**Then:**
- Email is stored in the database
- Password is hashed using bcrypt with 10 salt rounds
- User account is created with status "pending_verification"
- User receives email with OTP code
- Form validation rejects passwords shorter than 8 characters
- Form validation rejects passwords without at least 1 uppercase letter
- Form validation rejects passwords without at least 1 digit
- Form validation rejects duplicate email addresses (case-insensitive)
- Error messages clearly indicate validation failures (e.g., "Password must be at least 8 characters")
- No plaintext passwords are stored in database or logs

---

### AC-AUTH-002: Email Verification

**Given** a user with an unverified email  
**When** they enter the correct OTP code sent to their email  
**Then:**
- System validates OTP against stored code
- System checks OTP expiry (valid for 15 minutes)
- User account status changes to "email_verified"
- User is redirected to business profile creation
- Expired OTP returns clear error message
- Incorrect OTP returns error without revealing if code exists
- User can request new OTP, which invalidates previous code

---

### AC-AUTH-003: User Login and JWT Issuance

**Given** a user with verified email and correct password  
**When** they submit login credentials  
**Then:**
- System validates email exists in database
- System compares submitted password against stored hash using bcrypt
- Valid credentials result in JWT token issuance
- JWT token includes: user_id, email, business_id (if created), issued_at, expiry
- JWT token expires after 7 days (604800 seconds)
- Token is returned in response body (no cookie storage for MVP)
- Invalid credentials return error without revealing if email exists
- Failed login attempts are not rate-limited (future enhancement)

---

### AC-AUTH-004: JWT Validation on Protected Endpoints

**Given** a user with valid JWT token  
**When** they make a request to a protected endpoint  
**Then:**
- API extracts JWT from Authorization header (Bearer token)
- API validates JWT signature using secret key
- API checks JWT expiry and rejects expired tokens
- API extracts user_id and business_id from token claims
- Request is processed with user context
- Expired or invalid tokens return 401 Unauthorized response
- Missing Authorization header returns 401 Unauthorized
- Malformed Bearer token format returns 401 Unauthorized

---

### AC-AUTH-005: User Logout

**Given** a logged-in user  
**When** they request logout  
**Then:**
- Server acknowledges logout (status 200)
- Client clears JWT token from local storage
- User is redirected to login page
- Subsequent API requests without valid token return 401
- No server-side session storage required (stateless logout)

---

### AC-AUTH-006: Role-Based Access Control (RBAC)

**Given** a user with a specific role (Owner, Accountant, Viewer)  
**When** they attempt an action within the application  
**Then:**
- Owner role can: create/edit invoices, create/edit expenses, view all reports, manage team members
- Accountant role can: create/edit invoices, create/edit expenses, view all reports, cannot manage team
- Viewer role can: view invoices (read-only), view expenses (read-only), view all reports (read-only)
- Any unauthorized action returns 403 Forbidden response
- Role checks are enforced at API endpoint level (not just frontend)
- User's role is validated against each protected endpoint

---

## FEATURE AREA 2: BUSINESS SETUP

### AC-BIZ-001: Business Profile Creation and Validation

**Given** a verified user creating their first business  
**When** they submit the business profile form  
**Then:**
- Form requires: legal name, KRA PIN, industry
- Form allows optional: VAT number, phone, email, address
- KRA PIN format is validated as 11-digit numeric (e.g., "A001234567Z" or numeric equivalent)
- VAT number format is optional; if provided, must be non-empty string
- Industry is selected from predefined dropdown list
- Business record is created in database with tenant_id
- Business data is linked to user (user becomes Owner)
- User is redirected to dashboard after creation
- Business name and KRA PIN cannot be changed after creation
- Optional fields (phone, email, address) can be edited later

---

### AC-BIZ-002: Business Profile Immutability

**Given** a business profile that has been created  
**When** the owner attempts to edit the business  
**Then:**
- Legal name field is read-only (cannot be changed)
- KRA PIN field is read-only (cannot be changed)
- VAT number field is read-only (cannot be changed)
- Industry field is read-only (cannot be changed)
- Phone, email, and address fields are editable
- Edit operations return 400 Bad Request if immutable fields are modified
- Audit log records who requested change and timestamp (deferred implementation)

---

### AC-BIZ-003: Multi-Tenancy Data Isolation

**Given** two users from different businesses  
**When** they access the system simultaneously  
**Then:**
- User A cannot access User B's invoices, expenses, or reports
- All database queries include tenant_id filter (enforced at query level)
- API endpoints verify user's business_id matches requested data's business_id
- Attempting to access another business's data returns 403 Forbidden
- Foreign key constraints prevent cross-tenant relationships
- No data cross-contamination across all API endpoints (tested with multiple tenants)

---

### AC-BIZ-004: Customer Directory CRUD Operations

**Given** a business owner managing customers  
**When** they create a new customer  
**Then:**
- Form requires: customer name, email
- Form allows optional: phone, address
- Duplicate customer names are rejected (within same business)
- Customer is stored with business_id (tenant isolation)
- Customer can be selected when creating invoices
- Customer list retrieves only customers for authenticated user's business
- Customer edit allows updating all optional fields
- Customer delete removes record from database
- Deleting customer shows confirmation dialog (UI), system allows deletion only if no active invoices reference it (future validation)

---

## FEATURE AREA 3: INVOICING

### AC-INV-001: Invoice Creation and Auto-Numbering

**Given** a user creating a new invoice  
**When** they submit the invoice form  
**Then:**
- Invoice number is auto-generated in format: `INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}`
  - Example: `INV-BIZ001-202601001`
- Invoice number is unique within business
- Invoice number is never reused (SEQUENCE increments)
- Invoice date defaults to today
- Due date is required and cannot be before invoice date
- Customer name is required and populated from customer directory or new entry
- Line items can be added with: description, quantity, unit price, VAT %
- VAT % defaults to 16% for each line item
- For each line item: line subtotal = quantity × unit price
- For each line item: line VAT = line subtotal × (VAT % / 100)
- For each line item: line total = line subtotal + line VAT
- Invoice subtotal = sum of all line subtotals
- Invoice total VAT = sum of all line VATs
- Invoice grand total = subtotal + total VAT
- Invoice status defaults to "Draft"
- Invoice is stored in database with tenant_id
- All calculations are mathematically accurate

---

### AC-INV-002: Invoice Status Workflow

**Given** an invoice in the system  
**When** status transitions occur  
**Then:**
- Draft → Sent: User clicks "Send"; status changes, invoice becomes read-only, sent_at timestamp recorded
- Sent → Paid: User clicks "Mark as Paid"; payment_date is recorded
- Draft can be deleted; Sent/Paid cannot be deleted
- Only Draft invoices can be edited; Sent/Paid are read-only
- Invoice status is persisted in database
- Status changes are atomic (all-or-nothing updates)
- Invalid state transitions return error (e.g., Draft → Paid without Sent)

---

### AC-INV-003: Invoice Editing (Draft Only)

**Given** a draft invoice  
**When** the owner attempts to edit it  
**Then:**
- Invoice form opens with all current values pre-populated
- All fields are editable (customer, dates, line items, notes)
- Changing line items recalculates subtotal, VAT, and grand total
- Save operation updates database
- Changes are atomic (all-or-nothing)
- Sent or Paid invoices return 400 Bad Request if edit is attempted
- Edit validation applies same rules as creation (date, amount, VAT)

---

### AC-INV-004: Invoice Listing and Filtering

**Given** a user viewing their invoices  
**When** they access the invoice list  
**Then:**
- List displays: invoice number, customer name, date, amount, status
- List is paginated with 20 invoices per page
- List can be filtered by status (Draft, Sent, Paid, Overdue)
- List can be filtered by date range (from_date, to_date)
- List can be filtered by customer (single select)
- Multiple filters can be applied simultaneously
- Applied filters are clearly displayed and can be cleared
- List shows total count of invoices matching filters
- Overdue invoices are calculated as: status="Sent" AND due_date < today
- List is sorted by invoice date (newest first) by default
- Pagination and filters only return invoices for authenticated user's business

---

### AC-INV-005: Invoice Detail View

**Given** a user viewing a specific invoice  
**When** they click to view details  
**Then:**
- Full invoice data is displayed: invoice number, customer, dates, line items, totals, status
- Business information is displayed: name, address, contact
- Customer information is displayed: name, email, phone (if available)
- All line items are listed with quantity, unit price, VAT %, line total
- Timestamps are displayed: created_at, sent_at (if applicable), paid_at (if applicable)
- Buttons available depend on status:
  - Draft: Edit, Send, Delete
  - Sent: Mark as Paid, Download PDF
  - Paid: Download PDF
- Invoice detail is read-only except for Draft invoices
- Accessing another business's invoice returns 403 Forbidden

---

### AC-INV-006: Invoice PDF Generation

**Given** an invoice  
**When** user clicks "Download PDF"  
**Then:**
- PDF is generated server-side
- PDF includes: business header (name, PIN, contact), invoice number, date, customer info
- PDF includes: line items table with quantity, unit price, VAT %, line total
- PDF includes: subtotal, VAT total, grand total
- PDF file name format: `INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}.pdf`
- PDF is readable and formatted for printing on A4 paper
- PDF download completes without errors (status 200)
- Content-Type header is set to "application/pdf"
- PDFs from Draft, Sent, and Paid invoices are identical (status not on PDF)

---

### AC-INV-007: Invoice Deletion

**Given** a draft invoice  
**When** user clicks "Delete" and confirms  
**Then:**
- Invoice record is deleted from database
- Invoice is removed from all lists
- Invoice number is not reused
- Sent or Paid invoices cannot be deleted (return 400 error)
- Deletion is atomic (complete removal or no change)
- User receives confirmation message

---

## FEATURE AREA 4: EXPENSE TRACKING

### AC-EXP-001: Expense Creation and Validation

**Given** a user creating an expense  
**When** they submit the expense form  
**Then:**
- Form requires: date (not future), category, amount
- Form allows optional: description, VAT %, receipt file
- Date cannot be in the future (validation rejects today + 1 or later)
- Category is selected from predefined list: Utilities, Supplies, Travel, Meals, Professional Fees, Other
- Amount is numeric, greater than 0, stored in KES
- VAT % defaults to 16% (can be changed)
- VAT amount is auto-calculated: amount × (VAT % / 100)
- Total expense = amount + VAT amount
- User can flag expense as "VAT-Recoverable" (input VAT tracking)
- Expense is stored in database with tenant_id and created_at timestamp
- Receipt file is optional; if provided, stored as attachment
- Expense is immediately accessible in expense list

---

### AC-EXP-002: Expense Receipt Attachment

**Given** an expense with optional receipt upload  
**When** user uploads a file during creation or edit  
**Then:**
- Accepted file types: PDF, JPG, PNG
- Maximum file size: 5 MB per file
- File is stored server-side or in cloud storage (implementation choice)
- Receipt is linked to expense record via foreign key
- User can view/download receipt from expense detail page
- Receipt filename is preserved (with sanitization to prevent injection)
- Deleting expense also deletes associated receipt file

---

### AC-EXP-003: Expense Editing

**Given** an existing expense  
**When** user clicks "Edit" and modifies fields  
**Then:**
- Edit form pre-populates with current expense data
- User can modify: date (not future), category, description, amount, VAT %, receipt
- Changes are saved to database
- VAT and total are recalculated if amount or VAT % changes
- Edit is atomic (all changes applied or none)
- Only authenticated user's business expenses can be edited (tenant check)

---

### AC-EXP-004: Expense Deletion

**Given** an existing expense  
**When** user clicks "Delete" and confirms  
**Then:**
- Expense record is deleted from database
- Associated receipt file is deleted
- Expense is removed from all lists and reports
- Deletion is atomic
- User receives confirmation message

---

### AC-EXP-005: Expense Listing and Filtering

**Given** a user viewing their expenses  
**When** they access the expense list  
**Then:**
- List displays: date, category, description, amount, VAT, total
- List is paginated with 20 expenses per page
- List can be filtered by date range (from_date, to_date)
- List can be filtered by category (multi-select)
- List can be filtered by VAT-Recoverable status (All, Recoverable only)
- Multiple filters can be applied simultaneously
- Applied filters are clearly displayed and can be cleared
- List shows total count of expenses matching filters
- List shows sum of amounts and sum of VAT for matching expenses
- List is sorted by expense date (newest first) by default
- Pagination and filters only return expenses for authenticated user's business

---

### AC-EXP-006: Bulk Expense Import (CSV)

**Given** a user importing expenses from CSV  
**When** they upload a CSV file  
**Then:**
- CSV template has columns: Date, Category, Amount, Description, VAT%
- System validates each row:
  - Date format is valid (YYYY-MM-DD) and not in future
  - Category matches predefined list
  - Amount is numeric and > 0
  - VAT% is numeric and between 0-100
- System reports validation errors with row numbers
- User can choose to import only valid rows
- Successfully validated rows are inserted into database
- Expenses are created with tenant_id and created_at timestamp
- Duplicate detection is skipped (user responsible for duplicates)
- User receives confirmation with count of imported expenses
- CSV download button provides template for reference

---

## FEATURE AREA 5: FINANCIAL REPORTS

### AC-REP-001: Profit & Loss Report Calculation

**Given** a business with invoices and expenses  
**When** user selects a period (month or quarter) and views P&L  
**Then:**
- Report calculates Total Revenue = sum of grand totals from Sent and Paid invoices
- Report calculates Total Expenses = sum of expenses (amount + VAT) for period
- Report calculates Net Profit = Total Revenue - Total Expenses
- Revenue breakdown shows:
  - Paid invoices (amount): sum of grand totals where status = Paid
  - Unpaid invoices (amount): sum of grand totals where status = Sent (not yet paid)
  - Overdue invoices (amount): sum of grand totals where status = Sent AND due_date < today
- Expense breakdown shows total by category
- All calculations are mathematically accurate
- Report is calculated on-demand (no caching for MVP)
- Report only includes data for authenticated user's business

---

### AC-REP-002: Balance Sheet Summary Calculation

**Given** a business with invoices and expenses  
**When** user views balance sheet summary  
**Then:**
- Current Assets section shows:
  - Cash (placeholder for MVP, e.g., sum of paid invoices): sum of Paid invoices
  - Accounts Receivable: sum of Sent (unpaid) invoices
  - Total Current Assets: sum of above
- Current Liabilities section shows:
  - VAT Payable (calculated from VAT Summary)
  - Accounts Payable (placeholder, zero for MVP)
  - Total Current Liabilities: sum of above
- Equity section shows:
  - Owner's Capital (calculated as accumulated net profit from inception)
  - Total Equity: capital value
- Balance sheet equation check: Assets = Liabilities + Equity (for validation)
- All calculations are mathematically accurate
- Report only includes data for authenticated user's business

---

### AC-REP-003: Tax Summary Calculation

**Given** a business with invoices and expenses  
**When** user views tax summary  
**Then:**
- Total Revenue = sum of grand totals from Sent and Paid invoices
- Output VAT = sum of VAT from all invoice line items (Sent and Paid)
- Total Expenses = sum of all expense amounts (not including VAT)
- Input VAT = sum of VAT from expenses marked as "VAT-Recoverable"
- Net VAT Payable = Output VAT - Input VAT
- Payable Status indicates: "Payable" if Net VAT > 0, "Refundable" if Net VAT < 0, "Zero" if Net VAT = 0
- Report includes count of invoices and expenses in summary period
- All calculations are mathematically accurate and align with Kenyan VAT rules
- Report only includes data for authenticated user's business

---

### AC-REP-004: Report Period Selection

**Given** a user accessing a report  
**When** they select period type (month or quarter)  
**Then:**
- Month selection: user picks month and year; report includes Jan 1 - 31 (or last day of month)
- Quarter selection: user picks Q1/Q2/Q3/Q4 and year; report includes 3-month period
- Default period is current month
- Period selection is applied to all invoice and expense filtering
- Report data changes when period is changed
- Period information is displayed on report (e.g., "P&L for January 2026")

---

### AC-REP-005: Report PDF Download

**Given** a financial report  
**When** user clicks "Download as PDF"  
**Then:**
- PDF is generated server-side with report data
- PDF includes: report title, period, business name, all calculations
- PDF is formatted for printing (page breaks, readable fonts)
- PDF file name: `{ReportType}-{BUSINESS_ID}-{YYYY}{MM}.pdf` (e.g., `PL-BIZ001-202601.pdf`)
- PDF download completes without errors (status 200)
- Content-Type header is set to "application/pdf"
- PDF data matches report data displayed on screen

---

### AC-REP-006: Report CSV Download

**Given** a financial report  
**When** user clicks "Download as CSV"  
**Then:**
- CSV is generated with all report data
- CSV format: standard comma-separated values, UTF-8 encoding
- CSV includes headers and all calculated rows
- CSV file name: `{ReportType}-{BUSINESS_ID}-{YYYY}{MM}.csv`
- CSV is downloadable and opens without errors in Excel/Google Sheets
- CSV data matches report data displayed on screen
- Numbers in CSV are unformatted (e.g., 1234.56, not "1,234.56") for spreadsheet compatibility

---

## FEATURE AREA 6: KRA COMPLIANCE & VAT

### AC-VAT-001: Automatic VAT Calculation

**Given** an invoice or expense being created  
**When** user enters line item amount and VAT %  
**Then:**
- Invoice line item: VAT = (quantity × unit_price) × (VAT% / 100)
- Expense: VAT = amount × (VAT% / 100)
- All VAT amounts are calculated to 2 decimal places
- VAT % defaults to 16% (Kenyan standard rate) if not specified
- VAT % can be overridden per item (0-100% allowed)
- Calculations are performed immediately (real-time or on save)
- All VAT calculations are mathematically accurate (tested with sample data)

---

### AC-VAT-002: Input & Output VAT Tracking

**Given** invoices (sales) and expenses (purchases)  
**When** system processes VAT tracking  
**Then:**
- Output VAT tracked from: all invoice line items (Sent and Paid status)
- Input VAT tracked from: all expenses marked as "VAT-Recoverable"
- VAT Summary shows:
  - Total Output VAT = sum of VAT from all invoices
  - Total Input VAT = sum of VAT from recoverable expenses
  - Net VAT = Output VAT - Input VAT (can be negative)
- VAT is calculated for selected period only
- VAT tracking is per-business (no cross-tenant mixing)
- All totals are mathematically accurate

---

### AC-VAT-003: Monthly VAT Summary Report

**Given** a user generating VAT summary for a specific month  
**When** they select month and year, and view VAT summary  
**Then:**
- Report displays:
  - Total Output VAT (from invoices)
  - Total Input VAT (from expenses)
  - Net VAT Payable = Output VAT - Input VAT
  - VAT Payable Status (Payable / Refundable / Zero)
- Report includes count of invoices and expenses in period
- Report flags if outstanding (Sent, unpaid) invoices exist in period
- Report indicates compliance status: "Compliant" if all data is valid, "Review Required" if issues detected
- Report is downloadable as PDF and CSV
- All calculations align with Kenyan VAT rules (16% standard rate)

---

### AC-VAT-004: iTax Export Format

**Given** a user exporting VAT data for KRA filing  
**When** they select period and click "Export to iTax"  
**Then:**
- CSV file is generated with columns:
  - Invoice Number
  - Date (YYYY-MM-DD)
  - Customer Name
  - Gross Amount (subtotal without VAT)
  - VAT Amount
  - Net Amount (with VAT)
- CSV includes all Sent invoices within selected period
- CSV includes expense VAT claims (input VAT) if marked recoverable
- CSV format matches KRA iTax system specifications (format to be validated with KRA docs)
- File name: `iTax-{BUSINESS_ID}-{YYYY}{MM}.csv`
- CSV is downloadable without errors
- CSV data is accurate and matches reports

---

### AC-VAT-005: VAT Compliance Validation

**Given** a VAT summary or export operation  
**When** system validates VAT compliance  
**Then:**
- System warns if outstanding (Sent, unpaid) invoices exist in period
- System flags if Output VAT > sum of invoice gross amounts (error check)
- System flags if Input VAT claims > sum of expense amounts (error check)
- System warns if non-standard VAT rates are detected (not 16%)
- Warnings are displayed on VAT Summary Report
- Warnings do not prevent export (user can proceed, acknowledging issues)
- Warnings are logged for audit purposes (future enhancement)

---

## CROSS-CUTTING ACCEPTANCE CRITERIA

### AC-CROSS-001: Data Integrity and Consistency

**For all features:**
- Database transactions are atomic (all-or-nothing)
- Foreign key constraints prevent orphaned records
- Concurrent updates use optimistic locking (last-write-wins) or pessimistic locking (row-level)
- No data duplication across operations
- Calculations are consistent across API and reports

---

### AC-CROSS-002: API Response Standards

**For all API endpoints:**
- Success responses return HTTP 200 (GET, POST, PUT) or 201 (POST create)
- Error responses return appropriate 4xx status (400, 401, 403, 404, 409)
- Error responses include error code and description
- All responses include Content-Type header (application/json)
- No sensitive data (passwords, secrets) in response bodies or logs

---

### AC-CROSS-003: Input Validation

**For all user inputs:**
- String fields: max length enforced, SQL injection prevention
- Numeric fields: type checking, range validation
- Date fields: format validation, logical consistency (no future dates where invalid)
- File uploads: type and size validation
- Dropdown selections: value must exist in allowed list
- All validation errors are user-friendly and actionable

---

### AC-CROSS-004: Error Handling and User Feedback

**For all operations:**
- Errors are caught and handled gracefully (no 500 server errors for user errors)
- Error messages are clear and non-technical (suitable for non-technical SME users)
- Error messages suggest corrective action when possible
- Form submissions show field-level validation errors
- API errors include traceable error codes (for support team)
- Sensitive errors (e.g., database errors) are not exposed to users

---

### AC-CROSS-005: Authentication and Authorization

**For all protected operations:**
- JWT token is required in Authorization header (Bearer token)
- Token expiry is validated (7 days)
- User identity is verified before each operation
- User's business_id is checked against data being accessed
- Role-based permissions are enforced at endpoint level
- 401 Unauthorized returned for authentication failures
- 403 Forbidden returned for authorization failures

---

### AC-CROSS-006: Performance and Scalability

**For all features:**
- List endpoints return results in < 500ms (P95) for up to 50,000 records
- Single-record operations (create, read, update, delete) return in < 200ms
- PDF generation completes in < 5 seconds
- CSV export completes in < 5 seconds
- No unbounded queries (all list endpoints are paginated)
- Database indexes exist on commonly filtered columns (tenant_id, date, status)

---

### AC-CROSS-007: Data Privacy and Security

**For all data:**
- Passwords are hashed (bcrypt, not reversible)
- Secrets (API keys, JWT secret) are stored in environment variables
- No sensitive data (passwords, tokens) logged
- HTTPS enforced in production
- CORS configured to allow frontend domain only
- Session tokens have expiry (7 days)
- Multi-tenant isolation enforced at all layers

---

## TESTING APPROACH

### Manual Testing (MVP Phase)
- Each acceptance criterion is verified through manual testing
- Test cases are created based on acceptance criteria
- Test results are documented for sign-off

### Automated Testing (Post-MVP)
- Unit tests for calculation logic (VAT, totals, filters)
- Integration tests for API endpoints
- E2E tests for critical user workflows
- Security tests for authentication and authorization

---

## SIGN-OFF

**Acceptance Criteria Definition Complete.** All MVP features have defined, testable, objective acceptance criteria.

**Next Steps:**
1. Development team uses these criteria for implementation validation
2. QA team uses these criteria for test case creation
3. Product owner uses these criteria for feature sign-off

---

**Document prepared for:** Development and QA teams  
**Ready for:** Implementation and testing
