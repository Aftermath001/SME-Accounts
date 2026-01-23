import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';
import { Logger } from '../utils/logger';
import { errorResponse } from '../utils/response';
import { UserContext } from '../types';

type Request = ExpressRequest;
type Response = ExpressResponse;

/**
 * PART A: JWT Validation Middleware
 *
 * Validates Supabase JWT token and extracts user information.
 * Does NOT handle tenant resolution (that comes in PART C).
 *
 * Expected header: Authorization: Bearer <token>
 * On success: Attaches req.user (UserContext)
 * On failure: Returns 401 Unauthorized
 */

export interface DecodedToken {
  sub: string;
  email: string;
  aud: string;
  [key: string]: unknown;
}

/**
 * Middleware: Validate JWT and extract user context
 *
 * Steps:
 * 1. Check for Authorization header
 * 2. Extract and decode JWT token
 * 3. Verify token structure
 * 4. Attach user to req.user
 * 5. Call next() or send 401
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;
    const response = res as any;
    
    // 1. Get Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      Logger.warn('Missing or malformed Authorization header', {
        path: (request as any).path || (request as any).url,
      });
      response.status(401).json(errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header'));
      return;
    }

    // 2. Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // 3. Decode JWT (does NOT verify signature on backend — Supabase handles that)
    let decoded: DecodedToken;
    try {
      decoded = jwtDecode<DecodedToken>(token);
    } catch (error) {
      Logger.warn('Failed to decode JWT', {
        error: error instanceof Error ? error.message : String(error),
      });
      response.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid token'));
      return;
    }

    // 3. Validate token structure
    if (!decoded.sub || !decoded.email) {
      Logger.warn('JWT missing required claims', {
        hasSub: !!decoded.sub,
        hasEmail: !!decoded.email,
      });
      response.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid token claims'));
      return;
    }

    // 5. Attach user to request
    const userContext: UserContext = {
      userId: decoded.sub,
      email: decoded.email,
    };

    request.user = userContext;

    Logger.debug('User authenticated', {
      userId: userContext.userId,
      email: userContext.email,
    });

    next();
  } catch (error) {
    Logger.error('Auth middleware error', error as Error);
    const response = res as any;
    response.status(500).json(errorResponse('INTERNAL_ERROR', 'Authentication error'));
  }
}

/**
 * Middleware: Require authentication
 *
 * Use this on protected routes to ensure req.user exists.
 * Should be placed AFTER authMiddleware.
 *
 * Example:
 *   app.get('/invoices', authMiddleware, requireAuth, handler);
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = req as any;
  const response = res as any;
  if (!request.user) {
    Logger.warn('Request reached requireAuth without user context');
    response.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));
    return;
  }

  next();
}

export default authMiddleware;
