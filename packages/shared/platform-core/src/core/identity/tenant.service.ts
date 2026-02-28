/**
 * Tenant Service
 * Handles multi-tenant management operations
 */

import { Prisma, Tenant, TenantUser } from '@prisma/client';
import { db } from '../../shared/database';
import { logger } from '../../shared/logger';

export interface CreateTenantInput {
  name: string;
  slug: string;
  subscriptionTier?: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantInput {
  name?: string;
  status?: string;
  subscriptionTier?: string;
  settings?: Record<string, any>;
}

export interface AddUserToTenantInput {
  tenantId: string;
  userId: string;
  roleId: string;
}

export class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    try {
      const tenant = await db.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          subscriptionTier: input.subscriptionTier || 'free',
          settings: input.settings || {},
        },
      });

      logger.info('Tenant created', { tenantId: tenant.id, slug: tenant.slug });
      return tenant;
    } catch (error) {
      logger.error('Failed to create tenant', { error, input });
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
      });

      return tenant;
    } catch (error) {
      logger.error('Failed to get tenant by ID', { error, tenantId });
      throw error;
    }
  }

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    try {
      const tenant = await db.tenant.findUnique({
        where: { slug },
      });

      return tenant;
    } catch (error) {
      logger.error('Failed to get tenant by slug', { error, slug });
      throw error;
    }
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, input: UpdateTenantInput): Promise<Tenant> {
    try {
      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: input,
      });

      logger.info('Tenant updated', { tenantId: tenant.id });
      return tenant;
    } catch (error) {
      logger.error('Failed to update tenant', { error, tenantId });
      throw error;
    }
  }

  /**
   * Delete tenant (soft delete)
   */
  async deleteTenant(tenantId: string): Promise<Tenant> {
    try {
      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          deletedAt: new Date(),
          status: 'deleted',
        },
      });

      logger.info('Tenant deleted', { tenantId: tenant.id });
      return tenant;
    } catch (error) {
      logger.error('Failed to delete tenant', { error, tenantId });
      throw error;
    }
  }

  /**
   * List tenants with pagination
   */
  async listTenants(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TenantWhereInput;
  }): Promise<{ tenants: Tenant[]; total: number }> {
    try {
      const { skip = 0, take = 10, where } = params;

      const [tenants, total] = await Promise.all([
        db.tenant.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: 'desc' },
        }),
        db.tenant.count({ where }),
      ]);

      return { tenants, total };
    } catch (error) {
      logger.error('Failed to list tenants', { error, params });
      throw error;
    }
  }

  /**
   * Add user to tenant with role
   */
  async addUserToTenant(input: AddUserToTenantInput): Promise<TenantUser> {
    try {
      const tenantUser = await db.tenantUser.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          roleId: input.roleId,
        },
      });

      logger.info('User added to tenant', {
        tenantId: input.tenantId,
        userId: input.userId,
        roleId: input.roleId,
      });

      return tenantUser;
    } catch (error) {
      logger.error('Failed to add user to tenant', { error, input });
      throw error;
    }
  }

  /**
   * Remove user from tenant
   */
  async removeUserFromTenant(tenantId: string, userId: string): Promise<TenantUser> {
    try {
      const tenantUser = await db.tenantUser.delete({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
      });

      logger.info('User removed from tenant', { tenantId, userId });
      return tenantUser;
    } catch (error) {
      logger.error('Failed to remove user from tenant', { error, tenantId, userId });
      throw error;
    }
  }

  /**
   * Get users in tenant
   */
  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    try {
      const tenantUsers = await db.tenantUser.findMany({
        where: { tenantId },
        include: {
          user: true,
          role: true,
        },
      });

      return tenantUsers;
    } catch (error) {
      logger.error('Failed to get tenant users', { error, tenantId });
      throw error;
    }
  }

  /**
   * Get user's tenants
   */
  async getUserTenants(userId: string): Promise<TenantUser[]> {
    try {
      const tenantUsers = await db.tenantUser.findMany({
        where: { userId },
        include: {
          tenant: true,
          role: true,
        },
      });

      return tenantUsers;
    } catch (error) {
      logger.error('Failed to get user tenants', { error, userId });
      throw error;
    }
  }

  /**
   * Update user role in tenant
   */
  async updateUserRole(tenantId: string, userId: string, roleId: string): Promise<TenantUser> {
    try {
      const tenantUser = await db.tenantUser.update({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
        data: { roleId },
      });

      logger.info('User role updated in tenant', { tenantId, userId, roleId });
      return tenantUser;
    } catch (error) {
      logger.error('Failed to update user role', { error, tenantId, userId, roleId });
      throw error;
    }
  }

  /**
   * Check if user belongs to tenant
   */
  async isUserInTenant(tenantId: string, userId: string): Promise<boolean> {
    try {
      const tenantUser = await db.tenantUser.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
      });

      return !!tenantUser;
    } catch (error) {
      logger.error('Failed to check if user is in tenant', { error, tenantId, userId });
      throw error;
    }
  }
}

// Export singleton instance
export const tenantService = new TenantService();
