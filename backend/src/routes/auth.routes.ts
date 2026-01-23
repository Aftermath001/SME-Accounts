import { Router, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import AuthService, { SignupInput, LoginInput } from '../services/auth.service';
import { Logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response';

type Request = ExpressRequest;
type Response = ExpressResponse;

/**
 * PART D: Auth Endpoints
 *
 * POST /auth/signup — Create user and business
 * POST /auth/login — Authenticate user
 *
 * Both endpoints return session tokens that client stores.
 * Client includes token in Authorization header for subsequent requests.
 */

const router = Router();
const authService = new AuthService();

/**
 * POST /auth/signup
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword",
 *   "businessName": "My Business"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "...", "email": "..." },
 *     "business": { "id": "...", "name": "..." },
 *     "session": { "access_token": "...", "refresh_token": "..." }
 *   }
 * }
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;
    const response = res as any;
    
    const { email, password, businessName } = request.body;

    // Basic validation
    if (!email || !password || !businessName) {
      response.status(400).json(
        errorResponse(
          'VALIDATION_ERROR',
          'Email, password, and business name are required',
        ),
      );
      return;
    }

    if (password.length < 8) {
      response
        .status(400)
        .json(
          errorResponse('VALIDATION_ERROR', 'Password must be at least 8 characters'),
        );
      return;
    }

    if (!email.includes('@')) {
      response
        .status(400)
        .json(errorResponse('VALIDATION_ERROR', 'Invalid email address'));
      return;
    }

    Logger.info('Signup request', { email, businessName });

    // Sign up
    const result = await authService.signup({
      email,
      password,
      businessName,
    } as SignupInput);

    Logger.info('Signup successful', {
      userId: result.user.id,
      email: result.user.email,
      businessId: result.business.id,
    });

    response.status(201).json(
      successResponse('Signup successful', {
        user: result.user,
        business: result.business,
        session: result.session,
      }),
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = res as any;
    Logger.error('Signup endpoint error', new Error(errorMessage));

    if (errorMessage.includes('already registered')) {
      response
        .status(409)
        .json(
          errorResponse('USER_EXISTS', 'Email already registered. Please log in instead.'),
        );
    } else if (errorMessage.includes('Invalid email')) {
      response.status(400).json(errorResponse('VALIDATION_ERROR', 'Invalid email address'));
    } else {
      response
        .status(500)
        .json(
          errorResponse('SIGNUP_FAILED', 'Failed to create account. Please try again.'),
        );
    }
  }
});

/**
 * POST /auth/login
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "...", "email": "..." },
 *     "session": { "access_token": "...", "refresh_token": "..." }
 *   }
 * }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;
    const response = res as any;
    
    const { email, password } = request.body;

    // Basic validation
    if (!email || !password) {
      response
        .status(400)
        .json(errorResponse('VALIDATION_ERROR', 'Email and password are required'));
      return;
    }

    Logger.info('Login request', { email });

    // Log in
    const result = await authService.login({
      email,
      password,
    } as LoginInput);

    Logger.info('Login successful', {
      userId: result.user.id,
      email: result.user.email,
    });

    response.status(200).json(
      successResponse('Login successful', {
        user: result.user,
        session: result.session,
      }),
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = res as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = req as any;
    Logger.warn('Login failed', { email: request.body.email, error: errorMessage });

    if (
      errorMessage.includes('Invalid login') ||
      errorMessage.includes('Invalid credentials')
    ) {
      response
        .status(401)
        .json(errorResponse('INVALID_CREDENTIALS', 'Invalid email or password'));
    } else {
      response
        .status(500)
        .json(
          errorResponse('LOGIN_FAILED', 'Failed to log in. Please try again.'),
        );
    }
  }
});

export default router;
