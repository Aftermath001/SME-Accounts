import { createClient } from '@supabase/supabase-js';
import config from '../config';
import { Logger } from '../utils/logger';
import DatabaseService from './database.service';
import { Business } from '../types';

/**
 * PART D: Auth Service
 *
 * Handles signup and login operations.
 * Delegates to Supabase Auth for user management.
 * Creates business record on signup.
 */

export interface SignupInput {
  email: string;
  password: string;
  businessName: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
  };
  business: Business;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Create Supabase client with anon key (for signup/login)
 * This client can access auth endpoints
 */
const supabaseAuth = createClient(config.supabase.url, config.supabase.anonKey);

export class AuthService extends DatabaseService {
  /**
   * Sign up new user and create business
   *
   * Flow:
   * 1. Create user in Supabase Auth
   * 2. Create business record with user as owner
   * 3. Return user, business, and session
   */
  async signup(input: SignupInput): Promise<SignupResponse> {
    try {
      const { email, password, businessName } = input;

      Logger.info('Signup attempt', { email, businessName });

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        Logger.error('Signup failed at auth step', authError as Error);
        throw new Error(`Signup failed: ${authError?.message || 'Unknown error'}`);
      }

      const userId = authData.user.id;

      Logger.info('User created in Supabase Auth', { userId, email });

      // 2. Create business record
      let businessRecord;
      try {
        const { data, error } = await this.supabase.from('businesses').insert([
          {
            owner_id: userId,
            name: businessName,
            kra_pin: '', // User will fill this in onboarding
            industry: '', // User will fill this in onboarding
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (error || !data) {
          Logger.error('Business creation failed', error as Error);
          // TODO: Rollback user creation in Supabase Auth
          throw new Error(`Business creation failed: ${(error as any)?.message || 'Unknown error'}`);
        }

        businessRecord = (data[0] || {}) as Business;

        Logger.info('Business created', { userId, businessId: businessRecord.id });
      } catch (error) {
        Logger.error('Business creation error', error as Error);
        throw error;
      }

      // 3. Return response with session
      const session = authData.session;

      if (!session) {
        throw new Error('No session returned from signup');
      }

      return {
        user: {
          id: userId,
          email,
        },
        business: businessRecord,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('AuthService.signup error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Login existing user
   *
   * Uses Supabase Auth to verify credentials.
   * Returns session tokens for subsequent requests.
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    try {
      const { email, password } = input;

      Logger.info('Login attempt', { email });

      // Sign in with Supabase Auth
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        Logger.warn('Login failed', {
          email,
          error: error?.message,
        });
        throw new Error(`Login failed: ${error?.message || 'Invalid credentials'}`);
      }

      Logger.info('User logged in', {
        userId: data.user.id,
        email,
      });

      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token || '',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('AuthService.login error', new Error(errorMessage));
      throw error;
    }
  }
}

export default AuthService;
