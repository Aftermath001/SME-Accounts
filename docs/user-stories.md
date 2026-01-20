# SME-Accounts MVP: User Stories

**Project:** AI-powered SME Accounting & KRA Compliance SaaS  
**Target Market:** Kenya  
**Date:** January 2026  
**Status:** User Stories for MVP Implementation

---

## Story Format

**User Story ID:** [Feature]-[Number]  
**As a** [Role]  
**I want to** [Action]  
**So that** [Outcome]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## FEATURE GROUP 1: AUTHENTICATION & ACCOUNT SETUP

### AUTH-001: User Registration
**As a** business owner  
**I want to** create an account with email and password  
**So that** I can access the system and manage my business finances.

**Acceptance Criteria:**
- [ ] Registration form accepts email and password inputs
- [ ] Password validation enforced: minimum 8 characters, at least 1 uppercase letter, at least 1 number
- [ ] System prevents duplicate email registration
- [ ] After successful registration, user is prompted to verify email via OTP
- [ ] User receives clear error messages for invalid inputs (e.g., "Password must be at least 8 characters")

---

### AUTH-002: Email Verification
**As a** new user  
**I want to** verify my email address using an OTP code  
**So that** I can complete account setup and create my business profile.

**Acceptance Criteria:**
- [ ] User receives OTP code via email after registration
- [ ] User can enter OTP code in verification form
- [ ] System validates OTP (correct code, not expired)
- [ ] After successful verification, user is redirected to business profile setup
- [ ] User can request a new OTP if the original expires

---

### AUTH-003: User Login
**As a** business owner or accountant  
**I want to** log in with my email and password  
**So that** I can access my business data and perform accounting tasks.

**Acceptance Criteria:**
- [ ] Login form accepts email and password
- [ ] System validates credentials against stored data
- [ ] Successful login issues a JWT token (valid for 7 days)
- [ ] Failed login displays clear error message (no account enumeration)
- [ ] User is redirected to dashboard upon successful login

---

### AUTH-004: User Logout
**As a** logged-in user  
**I want to** log out of my account  
**So that** my session is terminated and my data is secure.

**Acceptance Criteria:**
- [ ] Logout button is visible in navigation menu
- [ ] Clicking logout clears the JWT token from local storage
- [ ] User is redirected to login page after logout
- [ ] Subsequent API requests without valid token return 401 error

---

### AUTH-005: Business Profile Creation
**As a** business owner  
**I want to** create my business profile with legal details and KRA information  
**So that** my invoices and reports are compliant with Kenyan tax requirements.

**Acceptance Criteria:**
- [ ] Business profile form includes fields: legal name, KRA PIN, VAT number (optional), industry, phone, email, address
- [ ] KRA PIN is validated (11-digit format)
- [ ] VAT number is optional (for non-VAT-registered traders)
- [ ] Form prevents submission with missing required fields
- [ ] After creation, profile cannot be edited (except optional fields like phone, email)
- [ ] Business data is isolated from other businesses

---

### AUTH-006: Assign User Role (Owner/Accountant/Viewer)
**As a** business owner  
**I want to** invite other users to my business and assign them roles  
**So that** my accountant or team members can help manage invoices and expenses.

**Acceptance Criteria:**
- [ ] Owner can view list of team members and their roles
- [ ] Owner can invite new user by email (sends invitation link)
- [ ] Owner can assign role: Accountant or Viewer to invited user
- [ ] Invited user receives email with join link and can set password
- [ ] After joining, user can only perform actions allowed by their role
- [ ] Owner can revoke access by removing team member

---

## FEATURE GROUP 2: BUSINESS SETUP & CUSTOMER DIRECTORY

### BIZ-001: View and Edit Business Profile
**As a** business owner  
**I want to** view and update my business information (phone, email, address)  
**So that** my invoices always show current contact details.

**Acceptance Criteria:**
- [ ] User can view current business profile (name, PIN, VAT number, industry, contact info, address)
- [ ] User can edit optional fields: phone, email, address
- [ ] System prevents editing of immutable fields (legal name, KRA PIN, VAT number)
- [ ] Changes are saved immediately
- [ ] User receives confirmation message after save

---

### BIZ-002: Create Customer
**As a** business owner  
**I want to** add a new customer to my customer directory  
**So that** I can quickly populate customer details when creating invoices.

