# STEP 2 Quick Reference — Supabase Integration

## Files Overview

### `src/config/supabase.ts`
- **Purpose**: Initialize and manage Supabase client
- **Exports**: `supabaseAdmin`, `validateSupabaseConnection`, `SupabaseAdminClient` type
- **Key Function**: `validateSupabaseConnection()` — Tests database connectivity
- **Validation**: Checks for required env vars on module load

### `src/services/database.service.ts`
- **Purpose**: Base class for all database operations
- **Extends**: All domain services (Business, Invoice, etc.) will extend this
- **Methods**:
  - `protected query<T>(table, query)` — SELECT operations
  - `protected insert<T>(table, data)` — INSERT operations
  - `protected update<T>(table, id, data)` — UPDATE operations
  - `protected delete(table, id)` — DELETE operations
- **Error Handling**: All methods catch errors and log before throwing
- **Multi-tenancy Ready**: Methods can be overridden to enforce `business_id` in queries

### `src/server.ts` (Updated)
- **New Import**: `validateSupabaseConnection` from supabase config
- **New Startup Logic**: 
  ```typescript
  const isSupabaseReady = await validateSupabaseConnection();
  if (!isSupabaseReady) {
    Logger.error('Failed to connect to Supabase...');
    process.exit(1);
  }
  ```
- **Behavior**: Server won't start if Supabase is unreachable

## Environment Variables

**Required** (no defaults):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

**Optional** (have defaults):
```
SUPABASE_ANON_KEY=        (used by frontend auth, not backend)
JWT_SECRET=               (default: dev-secret-key)
SERVER_PORT=3000
SERVER_HOST=localhost
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

## Usage Pattern

### For Feature Services

Create a service that extends DatabaseService:

```typescript
// src/services/business.service.ts
import DatabaseService from './database.service';
import { Business } from '../types';

export class BusinessService extends DatabaseService {
  async getBusinessById(businessId: string): Promise<Business> {
    return this.query<Business>(
      'businesses',
      (q) => q.eq('id', businessId)
    );
  }

  async createBusiness(data: Omit<Business, 'id'>): Promise<Business> {
    return this.insert<Business>('businesses', data);
  }
}
```

### In Controllers

```typescript
// src/controllers/business.controller.ts
import { BusinessService } from '../services/business.service';

const businessService = new BusinessService();

export async function getBusinessHandler(req: Request, res: Response) {
  const { id } = req.params;
  const business = await businessService.getBusinessById(id);
  res.json(successResponse('Business retrieved', business));
}
```

## Validation Checklist

- ✅ `npm run type-check` passes
- ✅ `npm run build` creates `/dist` folder
- ✅ `npm run lint` shows only expected warnings
- ✅ Server imports Supabase config without errors
- ✅ Connection validation function exported and typed
- ✅ DatabaseService methods have error handling
- ✅ Environment variables documented

## Testing Connection (Manual)

```bash
# 1. Ensure Supabase project exists and you have credentials
# 2. Copy credentials to .env
# 3. Start server
npm run dev

# Should see in logs:
# [INFO] Validating Supabase connection...
# [INFO] ✓ Supabase connection validated successfully
```

## Important Security Notes

⚠️ **Service Role Key**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- This key has admin privileges
- Always verify this is the "service_role" key, not "anon" key

⚠️ **Anon Key**
- Used for frontend authentication (added in STEP 3)
- Stored in `SUPABASE_ANON_KEY` but not used yet

⚠️ **Error Messages**
- Never log full Supabase errors to client (might expose schema info)
- All errors caught in DatabaseService and logged securely

## Debugging

**Connection fails?**
1. Check `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Verify values are copied exactly (no extra spaces)
3. Ensure Supabase project hasn't been deleted
4. Check credentials in Supabase dashboard (Settings > API)

**Type errors?**
- Run `npm run type-check` to see full TypeScript errors
- Ensure `tsconfig.json` has `strict: true`
- All functions in DatabaseService must have return types

**Lint warnings?**
- Current warnings are in existing code (request logging)
- New code (supabase.ts, database.service.ts) is clean except expected suppressions

## Next Phase (STEP 3)

Before STEP 3, ensure:
1. Supabase project created
2. `.env` file has real credentials
3. `npm run dev` shows successful connection validation
4. No database operations needed yet (will come in STEP 3)

---

**Ready for**: Database schema creation (STEP 3)
