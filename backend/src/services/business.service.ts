import DatabaseService from './database.service';
import { Business, CreateBusinessInput, UpdateBusinessInput } from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Business Service
 * Handles all business (tenant) data access operations
 * All queries are business-scoped
 */

export class BusinessService extends DatabaseService {
  /**
   * Get business by ID
   * Validates that business exists
   */
  async getById(businessId: string): Promise<Business | null> {
    try {
      Logger.debug('Fetching business by ID', { businessId });

      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch business', error as Error);
        throw new Error(`Failed to fetch business: ${(error as any).message}`);
      }

      return (data as Business) || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('BusinessService.getById error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Get all businesses (admin only, not used in MVP)
   */
  async getAll(): Promise<Business[]> {
    try {
      const { data, error } = await this.supabase.from('businesses').select('*');

      if (error) {
        Logger.error('Failed to fetch businesses', error as Error);
        throw new Error(`Failed to fetch businesses: ${(error as any).message}`);
      }

      return (data as Business[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('BusinessService.getAll error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Create a new business
   * Called during user signup
   */
  async create(userId: string, input: CreateBusinessInput): Promise<Business> {
    try {
      Logger.info('Creating business', { userId, businessName: input.name });

      const { data, error } = await this.supabase
        .from('businesses')
        .insert([
          {
            owner_id: userId,
            name: input.name,
            kra_pin: input.kra_pin || '',
            vat_number: input.vat_number || '',
            industry: input.industry || '',
            phone: input.phone || '',
            email: input.email || '',
            address: input.address || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error || !data?.[0]) {
        Logger.error('Business creation failed', error as Error);
        throw new Error(`Failed to create business: ${(error as any)?.message}`);
      }

      const business = data[0] as Business;
      Logger.info('Business created', { businessId: business.id, userId });

      return business;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('BusinessService.create error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update business details
   * Scoped to owner only
   */
  async updateBusiness(businessId: string, input: UpdateBusinessInput): Promise<Business> {
    try {
      Logger.debug('Updating business', { businessId });

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Only include provided fields
      if (input.name !== undefined) updateData.name = input.name;
      if (input.kra_pin !== undefined) updateData.kra_pin = input.kra_pin;
      if (input.vat_number !== undefined) updateData.vat_number = input.vat_number;
      if (input.industry !== undefined) updateData.industry = input.industry;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.address !== undefined) updateData.address = input.address;

      const { data, error } = await this.supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Business update failed', error as Error);
        throw new Error(`Failed to update business: ${(error as any)?.message}`);
      }

      return data[0] as Business;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('BusinessService.update error', new Error(errorMessage));
      throw error;
    }
  }
}

export default BusinessService;