**Acceptance Criteria:**
- [ ] Customer form includes fields: name, email, phone, address
- [ ] Name and email are required; phone and address are optional
- [ ] System prevents duplicate customer names (within same business)
- [ ] After creation, customer can be used in invoice line items
- [ ] User receives confirmation message after save

---

### BIZ-003: List and Search Customers
**As a** business owner  
**I want to** view all my customers and search by name  
**So that** I can quickly find and select a customer when creating an invoice.

**Acceptance Criteria:**
- [ ] Customer list displays all saved customers with name, email, phone
- [ ] Pagination shows 20 customers per page
- [ ] Search box filters customers by name (real-time or on submit)
- [ ] Each customer row shows option to edit or delete
- [ ] Deleting a customer shows confirmation dialog

---

### BIZ-004: Edit Customer
**As a** business owner  
**I want to** edit a customer's contact information  
**So that** I keep customer records up-to-date.

**Acceptance Criteria:**
- [ ] User can click "Edit" on any customer to open edit form
- [ ] Form pre-populates with current customer data
- [ ] User can modify name, email, phone, address
- [ ] Changes are saved immediately
- [ ] User receives confirmation message

---

## FEATURE GROUP 3: INVOICING

### INV-001: Create New Invoice
**As a** business owner or accountant  
**I want to** create a new invoice with customer and line items  
**So that** I can bill my customers and track sales.

**Acceptance Criteria:**
- [ ] Invoice creation form opens with empty/default values
- [ ] Form includes: customer name (dropdown, searchable), invoice date, due date
- [ ] Line items section allows adding multiple items (description, quantity, unit price, VAT %)
- [ ] VAT % defaults to 16% (Kenyan standard rate)
- [ ] System auto-calculates item subtotal, VAT amount, line total
- [ ] Subtotal, total VAT, and grand total are auto-calculated and displayed
- [ ] User can add payment notes and terms
- [ ] Invoice status defaults to "Draft"
- [ ] Clicking "Save as Draft" saves invoice without sending
- [ ] Invoice number is auto-generated in format: INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}

---

### INV-002: Edit Draft Invoice
**As a** business owner or accountant  
**I want to** edit a draft invoice before sending it to a customer  
**So that** I can correct details or add missing information.

**Acceptance Criteria:**
- [ ] User can open a draft invoice and modify all fields
- [ ] Invoice status must be "Draft" to enable editing
- [ ] Sent invoices cannot be edited (read-only mode)
- [ ] Line items can be added, removed, or modified
- [ ] VAT and totals recalculate when line items change
- [ ] User can save changes without sending

---

### INV-003: Send Invoice to Customer
**As a** business owner or accountant  
**I want to** send a draft invoice to a customer  
**So that** they receive a formal bill and can pay me.

**Acceptance Criteria:**
- [ ] User can click "Send" on a draft invoice
- [ ] System changes invoice status to "Sent"
- [ ] Sent invoice becomes read-only (no further edits)
- [ ] System records the date/time the invoice was sent
- [ ] User receives confirmation that invoice was sent
- [ ] Invoice can be downloaded as PDF

---

### INV-004: Mark Invoice as Paid
**As a** business owner or accountant  
**I want to** mark an invoice as paid and record the payment date  
**So that** I can track which customers have paid and update my cash flow.

**Acceptance Criteria:**
- [ ] User can click "Mark as Paid" on a sent invoice
- [ ] System prompts for payment date
- [ ] Invoice status changes to "Paid"
- [ ] Payment date is recorded in the system
- [ ] Paid invoices are excluded from overdue calculation
- [ ] User receives confirmation

---

### INV-005: List Invoices with Filters
**As a** business owner or accountant  
**I want to** view all my invoices and filter by status, date range, and customer  
**So that** I can quickly find specific invoices and monitor outstanding payments.

**Acceptance Criteria:**
- [ ] Invoice list displays: invoice number, customer name, date, amount, status
- [ ] Pagination shows 20 invoices per page
- [ ] Filter by status: Draft, Sent, Paid, Overdue
- [ ] Filter by date range: from date and to date
- [ ] Filter by customer: dropdown select
- [ ] Applied filters display clearly and can be cleared
- [ ] List shows total count of invoices matching filters

---

### INV-006: View Invoice Details
**As a** business owner or accountant  
**I want to** view the full details of a specific invoice  
**So that** I can verify amounts and customer information.

