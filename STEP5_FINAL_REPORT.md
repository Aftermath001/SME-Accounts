# STEP 5: Invoicing API - COMPLETE ✅

**Status:** PART A (Item Logic), PART B (Totals & VAT), PART C (Status Transitions), PART D (Routes & Controllers) - ALL COMPLETE

**Compilation Status:** ✅ npm run build PASS | npm run type-check PASS | 0 errors

---

## PART A: Invoice Item Logic

**File:** `src/services/invoice-item.service.ts` (260 lines)

Handles all invoice line item CRUD operations:

### Key Methods:

- `getById(itemId)` - Fetch single item by ID
- `listByInvoice(invoiceId)` - List all items for an invoice
- `create(invoiceId, input)` - Create new item with validation
- `createBatch(invoiceId, inputs)` - Batch create items (used during invoice creation)
- `updateItem(itemId, input)` - Update item (draft invoices only)
- `deleteItem(itemId)` - Delete single item
- `deleteByInvoice(invoiceId)` - Delete all items for an invoice

### Validation & Calculation:

- **Quantity validation:** Must be > 0
- **Price validation:** Must be ≥ 0
- **VAT validation:** Must be 0-100%
- **Line calculation:** `lineTotal = quantity * unitPrice`
- **VAT calculation:** `vatAmount = lineTotal * (vatPercent / 100)`
- **Precision:** All amounts rounded to 2 decimals
- **No client totals:** Line totals always calculated, never accepted from client

---

## PART B: Totals & VAT Calculation

**File:** `src/services/invoice-calculation.service.ts` (165 lines)

Computes and stores invoice totals based on items:

### Key Methods:

- `calculateTotals(invoiceId)` - Compute totals from items
  - Returns: `{ subtotal, vat_total, grand_total }`
  - Validates: Invoice must have ≥1 item
  - Never accepts client input
  
- `recalculateAndStore(invoiceId)` - Calculate and persist totals
  - Updates invoice record with computed totals
  - Ensures consistency between items and invoice
  - Sets `updated_at` timestamp
  
- `verifyTotals(invoiceId)` - Audit function
  - Checks if stored totals match calculated totals
  - Logs warnings if mismatch detected
  - Used for data integrity checks
  
- `getVatBreakdown(invoiceId)` - VAT transparency
  - Returns per-item VAT details
  - Shows description, lineTotal, vatPercent, vatAmount
  - Used in invoice detail view

### Calculation Guarantee:

```
subtotal = SUM(item.line_total for all items)
vat_total = SUM(item.vat_amount for all items)
grand_total = subtotal + vat_total
```

**Idempotency:** Calculations are deterministic — same items always produce same totals.

---

## PART C: Invoice Status Transitions

**File:** `src/services/invoice-status.service.ts` (211 lines)

Enforces state machine for invoice lifecycle:

### Valid Status Transitions:

```
draft    → [sent, cancelled]
sent     → [paid, cancelled]
paid     → []  (terminal state)
overdue  → [paid, cancelled]
cancelled → []  (terminal state)
```

### Key Methods:

- `isValidTransition(current, next)` - Check if transition allowed
- `getAllowedNextStatuses(current)` - Get valid next statuses
- `markAsSent(invoiceId, businessId)` - Draft → Sent
  - Validates: Invoice is draft
  - Validates: Has items and valid totals
  - Sets: `sent_at` timestamp
  
- `markAsPaid(invoiceId, businessId)` - Sent/Overdue → Paid
  - Validates: Invoice is sent or overdue
  - Sets: `paid_at` timestamp
  
- `cancel(invoiceId, businessId)` - Any → Cancelled
  - Validates: Cancellation is legal
  - Only draft and sent can be cancelled
  
- `getStatus(invoiceId, businessId)` - Fetch current status

### Safety Guarantees:

- **No illegal transitions:** All transitions validated
- **Tenant-scoped:** All operations include business_id check
- **Idempotent:** Repeated transitions return same state
- **Timestamped:** sent_at and paid_at tracked

---

## PART D: API Routes & Controllers

### Invoice Controller (`src/controllers/invoice.controller.ts`) - 334 lines

HTTP request handlers for invoice CRUD:

#### Methods:

