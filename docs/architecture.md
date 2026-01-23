# SME-Accounts MVP: System Architecture

**Project:** AI-powered SME Accounting & KRA Compliance SaaS  
**Target Market:** Kenya  
**Date:** January 2026  
**Status:** Phase 2 – System & Data Design

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET / CLIENT                        │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                        │
│                      Single Page Application                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ UI Components (pages, forms, reports, tables)            │   │
│  │ - Authentication Pages (login, register, verify)         │   │
│  │ - Dashboard & Navigation                                 │   │
│  │ - Invoice Management (create, list, detail, PDF)         │   │
│  │ - Expense Tracking (create, list, import)                │   │
│  │ - Reports (P&L, Balance Sheet, Tax Summary)              │   │
│  │ - VAT Compliance (summary, iTax export)                  │   │
│  │ - Business Profile & Customer Directory                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ State Management (React Context / Redux)                 │   │
│  │ - User session (JWT token, role, business_id)            │   │
│  │ - Cached API responses (invoices, expenses, reports)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ HTTP Client (Axios / Fetch)                              │   │
│  │ - Automatically includes JWT in Authorization header     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ REST API (HTTP/HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (NGINX / Reverse Proxy)            │
│ - SSL/TLS termination                                            │
│ - Request routing to backend                                     │
│ - Rate limiting (future enhancement)                             │
└─────────────────────────────────────────────────────────────────┘
                              │ Internal network
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express / NestJS)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routes & Controllers                                 │   │
│  │ - POST   /auth/register, /auth/login, /auth/verify       │   │
│  │ - GET    /business/:id                                   │   │
│  │ - POST   /invoices, GET /invoices, PUT /invoices/:id     │   │
│  │ - POST   /expenses, GET /expenses, PUT /expenses/:id     │   │
│  │ - GET    /reports/profit-loss, /reports/balance-sheet    │   │
│  │ - GET    /reports/tax-summary                            │   │
│  │ - GET    /vat/summary, /vat/export-itax                  │   │
│  │ - POST   /customers, GET /customers, PUT /customers/:id  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Middleware                                               │   │
│  │ - JWT Authentication (verify token, extract user_id)    │   │
│  │ - Tenant Isolation (inject business_id, enforce checks)  │   │
│  │ - Error Handling (catch exceptions, return user-friendly │   │
│  │   error messages)                                        │   │
│  │ - Request Logging (timestamp, endpoint, status)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Service Layer (Business Logic)                           │   │
│  │ - AuthService (register, login, verify OTP)              │   │
│  │ - BusinessService (create profile, get profile)          │   │
│  │ - InvoiceService (create, edit, send, mark paid, list)   │   │
│  │ - ExpenseService (create, edit, delete, list, import)    │   │
│  │ - ReportService (P&L, balance sheet, tax summary calc)   │   │
│  │ - VATService (VAT calculation, tracking, export)         │   │
│  │ - CustomerService (CRUD operations)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Utility Modules                                          │   │
│  │ - PDF Generation (invoice, reports)                      │   │
│  │ - CSV Export (expenses, iTax format)                     │   │
│  │ - Email Service (OTP, notifications – deferred)          │   │
│  │ - Encryption & Hashing (bcrypt, JWT)                     │   │
│  │ - Validation (input sanitization, business rules)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Repository Layer (Data Abstraction)                      │   │
│  │ - UserRepository (CRUD on users table)                   │   │
│  │ - BusinessRepository (CRUD on businesses table)          │   │
│  │ - InvoiceRepository (CRUD + queries on invoices table)   │   │
│  │ - ExpenseRepository (CRUD + queries on expenses table)   │   │
│  │ - CustomerRepository (CRUD on customers table)           │   │
│  │ - Ensures all queries include tenant_id filter           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ PostgreSQL protocol
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Tables (multi-tenant schema)                             │   │
│  │ - users (id, email, password_hash, created_at)           │   │
│  │ - businesses (id, owner_id, name, kra_pin, vat_num, ...) │   │
│  │ - business_members (business_id, user_id, role)          │   │
│  │ - invoices (id, business_id, invoice_num, customer, ...)│   │
│  │ - invoice_items (id, invoice_id, description, qty, ...)  │   │
│  │ - expenses (id, business_id, date, category, amount, ...)│   │
│  │ - customers (id, business_id, name, email, phone, ...)   │   │
│  │ - expense_receipts (id, expense_id, file_path)           │   │
│  │ - audit_logs (id, business_id, user_id, action, ...)     │   │
│  │ (See Section 2: Database Schema for full details)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Indexes                                                  │   │
│  │ - business_id (tenant isolation, filter performance)     │   │
│  │ - user_id (user lookup, authentication)                  │   │
│  │ - invoice_date, status (reporting, filtering)            │   │
│  │ - expense_date, category (reporting, filtering)          │   │
│  │ - created_at, updated_at (audit, sorting)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Constraints                                              │   │
│  │ - Foreign keys (referential integrity)                   │   │
│  │ - Unique constraints (invoice number, email per business)│   │
│  │ - Check constraints (dates, amounts, VAT %)              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ Backup & replication
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE BACKUP & RECOVERY                          │
│ - Daily database snapshots (stored offsite)                      │
│ - Point-in-time recovery capability                              │
│ - 7-year retention for tax compliance                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT BREAKDOWN

