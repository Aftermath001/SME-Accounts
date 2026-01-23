/**
 * User Domain Type
 * Represents a user linked to Supabase Auth
 * Extended user metadata beyond Supabase
 */

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  user_id: string;
  business_id: string;
  first_name?: string;
  last_name?: string;
  role: 'owner' | 'accountant' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileInput {
  first_name?: string;
  last_name?: string;
  role?: 'accountant' | 'viewer';
}

export interface UpdateUserProfileInput {
  first_name?: string;
  last_name?: string;
  role?: 'accountant' | 'viewer';
  is_active?: boolean;
}
