import DatabaseService from './database.service';
import { Business, TenantContext } from '../types';
import { Logger } from '../utils/logger';

/**
 * PART B: Tenant Service
 *
 * Handles user ↔ business association.
 * MVP constraint: One user = One business (owner).
 *
 * In future, we'll support:
 * - Multiple businesses per user (roles: owner, accountant, viewer)
 * - user_businesses junction table for role-based access
 *
 * For now: User is owner of their business.
 */

export class TenantService extends DatabaseService {
  /**
   * Get business (tenant) for authenticated user
   *
   * MVP: User creates a business on signup, they are the owner.
   * This fetches their business record.
   *
   * In production:
   * - Check user_businesses table for user's roles
   * - Support multiple businesses
   * - Default to first business or user-selected business
   */
  async getBusinessByUserId(userId: string): Promise<Business | null> {
    try {
      Logger.debug('Fetching business for user', { userId });

      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch business for user', error as Error);
        throw new Error(`Failed to fetch business: ${(error as any).message}`);
      }

      if (!data) {
        Logger.warn('No business found for user', { userId });
        return null;
      }

      Logger.debug('Business found for user', {
        userId,
        businessId: data.id,
        businessName: data.name,
      });

      return data as Business;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('TenantService.getBusinessByUserId error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get business by ID (for validation)
   *
   * Used to validate that a tenant exists and is accessible.
   */
  async getBusinessById(businessId: string): Promise<Business | null> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch business by ID', error as Error);
        throw new Error(`Failed to fetch business: ${(error as any).message}`);
      }

      return (data as Business) || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('TenantService.getBusinessById error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Convert Business to TenantContext
   *
   * Helper to transform database record into request context.
   */
  toTenantContext(business: Business): TenantContext {
    return {
      businessId: business.id,
      businessName: business.name,
      ownerId: business.owner_id,
    };
  }
}

export default TenantService;