**Acceptance Criteria:**
- [ ] Clicking an invoice opens a detail view
- [ ] Detail view shows: business info, customer info, line items, totals, status, dates
- [ ] User can see when invoice was created, sent, and paid (if applicable)
- [ ] Detail view includes button to download PDF

---

### INV-007: Download Invoice as PDF
**As a** business owner or accountant  
**I want to** download an invoice as a PDF file  
**So that** I can send it to the customer via email or keep records.

**Acceptance Criteria:**
- [ ] PDF download button is available on invoice details page
- [ ] PDF includes business header (name, PIN, contact), customer info, line items, VAT, totals
- [ ] PDF is readable and formatted for printing
- [ ] File name is in format: INV-{BUSINESS_ID}-{YYYY}{MM}{SEQUENCE}.pdf
- [ ] PDF download completes without errors

---

### INV-008: Delete Draft Invoice
**As a** business owner or accountant  
**I want to** delete a draft invoice  
**So that** I can remove mistakes or unused invoices.

**Acceptance Criteria:**
- [ ] User can click "Delete" on a draft invoice
- [ ] System shows confirmation dialog before deleting
- [ ] Draft invoices can be deleted; sent invoices cannot
- [ ] Deleted invoice is removed from all lists
- [ ] User receives confirmation after deletion

---

## FEATURE GROUP 4: EXPENSE TRACKING

### EXP-001: Create Expense Record
**As a** business owner or accountant  
**I want to** record an expense with date, category, amount, and VAT  
**So that** I can track business costs and calculate tax-deductible expenses.

**Acceptance Criteria:**
- [ ] Expense form includes fields: date (not future), category (dropdown), description, amount, VAT %
- [ ] Category options: Utilities, Supplies, Travel, Meals, Professional Fees, Other
- [ ] Amount is in KES
- [ ] VAT % defaults to 16% (can be changed)
- [ ] Description is optional
- [ ] System calculates VAT amount automatically
- [ ] User can flag expense as "VAT-Recoverable" (input VAT)
- [ ] Clicking "Save" records the expense with current timestamp

---

### EXP-002: Attach Receipt to Expense
**As a** business owner or accountant  
**I want to** upload a receipt file (PDF, image) to an expense  
**So that** I have proof of the transaction for audit and tax purposes.

**Acceptance Criteria:**
- [ ] Expense form includes file upload field
- [ ] Accepted file types: PDF, JPG, PNG
- [ ] Maximum file size: 5 MB
- [ ] User can upload receipt during expense creation or edit
- [ ] Receipt file is stored and linked to expense
- [ ] User can view and download receipt from expense detail page

---

### EXP-003: Edit Expense
**As a** business owner or accountant  
**I want to** edit an expense after creating it  
**So that** I can correct errors or update details.

**Acceptance Criteria:**
- [ ] User can click "Edit" on any expense
- [ ] Edit form pre-populates with current expense data
- [ ] User can modify all fields except creation date
- [ ] Changes are saved immediately
- [ ] System recalculates totals if amount or VAT % changes
- [ ] User receives confirmation message

---

### EXP-004: Delete Expense
**As a** business owner or accountant  
**I want to** delete an incorrect or duplicate expense  
**So that** my expense records remain accurate.

**Acceptance Criteria:**
- [ ] User can click "Delete" on any expense
- [ ] System shows confirmation dialog before deleting
- [ ] Expense is removed from list and reports
- [ ] User receives confirmation after deletion

---

### EXP-005: List Expenses with Filters
**As a** business owner or accountant  
**I want to** view all my expenses and filter by date range, category, and amount  
**So that** I can analyze spending patterns and find specific expenses.

**Acceptance Criteria:**
- [ ] Expense list displays: date, category, description, amount, VAT, total
- [ ] Pagination shows 20 expenses per page
- [ ] Filter by date range: from date and to date
- [ ] Filter by category: multi-select dropdown
- [ ] Filter by VAT status: "Recoverable" only, "All"
- [ ] Applied filters display clearly and can be cleared
- [ ] List shows total count and total amount matching filters

---

### EXP-006: Bulk Import Expenses
**As a** business owner  
**I want to** upload a CSV file with multiple expenses  
**So that** I can import expenses in bulk instead of entering them one by one.

