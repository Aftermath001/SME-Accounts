import { createClient } from '@supabase/supabase-js';
import { appConfig } from './config';

if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey,
);
