# STEP 3 Quick Reference — Authentication & Tenancy

## Implementation at a Glance

### PART A: Auth Middleware
**File**: `src/middleware/auth.middleware.ts`

```typescript
// Usage:
app.get('/protected', authMiddleware, handler);

// Result: req.user = { userId, email }
```

**What it does:**
- Reads Authorization: Bearer <token> header
- Decodes JWT (no verification, Supabase handles that)
- Validates claims (sub, email)
- Attaches UserContext to request

### PART B: Tenant Service
**File**: `src/services/tenant.service.ts`

```typescript
// Usage:
const tenantService = new TenantService();
const business = await tenantService.getBusinessByUserId(userId);
```

**What it does:**
- Queries database for business where owner_id = userId
- Returns Business or null
- Converts Business to TenantContext

### PART C: Tenant Middleware
**File**: `src/middleware/tenant.middleware.ts`

```typescript
// Usage:
app.get('/invoices', authMiddleware, tenantMiddleware, handler);

// Result: req.tenant = { businessId, businessName, ownerId }
```

**What it does:**
- Requires req.user (must run after authMiddleware)
- Uses user ID to fetch business
- Attaches TenantContext to request
- Returns 401 if user has no business

### PART D: Auth Endpoints
**File**: `src/routes/auth.routes.ts`

```typescript
// Routes:
POST /auth/signup   // Create account + business
POST /auth/login    // Get session tokens
```

**Services**:
- `AuthService.signup(email, password, businessName)` → user + business + tokens
- `AuthService.login(email, password)` → user + tokens

## Middleware Stack

### For Public Routes
```typescript
// No middleware needed
app.get('/health', handler);
app.post('/auth/signup', handler);
app.post('/auth/login', handler);
```

### For User-Only Routes
```typescript
app.get('/me', authMiddleware, requireAuth, handler);
// handler: req.user exists, req.tenant undefined
```

### For Tenant-Scoped Routes (Most Common)
```typescript
app.get('/invoices', authMiddleware, tenantMiddleware, requireTenant, handler);
// handler: req.user AND req.tenant both exist
```

## Type System

### User is Extracted from JWT
```typescript
interface UserContext {
  userId: string;    // from token sub claim
  email: string;     // from token email claim
}
```

### Tenant is Fetched from Database
```typescript
interface TenantContext {
  businessId: string;    // from businesses.id
  businessName: string;  // from businesses.name
  ownerId: string;       // from businesses.owner_id
}
```

### Request Extension
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
      tenant?: TenantContext;
    }
  }
}
```

## Error Handling

### Authentication Errors
| Error | HTTP | Cause |
|-------|------|-------|
| Missing header | 401 | No Authorization header |
| Malformed token | 401 | Invalid JWT format |
| Invalid claims | 401 | Missing sub or email |
| No business | 401 | User has no business |

### Signup/Login Errors
| Error | HTTP | Cause |
|-------|------|-------|
| Missing email/password | 400 | Validation failed |
| Weak password | 400 | Password < 8 chars |
| Invalid email | 400 | Email format invalid |
| Email exists | 409 | User already registered |
| Invalid credentials | 401 | Email/password wrong |

## Security Checklist

✅ Passwords never touched by backend (Supabase Auth)
✅ JWT verified by Supabase, decoded locally
✅ Tenant resolved from database, not request input
✅ Tokens short-lived (1 hour access, refresh available)
✅ Sensitive data not logged

## Testing Signup

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123",
    "businessName": "Alice Accounts"
  }'
```

Returns:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "alice@example.com" },
    "business": { "id": "...", "name": "Alice Accounts", ... },
    "session": { "access_token": "jwt...", "refresh_token": "..." }
  }
}
```

## Testing Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

## Testing Protected Route (Future)

```bash
curl -X GET http://localhost:3000/invoices \
  -H "Authorization: Bearer <access_token>"
```

## Files Overview

| File | Lines | Purpose |
|------|-------|---------|
| `auth.middleware.ts` | 111 | JWT validation |
| `tenant.middleware.ts` | 91 | Tenant resolution |
| `auth.service.ts` | 187 | Signup/login logic |
| `tenant.service.ts` | 94 | Business queries |
| `auth.routes.ts` | 174 | Endpoints |

## Common Patterns

### Creating New Tenant-Scoped Endpoint

```typescript
import { authMiddleware, requireAuth } from '../middleware/auth.middleware';
import { tenantMiddleware, requireTenant } from '../middleware/tenant.middleware';

router.get(
  '/invoices',
  authMiddleware,
  tenantMiddleware,
  requireTenant,
  async (req: Request, res: Response) => {
    const { businessId } = req.tenant!; // Safe to use !
    
    // Fetch invoices for this tenant only
    const invoices = await invoiceService.getByBusiness(businessId);
    
    res.json(successResponse(invoices));
  }
);
```

### In Handler, Always Have Access To:
```typescript
req.user.userId        // Current user ID
req.user.email         // Current user email
req.tenant.businessId  // Current tenant (business)
req.tenant.businessName
req.tenant.ownerId
```

## Debugging

**User not authenticated?**
- Check Authorization header format: `Bearer <token>`
- Verify token is valid (not expired)
- Check token sub and email claims with `jwt.io`

**No business found?**
- User must create business via signup
- Check businesses table has row with owner_id = user.id

**Middleware order wrong?**
- authMiddleware must come before tenantMiddleware
- tenantMiddleware must come before requireTenant

## Next Steps (STEP 4)

1. Create database schema (9 tables)
2. Implement RLS policies
3. Create domain services (Business, Invoice, Expense, Customer)
4. Create endpoints for CRUD operations

---

**Ready to proceed**: Yes, tests show PART A-D complete ✓