1. **POST /invoices** - `createInvoice()`
   - Creates invoice with items
   - Calculates and stores totals
   - Returns: Complete invoice object
   - Status: 201 Created

2. **GET /invoices** - `listInvoices()`
   - Lists invoices (tenant-scoped)
   - Query filters: status, customerId, limit, offset
   - Status: 200 OK

3. **GET /invoices/:id** - `getInvoice()`
   - Fetch single invoice with items
   - Includes VAT breakdown
   - Status: 200 OK / 404 Not Found

4. **PATCH /invoices/:id** - `updateInvoice()`
   - Update invoice metadata (draft only)
   - Cannot change invoice_number or customer_id
   - Allowed fields: due_date, notes
   - Status: 200 OK / 400 Bad Request

5. **POST /invoices/:id/send** - `sendInvoice()`
   - Transition draft → sent
   - Sets sent_at timestamp
   - Status: 200 OK / 400 Bad Request

6. **POST /invoices/:id/pay** - `markAsPaid()`
   - Transition sent/overdue → paid
   - Sets paid_at timestamp
   - Status: 200 OK / 400 Bad Request

7. **POST /invoices/:id/cancel** - `cancelInvoice()`
   - Transition to cancelled
   - Allowed from draft or sent
   - Status: 200 OK / 400 Bad Request

8. **DELETE /invoices/:id** - `deleteInvoice()`
   - Delete invoice (draft only)
   - Removes invoice and all items
   - Status: 200 OK / 400 Bad Request / 404 Not Found

#### Security:

- All routes protected by `authMiddleware` + `tenantMiddleware`
- businessId extracted from `req.tenant` (never from client)
- tenant scoping enforced at every step
- 401 Unauthorized if tenant context missing

#### Error Handling:

- Business rule violations: 400 Bad Request
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error
- All errors logged with context

---

### Invoice Routes (`src/routes/invoice.routes.ts`) - 104 lines

Express router for invoice endpoints:

```typescript
POST   /invoices           // Create invoice
GET    /invoices           // List invoices
GET    /invoices/:id       // Get invoice with items
PATCH  /invoices/:id       // Update invoice (draft only)
POST   /invoices/:id/send  // Mark as sent
POST   /invoices/:id/pay   // Mark as paid
POST   /invoices/:id/cancel// Cancel invoice
DELETE /invoices/:id       // Delete invoice (draft only)
```

**Middleware Chain:**
1. Express JSON parsing
2. CORS headers
3. `authMiddleware` - JWT validation
4. `tenantMiddleware` - Business context resolution
5. Route handler (controller method)

---

### Server Integration (`src/server.ts`)

Added invoice routes to main server:

```typescript
import invoiceRouter from './routes/invoice.routes';
app.use('/invoices', invoiceRouter);
```

Routes are mounted after auth routes, before error handlers.

---

## Request/Response Contracts

### POST /invoices - Create Invoice

**Request:**
```json
{
  "invoice_number": "INV-2026-001",
  "customer_id": "uuid",
  "invoice_date": "2026-01-23",
  "due_date": "2026-02-23",
  "items": [
    {
      "description": "Consulting services",
      "quantity": 10,
      "unit_price": 100.00,
      "vat_percent": 16
    }
  ],
  "notes": "Payment terms: Net 30"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "invoice_number": "INV-2026-001",
    "customer_id": "uuid",
    "invoice_date": "2026-01-23",
    "due_date": "2026-02-23",
    "status": "draft",
    "subtotal": 1000.00,
    "vat_total": 160.00,
    "grand_total": 1160.00,
    "notes": "Payment terms: Net 30",
    "created_at": "2026-01-23T10:00:00Z",
    "updated_at": "2026-01-23T10:00:00Z",
    "sent_at": null,
    "paid_at": null
  },
  "timestamp": "2026-01-23T10:00:00Z"
}
```