**Acceptance Criteria:**
- [ ] User can upload CSV file with columns: Date, Category, Amount, Description, VAT%
- [ ] CSV template is downloadable from the UI
- [ ] System validates each row (date format, valid category, numeric amount)
- [ ] System reports errors with row numbers and reasons
- [ ] User can choose to import only valid rows or fix and retry
- [ ] Successfully imported expenses are added to the list
- [ ] User receives confirmation with count of imported expenses

---

## FEATURE GROUP 5: FINANCIAL REPORTS

### REP-001: View Profit & Loss Report
**As a** business owner or accountant  
**I want to** see a monthly or quarterly profit & loss statement  
**So that** I can understand my business profitability and financial performance.

**Acceptance Criteria:**
- [ ] Report page allows selecting period: month or quarter
- [ ] Report displays:
  - Total Revenue (from sent/paid invoices)
  - Total Expenses (sum of all expenses)
  - Net Profit (revenue - expenses)
  - Breakdown by invoice status (Paid, Unpaid, Overdue)
- [ ] Revenue breakdown shows paid vs. unpaid amount separately
- [ ] Report can be downloaded as PDF or CSV
- [ ] All calculations are accurate (tested with sample data)

---

### REP-002: View Balance Sheet Summary
**As a** business owner or accountant  
**I want to** see a simplified balance sheet showing my financial position  
**So that** I can understand my assets, liabilities, and equity.