### Frontend Layer (React + Vite)

**Purpose:** User interface and client-side state management

**Key Components:**
- **Authentication Pages:**
  - Registration: Email, password input, validation
  - Login: Email, password input, JWT token storage
  - Email Verification: OTP input
  - Password Reset: (future)

- **Dashboard & Navigation:**
  - Main navigation menu (invoices, expenses, reports, business, team)
  - User profile dropdown (role, business name, logout)
  - Quick stats (pending invoices, monthly revenue, VAT summary)

- **Invoice Management:**
  - Invoice list (table with filters: status, date, customer)
  - Create invoice (form with line items, auto-calculate totals)
  - Edit invoice (draft only)
  - Invoice detail (view, PDF download, mark as paid)

- **Expense Tracking:**
  - Expense list (table with filters: date, category, VAT status)
  - Create expense (form with category, amount, receipt upload)
  - Edit expense (modify any field)
  - CSV import modal (upload template, validate, preview)

- **Reports:**
  - P&L Report (period selection, display, PDF/CSV download)
  - Balance Sheet (period selection, display, PDF/CSV download)
  - Tax Summary (period selection, display, PDF/CSV download)

- **VAT Compliance:**
  - VAT Summary (monthly, output/input VAT, net payable, warnings)
  - iTax Export (download CSV, format validation)

- **Business & Team Management:**
  - Business profile view/edit (read-only name/PIN, editable contact)
  - Customer directory (list, create, edit, delete, search)
  - Team members (list, invite, remove, role assignment)

**Technology Stack:**
- React 18+ with Hooks (functional components)
- Vite (fast build tool, smaller bundle)
- Axios or Fetch API (HTTP client with interceptors for JWT)
- React Context or Redux (state management, user session, cached data)
- React Router (client-side routing)
- Form library (React Hook Form or Formik for validation)
- UI component library (shadcn/ui, Material-UI, or custom)
- PDF viewer (react-pdf or similar for invoice preview)

**Client-Side State:**
- `userState`: { id, email, role, business_id, token, verified }
- `businessState`: { id, name, kra_pin, vat_num, industry, phone, email }
- `invoicesCache`: { items, filters, total }
- `expensesCache`: { items, filters, total }
- `customersCache`: { items }
- `uiState`: { loading, error, notification }

**Deployment:**
- Built SPA served from static hosting (S3 + CloudFront, Netlify, or Vercel)
- Or served from backend static file handler
- Vite build output: `dist/` folder with HTML, CSS, JS

---

### Backend Layer (Node.js + Express)

**Purpose:** REST API, business logic, data validation, multi-tenant enforcement

**Architecture Pattern:** Clean architecture with separation of concerns
- Routes → Controllers → Services → Repositories → Database

**Key Modules:**

1. **Authentication Module:**
   - User registration (email validation, password hashing)
   - User login (credential validation, JWT issuance)
   - Email verification (OTP generation, storage, validation)
   - Token refresh (extend expiry, future enhancement)
   - User logout (stateless, no server-side session)

2. **Business Module:**
   - Create business profile (validate KRA PIN format, store)
   - Get business profile (by business_id)
   - Update business profile (phone, email, address only)
   - List businesses for user (if user has access to multiple, future)

