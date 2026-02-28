/**
 * Tenant Validator
 * 
 * Validates tenant access permissions for cross-tenant operations.
 * Ensures that users can only access data from tenants they have
 * permission to access.
 * 
 * @module Multi-Tenant Data Scoping
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { tenantContextManager } from './tenant-context.manager';

/**
 * Tenant access permission types
 */
export enum TenantPermission {
  /**
   * Read access to tenant data
   */
  READ = 'READ',

  /**
   * Write access to tenant data
   */
  WRITE = 'WRITE',

  /**
   * Admin access to tenant (full control)
   */
  ADMIN = 'ADMIN',

  /**
   * Cross-tenant read access (for aggregation, reporting)
   */
  CROSS_TENANT_READ = 'CROSS_TENANT_READ',

  /**
   * Platform admin access (access to all tenants)
   */
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

/**
 * Tenant access denied error
 */
export class TenantAccessDeniedError extends Error {
  public readonly tenantId: string;
  public readonly permission: TenantPermission;

  constructor(tenantId: string, permission: TenantPermission, message?: string) {
    super(
      message ||
        `Access denied to tenant ${tenantId} with permission ${permission}`
    );
    this.name = 'TenantAccessDeniedError';
    this.tenantId = tenantId;
    this.permission = permission;
  }
}

/**
 * Tenant validation result
 */
export interface TenantValidationResult {
  /**
   * Whether access is granted
   */
  granted: boolean;

  /**
   * Tenant ID being accessed
   */
  tenantId: string;

  /**
   * Permission being checked
   */
  permission: TenantPermission;

  /**
   * Reason for denial (if access is denied)
   */
  reason?: string;
}

/**
 * Tenant Validator
 * 
 * Provides methods to validate tenant access permissions and enforce
 * tenant isolation for cross-tenant operations.
 */
export class TenantValidator {
  private static instance: TenantValidator;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TenantValidator {
    if (!TenantValidator.instance) {
      TenantValidator.instance = new TenantValidator();
    }
    return TenantValidator.instance;
  }

  /**
   * Validate tenant access permission
   * 
   * @param targetTenantId - Tenant ID being accessed
   * @param permission - Permission being checked
   * @param userPermissions - User's permissions (from auth token)
   * @returns Validation result
   */
  public validateTenantAccess(
    targetTenantId: string,
    permission: TenantPermission,
    userPermissions: TenantPermission[] = []
  ): TenantValidationResult {
    // Get current tenant context
    const currentTenantId = tenantContextManager.getTenantId(false);

    // Platform admin has access to all tenants
    if (userPermissions.includes(TenantPermission.PLATFORM_ADMIN)) {
      return {
        granted: true,
        tenantId: targetTenantId,
        permission,
      };
    }

    // Same tenant access - check if user has required permission
    if (currentTenantId === targetTenantId) {
      const hasPermission = this.hasPermission(userPermissions, permission);
      return {
        granted: hasPermission,
        tenantId: targetTenantId,
        permission,
        reason: hasPermission
          ? undefined
          : `User does not have ${permission} permission for tenant ${targetTenantId}`,
      };
    }

    // Cross-tenant access - requires explicit cross-tenant permission
    if (permission === TenantPermission.CROSS_TENANT_READ) {
      const hasCrossTenantPermission = userPermissions.includes(
        TenantPermission.CROSS_TENANT_READ
      );
      return {
        granted: hasCrossTenantPermission,
        tenantId: targetTenantId,
        permission,
        reason: hasCrossTenantPermission
          ? undefined
          : `User does not have CROSS_TENANT_READ permission to access tenant ${targetTenantId}`,
      };
    }

    // Cross-tenant write/admin access is denied by default
    return {
      granted: false,
      tenantId: targetTenantId,
      permission,
      reason: `Cross-tenant ${permission} access is not allowed. Current tenant: ${currentTenantId}, Target tenant: ${targetTenantId}`,
    };
  }

  /**
   * Assert tenant access permission (throws error if denied)
   * 
   * @param targetTenantId - Tenant ID being accessed
   * @param permission - Permission being checked
   * @param userPermissions - User's permissions (from auth token)
   * @throws TenantAccessDeniedError if access is denied
   */
  public assertTenantAccess(
    targetTenantId: string,
    permission: TenantPermission,
    userPermissions: TenantPermission[] = []
  ): void {
    const result = this.validateTenantAccess(
      targetTenantId,
      permission,
      userPermissions
    );

    if (!result.granted) {
      throw new TenantAccessDeniedError(
        targetTenantId,
        permission,
        result.reason
      );
    }
  }

  /**
   * Check if user has specific permission
   * 
   * @param userPermissions - User's permissions
   * @param requiredPermission - Required permission
   * @returns True if user has permission
   */
  private hasPermission(
    userPermissions: TenantPermission[],
    requiredPermission: TenantPermission
  ): boolean {
    // Platform admin has all permissions
    if (userPermissions.includes(TenantPermission.PLATFORM_ADMIN)) {
      return true;
    }

    // Admin has all tenant-level permissions
    if (userPermissions.includes(TenantPermission.ADMIN)) {
      return requiredPermission !== TenantPermission.PLATFORM_ADMIN;
    }

    // Check for specific permission
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Write permission includes read permission
    if (
      requiredPermission === TenantPermission.READ &&
      userPermissions.includes(TenantPermission.WRITE)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Validate current tenant context matches target tenant
   * 
   * @param targetTenantId - Target tenant ID
   * @throws TenantAccessDeniedError if tenant context doesn't match
   */
  public validateCurrentTenant(targetTenantId: string): void {
    const currentTenantId = tenantContextManager.getTenantId(true);

    if (currentTenantId !== targetTenantId) {
      throw new TenantAccessDeniedError(
        targetTenantId,
        TenantPermission.READ,
        `Tenant context mismatch. Current tenant: ${currentTenantId}, Target tenant: ${targetTenantId}`
      );
    }
  }

  /**
   * Check if current user is platform admin
   * 
   * @param userPermissions - User's permissions
   * @returns True if user is platform admin
   */
  public isPlatformAdmin(userPermissions: TenantPermission[]): boolean {
    return userPermissions.includes(TenantPermission.PLATFORM_ADMIN);
  }

  /**
   * Check if current user is tenant admin
   * 
   * @param userPermissions - User's permissions
   * @returns True if user is tenant admin
   */
  public isTenantAdmin(userPermissions: TenantPermission[]): boolean {
    return (
      userPermissions.includes(TenantPermission.ADMIN) ||
      userPermissions.includes(TenantPermission.PLATFORM_ADMIN)
    );
  }

  /**
   * Get accessible tenant IDs for current user
   * 
   * This is a placeholder for future implementation with tenant hierarchy.
   * Currently returns only the current tenant ID.
   * 
   * @param userPermissions - User's permissions
   * @returns Array of accessible tenant IDs
   */
  public getAccessibleTenantIds(
    userPermissions: TenantPermission[]
  ): string[] {
    // Platform admin can access all tenants (requires separate query)
    if (this.isPlatformAdmin(userPermissions)) {
      // TODO: Query all tenant IDs from database
      return [];
    }

    // Regular user can only access current tenant
    const currentTenantId = tenantContextManager.getTenantId(false);
    return currentTenantId ? [currentTenantId] : [];
  }
}

// Export singleton instance
export const tenantValidator = TenantValidator.getInstance();