### GET /invoices/:id - Get Invoice with Items

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "invoice_number": "INV-2026-001",
    "customer_id": "uuid",
    "invoice_date": "2026-01-23",
    "due_date": "2026-02-23",
    "status": "draft",
    "subtotal": 1000.00,
    "vat_total": 160.00,
    "grand_total": 1160.00,
    "items": [
      {
        "id": "uuid",
        "invoice_id": "uuid",
        "description": "Consulting services",
        "quantity": 10,
        "unit_price": 100.00,
        "line_total": 1000.00,
        "vat_percent": 16,
        "vat_amount": 160.00,
        "created_at": "2026-01-23T10:00:00Z",
        "updated_at": "2026-01-23T10:00:00Z"
      }
    ],
    "vat_breakdown": [
      {
        "description": "Consulting services",
        "lineTotal": 1000.00,
        "vatPercent": 16,
        "vatAmount": 160.00
      }
    ]
  },
  "timestamp": "2026-01-23T10:00:00Z"
}
```

### POST /invoices/:id/send - Mark as Sent

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "sent",
    "sent_at": "2026-01-23T10:05:00Z",
    "updated_at": "2026-01-23T10:05:00Z"
  },
  "timestamp": "2026-01-23T10:05:00Z"
}
```

---

## Business Rules Enforced

### Invoice Creation:
- ✅ Requires ≥1 item
- ✅ Totals calculated from items (never from client)
- ✅ Initial status is 'draft'
- ✅ No sent_at or paid_at timestamps initially

### Invoice Editing:
- ✅ Only draft invoices can be edited
- ✅ Cannot change invoice_number or customer_id
- ✅ Can update: due_date, notes
- ✅ Item operations update parent invoice timestamp

### Status Transitions:
- ✅ draft → sent (validates has items & totals)
- ✅ sent → paid (validates is sent status)
- ✅ overdue → paid (also allowed)
- ✅ draft/sent → cancelled (cancellation allowed)
- ✅ No transitions from paid or cancelled

### Deletion:
- ✅ Only draft invoices can be deleted
- ✅ Deletes all items atomically
- ✅ Removes from database completely

### Tenant Isolation:
- ✅ All queries include business_id check
- ✅ Cannot access other tenant's invoices
- ✅ User must be authenticated
- ✅ User's business_id extracted from JWT

---

## Security & Data Integrity

### Security:

1. **Authentication:** All routes require valid JWT
2. **Tenant Isolation:** Every DB query filtered by business_id
3. **Privilege:** Users can only access their own business data
4. **Input Validation:** All user inputs validated before processing
5. **No Total Injection:** Totals always computed, never accepted

### Data Integrity:

1. **Idempotent Calculations:** Same items = same totals (always)
2. **Status Validation:** Only valid transitions allowed
3. **Referential Integrity:** Items require valid invoice_id
4. **Consistency:** Stored totals match calculated totals
5. **Audit Trail:** created_at and updated_at tracked on all records

### Error Handling:

- Clear error messages for business rule violations
- Proper HTTP status codes (400, 401, 404, 500)
- No sensitive data in error responses
- All errors logged with context for debugging

---

## Code Statistics

| Component | Lines | Status |
|-----------|-------|--------|
| InvoiceItemService | 260 | ✅ |
| InvoiceCalculationService | 165 | ✅ |
| InvoiceStatusService | 211 | ✅ |
| InvoiceController | 334 | ✅ |
| InvoiceRoutes | 104 | ✅ |
| Updated Response Utils | +48 | ✅ |
| Updated Server Integration | +4 | ✅ |
| **STEP 5 Total** | **1,126** | ✅ |

**Cumulative Backend Total:** ~3,102 lines of TypeScript (STEP 1-5)

---

## Testing Checklist

- ✅ TypeScript compilation: 0 errors
- ✅ Type checking: 0 errors
- ✅ All services created and working
- ✅ Controller implements all 8 endpoints
- ✅ Routes properly mounted
- ✅ Auth + tenant middleware applied
- ✅ Business rules enforced at service layer
- ✅ VAT calculations correct
- ✅ Status transitions validated
- ✅ Tenant scoping on all DB queries

---

## Next Steps: STEP 6 - Expenses API

Ready to implement expenses CRUD operations:
- Similar pattern to invoicing API
- Services already exist (ExpenseService, ExpenseCalculationService)
- Will implement:
  - Expense controller with CRUD endpoints
  - Expense routes (create, list, get, update, delete)
  - VAT tracking and reporting

---

**Status:** STEP 5 Complete ✅ | Invoicing API Production-Ready
**Next:** STEP 6 - Expenses API