3. **Invoice Module:**
   - Create invoice (validate customer, calculate totals, auto-generate number)
   - Update invoice (draft only, recalculate totals)
   - Send invoice (change status, record sent_at timestamp)
   - Mark as paid (record payment_date, change status)
   - Delete invoice (draft only)
   - Get invoice (by invoice_id, with tenant_id check)
   - List invoices (with filtering, pagination, tenant_id check)
   - Generate PDF (server-side, using PDFKit or similar)

4. **Expense Module:**
   - Create expense (validate date, category, amount, VAT)
   - Update expense (all fields editable)
   - Delete expense (remove record and receipt file)
   - Get expense (by expense_id, with tenant_id check)
   - List expenses (with filtering, pagination, tenant_id check)
   - Handle receipt upload (validate file type/size, store)
   - Bulk CSV import (validate rows, insert batch)

5. **Report Module:**
   - Calculate P&L (revenue from invoices, expenses, net profit)
   - Calculate balance sheet (assets, liabilities, equity)
   - Calculate tax summary (output VAT, input VAT, net)
   - Generate PDF (server-side, format for printing)
   - Generate CSV (standard format, Excel-compatible)

6. **VAT Compliance Module:**
   - Calculate VAT per item/expense (16% Kenyan standard rate)
   - Track output VAT (from invoices)
   - Track input VAT (from recoverable expenses)
   - Generate VAT summary (monthly, with warnings)
   - Generate iTax export (CSV format, KRA-compliant columns)
   - Validate VAT compliance (check for discrepancies, outstanding invoices)

7. **Customer Module:**
   - Create customer (name, email required; phone, address optional)
   - Update customer (all fields editable)
   - Delete customer (with referential integrity check)
   - Get customer (by customer_id, with tenant_id check)
   - List customers (for business, with search/filter)

8. **Middleware Stack:**
   - **CORS Middleware:** Allow frontend domain only
   - **JWT Authentication Middleware:** Extract token, verify signature, decode claims
   - **Tenant Isolation Middleware:** Inject business_id from token, enforce on all queries
   - **Error Handling Middleware:** Catch exceptions, return user-friendly error responses
   - **Request Logging Middleware:** Log method, path, status, response time
   - **Input Validation Middleware:** Sanitize inputs, prevent XSS/SQL injection

9. **Utility Services:**
   - **Email Service:** Send OTP, notifications (deferred)
   - **PDF Service:** Generate invoices and reports
   - **CSV Service:** Export expenses and iTax format
   - **Encryption Service:** Hash passwords, generate tokens
   - **Validation Service:** Business logic validation (invoice amount > 0, etc.)

**Technology Stack:**
- Node.js 18+ (LTS)
- Express.js (lightweight, no over-engineering for MVP)
- PostgreSQL driver: pg or sequelize/typeorm (for MVP, simple query builder sufficient)
- JWT: jsonwebtoken library
- Password hashing: bcryptjs library
- PDF generation: PDFKit or jsPDF
- CSV parsing/generation: csv-parser, json2csv
- Email (deferred): nodemailer or AWS SES
- Validation: joi or express-validator
- Logging: winston or pino (deferred, console.log sufficient for MVP)
- Environment variables: dotenv

**API Endpoints (Summary):**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, receive JWT |
| POST | /auth/verify-email | No | Verify OTP |
| GET | /auth/me | Yes | Get current user info |
| GET | /business/:id | Yes | Get business profile |
| PUT | /business/:id | Yes (Owner) | Update business profile |
| POST | /invoices | Yes | Create invoice |
| GET | /invoices | Yes | List invoices (filtered) |
| GET | /invoices/:id | Yes | Get invoice detail |
| PUT | /invoices/:id | Yes | Edit draft invoice |
| PATCH | /invoices/:id/send | Yes | Mark invoice as sent |
| PATCH | /invoices/:id/paid | Yes | Mark invoice as paid |
| DELETE | /invoices/:id | Yes | Delete draft invoice |
| GET | /invoices/:id/pdf | Yes | Download invoice PDF |
| POST | /expenses | Yes | Create expense |
| GET | /expenses | Yes | List expenses (filtered) |
| GET | /expenses/:id | Yes | Get expense detail |
| PUT | /expenses/:id | Yes | Edit expense |
| DELETE | /expenses/:id | Yes | Delete expense |
| POST | /expenses/import | Yes | Bulk CSV import |
| GET | /reports/profit-loss | Yes | Get P&L report |
| GET | /reports/balance-sheet | Yes | Get balance sheet |
| GET | /reports/tax-summary | Yes | Get tax summary |
| GET | /reports/:type/pdf | Yes | Download report PDF |
| GET | /reports/:type/csv | Yes | Download report CSV |
| GET | /vat/summary | Yes | Get VAT summary (monthly) |
| GET | /vat/export-itax | Yes | Download iTax CSV |
| POST | /customers | Yes | Create customer |
| GET | /customers | Yes | List customers |
| GET | /customers/:id | Yes | Get customer detail |
| PUT | /customers/:id | Yes | Edit customer |
| DELETE | /customers/:id | Yes | Delete customer |
| POST | /team/invite | Yes (Owner) | Invite team member |
| GET | /team/members | Yes | List team members |
| DELETE | /team/members/:id | Yes (Owner) | Remove team member |

