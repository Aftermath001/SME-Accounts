import supabaseAdmin, { SupabaseAdminClient } from '../config/supabase';
import { Logger } from '../utils/logger';

/**
 * Database Service Layer
 *
 * This is the abstraction layer for all database operations.
 * All business logic should use these methods, not call Supabase directly.
 *
 * Benefits:
 * - Centralized error handling
 * - Consistent logging
 * - Easy to mock for testing
 * - Prepares for future multi-tenancy RLS enforcement
 */

export class DatabaseService {
  protected supabase: SupabaseAdminClient;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Execute a SELECT query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async query<T>(
    table: string,
    query: (q: any) => any,
  ): Promise<T[]> {
    try {
      const { data, error } = await query(this.supabase.from(table).select('*'));

      if (error) {
        Logger.error(`Database query failed for table: ${table}`, (error as Error));
        throw new Error(`Failed to query ${table}: ${(error as any).message}`);
      }

      return (data as T[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Database query error for ${table}`, new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Insert a record
   */
  protected async insert<T>(
    table: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert([data])
        .select();

      if (error) {
        Logger.error(`Database insert failed for table: ${table}`, error);
        throw new Error(`Failed to insert into ${table}: ${error.message}`);
      }

      return (result?.[0] as T) || ({} as T);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Database insert error for ${table}`, new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update a record
   */
  protected async update<T>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (error) {
        Logger.error(`Database update failed for table: ${table}`, error);
        throw new Error(`Failed to update ${table}: ${error.message}`);
      }

      return (result?.[0] as T) || ({} as T);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Database update error for ${table}`, new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete a record
   */
  protected async delete(
    table: string,
    id: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        Logger.error(`Database delete failed for table: ${table}`, error);
        throw new Error(`Failed to delete from ${table}: ${error.message}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Database delete error for ${table}`, new Error(errorMessage));
      throw error;
    }
  }
}

export default DatabaseService;
