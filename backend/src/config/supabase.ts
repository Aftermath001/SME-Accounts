import { createClient } from '@supabase/supabase-js';
import config from './index';
import { Logger } from '../utils/logger';

/**
 * Supabase client initialization
 *
 * Uses service role key for backend operations.
 * The service role key has elevated privileges and should NEVER be exposed to clients.
 *
 * This is the single source of truth for database access.
 * All database operations flow through this client.
 */

// Validate Supabase configuration
if (!config.supabase.url) {
  throw new Error('SUPABASE_URL environment variable is not set');
}

if (!config.supabase.serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
}

// Initialize Supabase client with service role key (backend only)
export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// Export type-safe database reference for type hints
export type SupabaseAdminClient = typeof supabaseAdmin;

/**
 * Validate Supabase connectivity
 * Performs a simple query to ensure the connection is working
 */
export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    Logger.info('Validating Supabase connection...');

    // Simple health check: get Supabase server version
    const { data, error } = await supabaseAdmin.from('_supabase_migrations').select('count', { count: 'exact' });

    if (error) {
      Logger.error('Supabase connection validation failed', error as Error);
      return false;
    }

    Logger.info('✓ Supabase connection validated successfully', {
      url: config.supabase.url,
      hasData: !!data,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('Supabase connection error', new Error(errorMessage));
    return false;
  }
}

export default supabaseAdmin;