**Deployment:**
- Node.js process (or multiple instances for scaling)
- Process manager: PM2 or systemd (for production)
- Environment variables configured at deployment time
- Horizontal scaling: Stateless design allows multiple instances behind load balancer

---

### Database Layer (PostgreSQL)

**Purpose:** Persistent storage, multi-tenant data isolation, ACID compliance

**Database Name:** `sme_accounts_db`

**Schema Design:**
- All tables include `business_id` (tenant identifier)
- All queries filter by `business_id` at application level
- Foreign keys enforce referential integrity
- Indexes on frequently filtered columns

**Key Tables:**

1. **users** – User accounts
   - id (PK)
   - email (unique)
   - password_hash (bcrypt)
   - created_at, updated_at
   - verified_at (email verification timestamp)

2. **businesses** – Tenant records
   - id (PK)
   - owner_id (FK → users.id)
   - name
   - kra_pin (unique)
   - vat_number (nullable, unique)
   - industry
   - phone, email, address
   - created_at, updated_at
   - (Fields immutable after creation except phone, email, address)

3. **business_members** – User access to business
   - id (PK)
   - business_id (FK → businesses.id)
   - user_id (FK → users.id)
   - role (Owner / Accountant / Viewer)
   - invited_at, accepted_at
   - created_at

4. **customers** – Customer directory
   - id (PK)
   - business_id (FK → businesses.id)
   - name
   - email
   - phone (nullable)
   - address (nullable)
   - created_at, updated_at

5. **invoices** – Invoice headers
   - id (PK)
   - business_id (FK → businesses.id)
   - invoice_number (unique per business)
   - customer_id (FK → customers.id)
   - invoice_date
   - due_date
   - status (Draft / Sent / Paid)
   - subtotal, vat_total, grand_total
   - notes
   - created_at, updated_at
   - sent_at (nullable)
   - paid_at (nullable)
   - payment_date (nullable)

6. **invoice_items** – Line items on invoices
   - id (PK)
   - invoice_id (FK → invoices.id)
   - description
   - quantity
   - unit_price
   - vat_percent
   - line_subtotal, line_vat, line_total
   - created_at

7. **expenses** – Expense records
   - id (PK)
   - business_id (FK → businesses.id)
   - date (not future)
   - category (Utilities / Supplies / Travel / Meals / Professional Fees / Other)
   - description (nullable)
   - amount
   - vat_percent
   - vat_amount
   - total_amount
   - vat_recoverable (boolean, input VAT tracking)
   - created_at, updated_at

8. **expense_receipts** – Attached receipt files
   - id (PK)
   - expense_id (FK → expenses.id)
   - file_path (or S3 URL)
   - file_type (PDF / JPG / PNG)
   - file_size
   - uploaded_at

9. **audit_logs** – Basic audit trail (deferred, optional for MVP)
   - id (PK)
   - business_id (FK → businesses.id)
   - user_id (FK → users.id)
   - action (create / update / delete / export)
   - table_name (invoices / expenses / etc.)
   - record_id
   - timestamp

**Indexes:**
- (business_id) – Tenant isolation, primary filter
- (user_id) – User authentication
- (business_id, status) – Invoice filtering
- (business_id, date) – Date range filtering
- (business_id, category) – Expense category filtering
- (invoice_number, business_id) – Invoice number uniqueness
- (email) – User email lookup
- (created_at, updated_at) – Sorting, audit

**Constraints:**
- Foreign keys: Prevent orphaned records
- Unique: email (global), invoice_number (per business), kra_pin (global)
- Check: amount > 0, vat_percent >= 0 and <= 100, date <= today
- Not null: business_id (all tables), user_id (users), invoice_number, status

