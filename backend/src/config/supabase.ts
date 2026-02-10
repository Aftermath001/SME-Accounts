import { createClient } from '@supabase/supabase-js';
import config from './index';
import { Logger } from '../utils/logger';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Supabase backend environment variables are missing');
}

export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

export type SupabaseAdminClient = typeof supabaseAdmin;

export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    Logger.info('Validating Supabase connection...');
    const { data, error } = await supabaseAdmin.from('_supabase_migrations').select('count', { count: 'exact' });

    if (error) {
      Logger.error('Validation failed', error);
      return false;
    }

    Logger.info('✓ Supabase connection validated', { hasData: !!data });
    return true;
  } catch (err) {
    Logger.error('Supabase error', err as Error);
    return false;
  }
}

export default supabaseAdmin;