**Acceptance Criteria:**
- [ ] Report page displays simplified balance sheet
- [ ] Shows: Current Assets (cash, receivables from unpaid invoices)
- [ ] Shows: Current Liabilities (VAT payable, expenses payable)
- [ ] Shows: Equity (owner's capital based on net profit)
- [ ] Data is calculated from invoices and expenses
- [ ] Report can be downloaded as PDF or CSV
- [ ] All calculations are accurate (tested with sample data)

---

### REP-003: View Tax Summary Report
**As a** business owner or accountant  
**I want to** see a summary of my revenue, expenses, and tax positions  
**So that** I can prepare for tax filing and understand my compliance obligations.

**Acceptance Criteria:**
- [ ] Report page displays:
  - Total Revenue (from invoices)
  - Total Output VAT (VAT collected from customers)
  - Total Expenses
  - Total Input VAT (VAT on business expenses)
  - Net VAT Payable (output VAT - input VAT)
- [ ] Data is calculated accurately for selected period
- [ ] Report can be downloaded as PDF or CSV
- [ ] Calculations align with Kenyan VAT rules

---

### REP-004: Download Report as PDF
**As a** business owner or accountant  
**I want to** export any financial report as a PDF file  
**So that** I can share it with accountants, lenders, or keep for records.

**Acceptance Criteria:**
- [ ] PDF download button is available on each report page
- [ ] PDF is formatted for printing (readable, page breaks)
- [ ] PDF includes report title, period, business name, and all data
- [ ] File name includes report type and date (e.g., PL-2026-01.pdf)
- [ ] PDF download completes without errors

---

### REP-005: Download Report as CSV
**As a** business owner or accountant  
**I want to** export any financial report as a CSV file  
**So that** I can import it into Excel or other accounting software.

**Acceptance Criteria:**
- [ ] CSV download button is available on each report page
- [ ] CSV format is standard (comma-separated, UTF-8 encoding)
- [ ] CSV includes all report data (headers and rows)
- [ ] File name includes report type and date (e.g., PL-2026-01.csv)
- [ ] CSV can be opened without errors in Excel/Google Sheets

---

## FEATURE GROUP 6: KRA COMPLIANCE & VAT

### VAT-001: Automatic VAT Calculation
**As a** business owner or accountant  
**I want to** have VAT automatically calculated on invoices and expenses  
**So that** I don't have to manually compute tax amounts and reduce errors.

**Acceptance Criteria:**
- [ ] When creating invoice items, VAT % defaults to 16% (Kenyan standard rate)
- [ ] System calculates VAT amount = (unit price × quantity) × VAT %
- [ ] Line total = subtotal + VAT
- [ ] When creating expenses, VAT % defaults to 16%
- [ ] System calculates VAT amount = amount × VAT %
- [ ] All calculations are accurate (tested with sample data)
- [ ] VAT % can be changed per item/expense if needed

---

### VAT-002: Track Input & Output VAT
**As a** business owner or accountant  
**I want to** track VAT I collect from customers (output VAT) and VAT I pay on expenses (input VAT)  
**So that** I can calculate net VAT payable and comply with KRA requirements.

**Acceptance Criteria:**
- [ ] System tracks output VAT from all invoices (sent and paid)
- [ ] System tracks input VAT from all expenses marked as recoverable
- [ ] VAT Summary shows: Output VAT total, Input VAT total, Net VAT
- [ ] Net VAT = Output VAT - Input VAT (can be negative if input exceeds output)
- [ ] All calculations are accurate for selected period

---

### VAT-003: View Monthly VAT Summary Report
**As a** business owner or accountant  
**I want to** see a monthly VAT summary showing my VAT obligations  
**So that** I can prepare for KRA VAT filing.

**Acceptance Criteria:**
- [ ] User can select month and year for VAT summary
- [ ] Report displays:
  - Total Output VAT (from invoices)
  - Total Input VAT (from expenses)
  - Net VAT Payable (output - input)
  - VAT Payable Status: "Payable" (positive) or "Refundable" (negative)
- [ ] Report includes count of invoices and expenses in summary
- [ ] Report flags if outstanding (unpaid) invoices exist
- [ ] Report can be downloaded as PDF or CSV

---

### VAT-004: Export VAT Data to iTax Format
**As a** business owner or accountant  
**I want to** export my VAT data in a format compatible with KRA's iTax system  
**So that** I can file VAT returns electronically with minimal manual work.

**Acceptance Criteria:**
- [ ] User can select period and click "Export to iTax"
- [ ] System generates CSV file with columns: Invoice Number, Date, Customer Name, Gross Amount, VAT Amount, Net Amount
- [ ] CSV includes all sent invoices within the period
- [ ] CSV includes expense VAT claims (input VAT) marked as recoverable
- [ ] File format matches KRA iTax requirements (validated format)
- [ ] File name is in format: iTax-{BUSINESS_ID}-{YYYY}{MM}.csv
- [ ] User can download CSV file

---

### VAT-005: Validate VAT Compliance
**As a** business owner or accountant  
**I want to** see warnings or flags if my VAT data has issues  
**So that** I can correct problems before filing with KRA.

**Acceptance Criteria:**
- [ ] System warns if outstanding (unpaid) invoices exist during VAT period
- [ ] System flags if output VAT exceeds total invoiced amount (error check)
- [ ] System warns if input VAT claims exceed expenses with VAT (error check)
- [ ] System highlights if VAT rate is non-standard (not 16%)
- [ ] Warnings are displayed on VAT Summary Report
- [ ] Warnings do not prevent export, but alert user to review

---

## FEATURE GROUP 7: MULTI-TENANCY & SECURITY

### SEC-001: Ensure Data Isolation Between Businesses
**As a** business owner  
**I want to** be certain that my business data is completely isolated from other businesses  
**So that** my financial information remains private and secure.

**Acceptance Criteria:**
- [ ] System enforces tenant_id check on all data queries (database level)
- [ ] User can only see invoices, expenses, and reports for their own business
- [ ] User cannot access another business's data via API even with valid JWT token
- [ ] All API endpoints validate that tenant_id matches authenticated user's business
- [ ] Database schema includes tenant_id on all data tables
- [ ] No data cross-contamination in any scenario (tested with multiple businesses)

---

### SEC-002: Enforce Role-Based Access Control
**As a** a system  
**I want to** enforce user roles and permissions  
**So that** users can only perform actions allowed by their role.

**Acceptance Criteria:**
- [ ] Owner can create invoices, expenses, reports, manage team
- [ ] Accountant can create invoices and expenses, view reports, cannot manage team
- [ ] Viewer can view reports and invoices only (read-only)
- [ ] System returns 403 Forbidden if user attempts unauthorized action
- [ ] Role checks are enforced at API level (not just UI)
- [ ] All role-based restrictions are tested

---

## ACCEPTANCE & SIGN-OFF

**Total User Stories:** 35  
**Coverage:** All MVP features from approved requirements

**Next Steps:**
1. Development team to estimate story points for each story
2. Prioritize stories for sprint planning
3. Create tasks/subtasks as needed during implementation
4. Mark stories as complete upon feature delivery

---

**Document prepared for:** Development team handoff  
**Ready for:** Sprint planning and implementation