**Migrations:**
- Version control: Each schema change is a timestamped migration file
- Reproducibility: Run migrations in order to rebuild schema
- Rollback: Each migration includes up/down scripts
- Tracked in: `/database/migrations/` directory

---

## 3. REQUEST/RESPONSE FLOW

### Example: Create Invoice

**User Flow:**
1. User fills invoice form (customer, dates, line items)
2. User clicks "Save as Draft"
3. Frontend validates form (client-side)
4. Frontend sends POST /invoices request with JWT token

**HTTP Request:**
```
POST /invoices
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "customer_id": 123,
  "invoice_date": "2026-01-20",
  "due_date": "2026-02-20",
  "items": [
    { "description": "Service A", "quantity": 1, "unit_price": 50000, "vat_percent": 16 },
    { "description": "Service B", "quantity": 2, "unit_price": 25000, "vat_percent": 16 }
  ],
  "notes": "Payment due within 30 days"
}
```

**Backend Processing:**
1. JWT middleware extracts token, validates signature, decodes claims
2. Extracts user_id and business_id from token
3. Controller receives request, passes to InvoiceService
4. InvoiceService validates:
   - Customer exists and belongs to business_id
   - Invoice date <= today, due_date >= invoice_date
   - Items are non-empty, amounts > 0
5. InvoiceService calculates:
   - Line totals: (quantity × unit_price) + (quantity × unit_price × vat_percent/100)
   - Invoice subtotal: sum of (quantity × unit_price) for all items
   - Invoice VAT: sum of (quantity × unit_price × vat_percent/100) for all items
   - Invoice grand total: subtotal + VAT
6. InvoiceService generates invoice number: `INV-BIZ001-202601001`
7. InvoiceRepository inserts invoice header and line items (atomic transaction)
8. Controller returns success response with invoice_id

**HTTP Response:**
```
HTTP 201 Created
Content-Type: application/json

{
  "id": 456,
  "business_id": 1,
  "invoice_number": "INV-BIZ001-202601001",
  "customer_id": 123,
  "status": "Draft",
  "subtotal": 100000,
  "vat_total": 16000,
  "grand_total": 116000,
  "created_at": "2026-01-20T10:30:00Z",
  "items": [
    { "id": 1, "description": "Service A", "quantity": 1, "unit_price": 50000, "vat_percent": 16, "line_total": 58000 },
    { "id": 2, "description": "Service B", "quantity": 2, "unit_price": 25000, "vat_percent": 16, "line_total": 58000 }
  ]
}
```

**Frontend Handling:**
1. Response status 201 indicates success
2. Frontend stores invoice data in state
3. Frontend redirects to invoice detail page
4. User sees success message: "Invoice created successfully"

---

### Example: List Invoices with Filters

**User Flow:**
1. User accesses Invoices page
2. User selects filters: status=Sent, date_from=2026-01-01, date_to=2026-01-31
3. Frontend sends GET request with query parameters

**HTTP Request:**
```
GET /invoices?status=Sent&date_from=2026-01-01&date_to=2026-01-31&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

**Backend Processing:**
1. JWT middleware validates token, extracts user_id, business_id
2. Controller receives request with query parameters
3. InvoiceRepository builds query:
   - WHERE business_id = {business_id}
   - AND status = 'Sent'
   - AND invoice_date >= '2026-01-01' AND invoice_date <= '2026-01-31'
   - ORDER BY invoice_date DESC
   - LIMIT 20 OFFSET 0
4. Repository executes query, returns invoice list with count
5. Controller returns paginated response

**HTTP Response:**
```
HTTP 200 OK
Content-Type: application/json

