import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import TenantService from '../services/tenant.service';
import { Logger } from '../utils/logger';
import { errorResponse } from '../utils/response';

type Request = ExpressRequest;
type Response = ExpressResponse;

/**
 * PART C: Tenant Context Resolution Middleware
 *
 * Uses authenticated user to resolve business (tenant).
 * Ensures EVERY protected request has both req.user AND req.tenant.
 *
 * Flow:
 * 1. authMiddleware runs first (sets req.user)
 * 2. tenantMiddleware runs next (sets req.tenant)
 * 3. Route handler has both contexts
 *
 * SECURITY: Tenant is NEVER taken from request body or params.
 * It's ONLY resolved from the authenticated user's record.
 */

const tenantService = new TenantService();

/**
 * Middleware: Resolve tenant context from authenticated user
 *
 * Requirements:
 * - Must run AFTER authMiddleware
 * - Must run BEFORE any route handlers
 * - req.user must exist (will be null if not authenticated)
 *
 * On success: Attaches req.tenant (TenantContext)
 * On failure: Returns 401 if user has no business
 * On error: Returns 500
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Ensure user is authenticated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;
    const response = res as any;
    
    if (!request.user) {
      Logger.warn('tenantMiddleware called without user context');
      response.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));
      return;
    }

    const userId = request.user.userId;

    // 2. Fetch business for user
    let business;
    try {
      business = await tenantService.getBusinessByUserId(userId);
    } catch (error) {
      Logger.error('Failed to resolve tenant', error as Error);
      response
        .status(500)
        .json(errorResponse('INTERNAL_ERROR', 'Failed to resolve tenant context'));
      return;
    }

    // 3. Ensure business exists (user must have created one)
    if (!business) {
      Logger.warn('User has no business', { userId });
      response.status(401).json(
        errorResponse(
          'NO_BUSINESS',
          'User has no associated business. Please create one first.',
        ),
      );
      return;
    }

    // 4. Attach tenant context to request
    request.tenant = tenantService.toTenantContext(business);

    Logger.debug('Tenant context resolved', {
      userId,
      businessId: request.tenant.businessId,
      businessName: request.tenant.businessName,
    });

    next();
  } catch (error) {
    Logger.error('Tenant middleware error', error as Error);
    const response = res as any;
    response.status(500).json(errorResponse('INTERNAL_ERROR', 'Tenant resolution error'));
  }
}

/**
 * Middleware: Require tenant context
 *
 * Used on routes that MUST have a tenant.
 * Should be placed AFTER tenantMiddleware.
 *
 * Example:
 *   app.get('/invoices', authMiddleware, tenantMiddleware, requireTenant, handler);
 */
export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = req as any;
  const response = res as any;
  
  if (!request.tenant) {
    Logger.warn('Request reached requireTenant without tenant context');
    response
      .status(401)
      .json(errorResponse('UNAUTHORIZED', 'Tenant context required'));
    return;
  }

  next();
}

export default tenantMiddleware;
