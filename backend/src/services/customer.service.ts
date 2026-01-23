import DatabaseService from './database.service';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types/domain';
import { Logger } from '../utils/logger';

/**
 * Customer Service
 * Handles all customer data access operations
 * All queries are scoped to the current business (tenant)
 */

export class CustomerService extends DatabaseService {
  /**
   * Get customer by ID (tenant-scoped)
   */
  async getById(businessId: string, customerId: string): Promise<Customer | null> {
    try {
      Logger.debug('Fetching customer', { customerId, businessId });

      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        Logger.error('Failed to fetch customer', error as Error);
        throw new Error(`Failed to fetch customer: ${(error as any).message}`);
      }

      return (data as Customer) || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('CustomerService.getById error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * List all customers for a business (tenant-scoped)
   */
  async listByBusiness(
    businessId: string,
    options?: { limit?: number; offset?: number; search?: string }
  ): Promise<Customer[]> {
    try {
      Logger.debug('Listing customers', { businessId, options });

      let query = this.supabase.from('customers').select('*').eq('business_id', businessId);

      // Apply search filter if provided
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      // Apply pagination
      if (options?.limit) {
        const offset = options?.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      // Sort by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        Logger.error('Failed to list customers', error as Error);
        throw new Error(`Failed to list customers: ${(error as any).message}`);
      }

      return (data as Customer[]) || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('CustomerService.listByBusiness error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Create a new customer (tenant-scoped)
   */
  async create(businessId: string, input: CreateCustomerInput): Promise<Customer> {
    try {
      Logger.info('Creating customer', { businessId, customerName: input.name });

      // Validate required fields
      if (!input.name || !input.email) {
        throw new Error('Customer name and email are required');
      }

      const { data, error } = await this.supabase
        .from('customers')
        .insert([
          {
            business_id: businessId,
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            address: input.address || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error || !data?.[0]) {
        Logger.error('Customer creation failed', error as Error);
        throw new Error(`Failed to create customer: ${(error as any)?.message}`);
      }

      const customer = data[0] as Customer;
      Logger.info('Customer created', { customerId: customer.id, businessId });

      return customer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('CustomerService.create error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Update customer details (tenant-scoped)
   */
  async updateCustomer(
    businessId: string,
    customerId: string,
    input: UpdateCustomerInput
  ): Promise<Customer> {
    try {
      Logger.debug('Updating customer', { customerId, businessId });

      // Verify customer belongs to business
      const existing = await this.getById(businessId, customerId);
      if (!existing) {
        throw new Error('Customer not found');
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Only include provided fields
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.address !== undefined) updateData.address = input.address;

      const { data, error } = await this.supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .eq('business_id', businessId)
        .select();

      if (error || !data?.[0]) {
        Logger.error('Customer update failed', error as Error);
        throw new Error(`Failed to update customer: ${(error as any)?.message}`);
      }

      return data[0] as Customer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('CustomerService.update error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * Delete a customer (tenant-scoped)
   * Soft delete could be implemented here
   */
  async delete(businessId: string, customerId: string): Promise<boolean> {
    try {
      Logger.info('Deleting customer', { customerId, businessId });

      // Verify customer belongs to business
      const existing = await this.getById(businessId, customerId);
      if (!existing) {
        throw new Error('Customer not found');
      }

      const { error } = await this.supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('business_id', businessId);

      if (error) {
        Logger.error('Customer deletion failed', error as Error);
        throw new Error(`Failed to delete customer: ${(error as any).message}`);
      }

      Logger.info('Customer deleted', { customerId, businessId });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('CustomerService.delete error', new Error(errorMessage));
      throw error;
    }
  }
}

export default CustomerService;