{
  "invoices": [
    { "id": 456, "invoice_number": "INV-BIZ001-202601001", "customer_name": "Client A", "amount": 116000, "status": "Sent", "date": "2026-01-20" },
    { "id": 457, "invoice_number": "INV-BIZ001-202601002", "customer_name": "Client B", "amount": 232000, "status": "Sent", "date": "2026-01-21" }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

**Frontend Handling:**
1. Frontend receives response, stores invoice list in state
2. Frontend renders invoice table with data
3. Frontend displays pagination controls (if total > limit)
4. Filters remain visible for refinement

---

## 4. AUTHENTICATION FLOW

### Registration & Email Verification Flow

```
User                          Frontend                    Backend                  Database
  │                             │                           │                        │
  ├─ 1. Fill registration form  │                           │                        │
  │                             │                           │                        │
  ├─ 2. Submit (email, pwd)────▶│                           │                        │
  │                             │ 3. Validate client-side   │                        │
  │                             │ (pwd requirements)        │                        │
  │                             │                           │                        │
  │                             │ 4. POST /auth/register   │                        │
  │                             ├──────────────────────────▶│                        │
  │                             │                           │ 5. Validate email    │
  │                             │                           │ 6. Hash password     │
  │                             │                           │ 7. Generate OTP      │
  │                             │                           │                        │
  │                             │                           │ 8. INSERT user      │
  │                             │                           ├──────────────────────▶│
  │                             │                           │                        │
  │                             │                           │◀──────────────────────┤
  │                             │                           │ user_id = 999        │
  │                             │                           │                        │
  │                             │ 9. Return user_id, status │                        │
  │                             │◀──────────────────────────┤                        │
  │                             │                           │                        │
  │◀──── 10. Show "Check email" │                           │                        │
  │                             │ 11. Email OTP to user     │                        │
  │                             │ (async, deferred)         │                        │
  │                             │                           │                        │
  ├─ 12. User checks email      │                           │                        │
  ├─ 13. Copy OTP code          │                           │                        │
  ├─ 14. Paste OTP in form      │                           │                        │
  ├─ 15. Submit                 │                           │                        │
  │                             │ 16. POST /auth/verify     │                        │
  │                             ├──────────────────────────▶│                        │
  │                             │                           │ 17. Validate OTP     │
  │                             │                           │ (correct, not expired)
  │                             │                           │                        │
  │                             │                           │ 18. UPDATE verified_at
  │                             │                           ├──────────────────────▶│
  │                             │                           │                        │
  │                             │                           │◀──────────────────────┤
  │                             │ 19. Return success        │                        │
  │                             │◀──────────────────────────┤                        │
  │                             │                           │                        │
  │◀──── 20. Redirect to login  │                           │                        │
  │                             │                           │                        │
```

### Login & JWT Token Issuance Flow

```
User                          Frontend                    Backend                  Database
  │                             │                           │                        │
  ├─ 1. Fill login form          │                           │                        │
  │ (email, password)           │                           │                        │
  │                             │                           │                        │
  ├─ 2. Submit                  │                           │                        │
  │                             │ 3. POST /auth/login       │                        │
  │                             ├──────────────────────────▶│                        │
  │                             │                           │ 4. SELECT user       │
  │                             │                           │ WHERE email = ...     │
  │                             │                           ├──────────────────────▶│
  │                             │                           │                        │
  │                             │                           │◀──────────────────────┤
  │                             │                           │ user_id, password_hash
  │                             │                           │                        │
  │                             │                           │ 5. Compare passwords │
  │                             │                           │ (bcrypt.compare)      │
  │                             │                           │                        │
  │                             │                           │ 6. If match:         │
  │                             │                           │    - Get business_id  │
  │                             │                           │    - Generate JWT     │
  │                             │                           │    (sign with secret) │
  │                             │                           │    - Payload: {       │
  │                             │                           │      user_id,         │
  │                             │                           │      business_id,     │
  │                             │                           │      email,           │
  │                             │                           │      iat,             │
  │                             │                           │      exp (7 days)     │
  │                             │                           │    }                  │
  │                             │                           │                        │
  │                             │ 7. Return JWT + user info │                        │
  │                             │◀──────────────────────────┤                        │
  │                             │                           │                        │
  │◀──── 8. Store JWT in        │                           │                        │
  │ localStorage                │                           │                        │
  │                             │                           │                        │
  │◀──── 9. Redirect to         │                           │                        │
  │ dashboard                   │                           │                        │
  │                             │                           │                        │
```

### Protected Endpoint Request Flow

```
User                          Frontend                    Backend               Database
  │                             │                           │                    │
  ├─ 1. Click action (e.g.,     │                           │                    │
  │ "View invoices")            │                           │                    │
  │                             │                           │                    │
  │                             │ 2. HTTP client reads JWT  │                    │
  │                             │ from localStorage         │                    │
  │                             │                           │                    │
  │                             │ 3. GET /invoices          │                    │
  │                             │ Header: Authorization:    │                    │
  │                             │ Bearer <JWT_TOKEN>        │                    │
  │                             ├─────────────────────────▶│                    │
  │                             │                           │ 4. JWT middleware   │
  │                             │                           │ - Extract JWT       │
  │                             │                           │ - Verify signature  │
  │                             │                           │ - Decode payload    │
  │                             │                           │ - Check expiry      │
  │                             │                           │ - Inject user_id,   │
  │                             │                           │   business_id       │
  │                             │                           │ - Attach to req     │
  │                             │                           │                    │
  │                             │                           │ 5. If valid:       │
  │                             │                           │ Execute controller  │
  │                             │                           │                    │
  │                             │                           │ 6. Controller calls │
  │                             │                           │ InvoiceService      │
  │                             │                           │ InvoiceRepository   │
  │                             │                           │ with req.business_id
  │                             │                           │                    │
  │                             │                           │ 7. Query:          │
  │                             │                           │ SELECT * FROM       │
  │                             │                           │ invoices            │
  │                             │                           │ WHERE business_id = │
  │                             │                           │ req.business_id     │
  │                             │                           ├──────────────────▶│
  │                             │                           │                    │
  │                             │                           │◀──────────────────┤
  │                             │                           │ invoices list      │
  │                             │                           │                    │
  │                             │ 8. Return invoices list   │                    │
  │                             │◀─────────────────────────┤                    │
  │                             │                           │                    │
  │◀──── 9. Display invoices    │                           │                    │
  │                             │                           │                    │
  │ (If JWT missing/invalid:    │ JWT middleware returns   │                    │
  │  401 Unauthorized)          │ 401 error                │                    │
```

---

## 5. MULTI-TENANCY STRATEGY

### Tenant Isolation Architecture

**Definition:** Tenant = Business entity. Each business has complete data isolation.

**Isolation Level: Database-level + Application-level**

### Database-Level Isolation

1. **Tenant Column on All Tables:**
   - Every data table includes `business_id` column (foreign key to businesses table)
   - Example: invoices.business_id, expenses.business_id

2. **Constraints:**
   - Foreign key: `invoices.business_id → businesses.id`
   - All queries include WHERE clause: `business_id = $1`
   - No query can retrieve cross-tenant data (enforced by code)

3. **Row-Level Security (RLS) – Optional (Future):**
   - PostgreSQL RLS policies can enforce tenant isolation at database level
   - For MVP: application-level enforcement sufficient

### Application-Level Isolation

1. **JWT Token Contains Tenant ID:**
   - Token payload includes: `{ user_id, business_id, email, iat, exp }`
   - Extracted and injected into every request

2. **Tenant Middleware:**
   - Middleware extracts business_id from JWT
   - Attaches to request object: `req.business_id = <extracted_id>`
   - Passed to all service/repository calls

3. **Explicit Tenant Check on Every Query:**
   - Repository methods always include: `WHERE business_id = req.business_id`
   - Example: `SELECT * FROM invoices WHERE business_id = ? AND invoice_id = ?`
   - Never: `SELECT * FROM invoices WHERE invoice_id = ?` (vulnerable to cross-tenant access)

4. **Authorization Checks:**
   - Before returning data, verify user_id is in business_members for that business_id
   - Before allowing action, verify role has permission (Owner > Accountant > Viewer)

### Multi-User Per Business (Future Enhancement)

**Current MVP:** One owner per business (user who created it can add team members)

**Planned:** Multiple team members sharing one business
- Table: business_members (business_id, user_id, role)
- User logs in, selects business if they have access to multiple
- All requests filtered by selected business_id

### Data Isolation Verification

**Testing Strategy:**
1. Create two businesses (Biz A, Biz B)
2. Create test invoice in Biz A
3. Login as Biz B user
4. Attempt to GET invoice from Biz A
5. Expected: 403 Forbidden (no access)
6. No cross-tenant data leakage

---

## 6. DEPLOYMENT ARCHITECTURE

### Docker-Based Deployment (MVP-Ready)

```
Developer Machine (Local)
    ├─ Dockerfile (backend)
    ├─ docker-compose.yml (backend + postgres)
    ├─ Frontend (yarn dev)
    └─ postgres (local instance)

Production Environment (Cloud)
    ├─ Frontend (React SPA)
    │  └─ Static hosting (S3 + CloudFront, Netlify, Vercel)
    │
    ├─ API Gateway (NGINX reverse proxy)
    │  └─ SSL/TLS termination
    │  └─ Route to backend instances
    │
    ├─ Backend (Node.js)
    │  ├─ Container image (Docker)
    │  ├─ Multiple instances (horizontal scaling)
    │  ├─ Load balanced
    │  └─ Environment variables (production values)
    │
    ├─ Database (PostgreSQL)
    │  ├─ Managed service (AWS RDS, Heroku Postgres, DigitalOcean)
    │  ├─ Daily backups
    │  └─ Point-in-time recovery
    │
    └─ Storage (File uploads)
       └─ S3 or blob storage (future, for MVP: local filesystem)
```

### Docker Setup

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
```

**docker-compose.yml (Local Dev):**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:password@db:5432/sme_accounts_db
      JWT_SECRET: dev_secret_key
      NODE_ENV: development
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: sme_user
      POSTGRES_PASSWORD: sme_password
      POSTGRES_DB: sme_accounts_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Configuration

**Environment Variables (Required):**
- `NODE_ENV` – "development" or "production"
- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – Secret key for signing JWT tokens
- `FRONTEND_URL` – Frontend domain (for CORS)
- `API_PORT` – Port backend listens on (default 3000)
- `EMAIL_SERVICE` – (future) SMTP or AWS SES config

**.env.example (Committed to repo):**
```
NODE_ENV=development
DATABASE_URL=postgres://user:password@localhost:5432/sme_accounts_db
JWT_SECRET=your_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:5173
API_PORT=3000
```

### Database Migrations

**Directory:** `/backend/database/migrations/`

**File naming:** `{timestamp}_{description}.sql`
- Example: `20260120_001_create_users_table.sql`

**Migration Runner:** Simple Node.js script that:
1. Reads migration files in order
2. Checks migration history table
3. Executes pending migrations
4. Records completion timestamp

**Deployed as part of:** Docker container startup or pre-deployment script

### Health Check & Monitoring

**Health Endpoint:**
```
GET /health
Response: { status: "ok", timestamp: "2026-01-20T10:30:00Z" }
```

**Monitoring (Future):**
- Uptime monitoring (Datadog, Sentry)
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, Datadog)
- Logs aggregation (CloudWatch, Datadog)

**For MVP:** Basic logging to stdout, captured by Docker logs

### Scaling Strategy

**Horizontal Scaling (Post-MVP):**
1. Stateless backend (no in-memory sessions)
2. Multiple backend instances behind load balancer
3. Shared database (PostgreSQL managed service)
4. Shared file storage (S3 or blob storage)

**Database Scaling (Post-MVP):**
1. Read replicas for reporting queries
2. Connection pooling (PgBouncer)
3. Partitioning large tables (future, if needed)

---

## 7. SECURITY CONSIDERATIONS

### Authentication & Authorization
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- All protected endpoints require valid JWT in Authorization header
- Role-based access control enforced at API level

### Data Protection
- HTTPS enforced in production (SSL/TLS certificates)
- Multi-tenant isolation enforced at all layers
- Database credentials stored in environment variables (not in code)
- Secrets never logged or exposed in error messages

### Input Validation
- All string inputs sanitized (prevent XSS, SQL injection)
- Numeric inputs validated (positive amounts, valid percentages)
- File uploads validated (type, size, malware scanning – future)

### API Security
- CORS configured for frontend domain only
- Rate limiting (future, basic structure ready)
- API keys for third-party integrations (future)

---

## 8. ERROR HANDLING & LOGGING

### Error Handling
- All exceptions caught and handled gracefully
- 4xx errors for user input errors (400, 401, 403, 404)
- 5xx errors only for unexpected server errors (and logged for debugging)
- Error responses include error code and user-friendly message
- No sensitive data in error messages (e.g., no database error details)

### Logging
- Structured logging (JSON format, future)
- Log levels: error, warn, info, debug
- Log what: request method/path, status, response time, user_id, business_id
- Log where: stdout (captured by Docker logs)
- Do NOT log: passwords, tokens, sensitive user data

---

## SIGN-OFF

**System Architecture Defined.** High-level design is complete and ready for detailed data schema design.

**Next Steps:**
1. Detailed database schema definition (complete table schemas with all columns)
2. API specification (detailed endpoints, request/response schemas)
3. PHASE 3 (Project Setup): Repository scaffolding and initial project structure

---

**Document prepared for:** Development team implementation  
**Ready for:** Database design phase
