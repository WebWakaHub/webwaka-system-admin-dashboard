/**
 * WEEG (Permission System) - Permission Service
 * 
 * The Permission Service is the business logic layer for the WEEG module.
 * It coordinates between the Policy Engine, database, and cache.
 * 
 * @module weeg/permission-service
 */

import {
  PermissionCheckRequest,
  PermissionCheckResponse,
  Role,
  Permission,
  Policy,
  UserRole,
  AbacRule,
  PermissionAuditLog,
  WeegError,
  WeegErrorCode,
  CachedPermissions,
  PermissionCacheKey,
} from './types';
import { PolicyEngine } from './policy-engine';

/**
 * Permission Repository Interface
 * 
 * This interface defines the data access methods needed by the Permission Service.
 * Implementations will interact with PostgreSQL.
 */
export interface PermissionRepository {
  // Role operations
  getRoleById(roleId: string, tenantId: string): Promise<Role | null>;
  getRolesByTenant(tenantId: string): Promise<Role[]>;
  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  updateRole(roleId: string, tenantId: string, updates: Partial<Role>): Promise<Role>;
  deleteRole(roleId: string, tenantId: string): Promise<void>;

  // Permission operations
  getPermissionById(permissionId: string): Promise<Permission | null>;
  getPermissionByName(name: string): Promise<Permission | null>;
  getAllPermissions(): Promise<Permission[]>;
  createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission>;

  // Policy operations
  getPoliciesByRoleIds(roleIds: string[]): Promise<Policy[]>;
  createPolicy(policy: Omit<Policy, 'id' | 'createdAt'>): Promise<Policy>;
  deletePolicy(policyId: string): Promise<void>;

  // User role operations
  getUserRoles(userId: string, tenantId: string): Promise<UserRole[]>;
  assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<UserRole>;
  removeRoleFromUser(userId: string, roleId: string, tenantId: string): Promise<void>;

  // ABAC rule operations
  getAbacRulesByTenant(tenantId: string): Promise<AbacRule[]>;
  createAbacRule(rule: Omit<AbacRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbacRule>;
  updateAbacRule(ruleId: string, tenantId: string, updates: Partial<AbacRule>): Promise<AbacRule>;
  deleteAbacRule(ruleId: string, tenantId: string): Promise<void>;

  // Audit log operations
  createAuditLog(log: Omit<PermissionAuditLog, 'id' | 'timestamp'>): Promise<PermissionAuditLog>;
}

/**
 * Cache Interface
 * 
 * This interface defines the caching methods needed by the Permission Service.
 * Implementations will use Redis.
 */
export interface PermissionCache {
  get(key: PermissionCacheKey): Promise<CachedPermissions | null>;
  set(key: PermissionCacheKey, value: CachedPermissions, ttl: number): Promise<void>;
  invalidate(key: PermissionCacheKey): Promise<void>;
  invalidateUser(userId: string, tenantId: string): Promise<void>;
  invalidateTenant(tenantId: string): Promise<void>;
}

/**
 * Permission Service Configuration
 */
export interface PermissionServiceConfig {
  /** Whether to enable caching */
  enableCaching: boolean;
  
  /** Cache TTL in seconds */
  cacheTtl: number;
  
  /** Whether to enable audit logging */
  enableAuditLogging: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PermissionServiceConfig = {
  enableCaching: true,
  cacheTtl: 300, // 5 minutes
  enableAuditLogging: true,
};

/**
 * Permission Service
 * 
 * Provides high-level methods for permission management and checking.
 */
export class PermissionService {
  private policyEngine: PolicyEngine;
  private config: PermissionServiceConfig;

  constructor(
    private repository: PermissionRepository,
    private cache: PermissionCache,
    config?: Partial<PermissionServiceConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.policyEngine = new PolicyEngine({
      enableAbac: true,
      enableCaching: this.config.enableCaching,
      cacheTtl: this.config.cacheTtl,
      enableAuditLogging: this.config.enableAuditLogging,
    });
  }

  /**
   * Check if a user has permission to perform an action.
   * 
   * This is the main API for permission checks.
   * 
   * @param request - Permission check request
   * @returns Permission check response
   */
  async checkPermission(
    request: PermissionCheckRequest
  ): Promise<PermissionCheckResponse> {
    const startTime = Date.now();

    try {
      // Check cache first if enabled
      if (this.config.enableCaching) {
        const cached = await this.checkCachedPermission(request);
        if (cached !== null) {
          return cached;
        }
      }

      // Get user roles
      const userRoles = await this.repository.getUserRoles(
        request.userId,
        request.tenantId
      );

      if (userRoles.length === 0) {
        return {
          allowed: false,
          reason: 'User has no roles in this tenant',
          checkedAt: new Date(),
        };
      }

      // Get role IDs
      const roleIds = userRoles.map((ur) => ur.roleId);

      // Get policies for these roles
      const policies = await this.repository.getPoliciesByRoleIds(roleIds);

      // Get all permissions
      const permissions = await this.repository.getAllPermissions();

      // Get ABAC rules
      const abacRules = await this.repository.getAbacRulesByTenant(
        request.tenantId
      );

      // Check permission using Policy Engine
      const response = await this.policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions,
        abacRules
      );

      // Cache the result if enabled
      if (this.config.enableCaching && response.allowed) {
        await this.cachePermissionResult(request, permissions, policies, roleIds);
      }

      // Log the check if audit logging is enabled
      if (this.config.enableAuditLogging) {
        await this.logPermissionCheck(request, response, Date.now() - startTime);
      }

      return response;
    } catch (error) {
      if (error instanceof WeegError) {
        throw error;
      }

      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to check permission',
        { originalError: error }
      );
    }
  }

  /**
   * Check cached permission.
   * 
   * @param request - Permission check request
   * @returns Cached response or null if not cached
   */
  private async checkCachedPermission(
    request: PermissionCheckRequest
  ): Promise<PermissionCheckResponse | null> {
    try {
      const cacheKey: PermissionCacheKey = {
        tenantId: request.tenantId,
        userId: request.userId,
      };

      const cached = await this.cache.get(cacheKey);
      if (!cached) {
        return null;
      }

      // Check if the cached permissions include the requested action
      const hasPermission = this.policyEngine.matchesPattern(
        request.action,
        Array.from(cached.permissions).join(',')
      );

      if (hasPermission) {
        return {
          allowed: true,
          checkedAt: new Date(),
        };
      }

      return null;
    } catch (error) {
      // If cache fails, continue with normal check
      console.error('Cache check failed:', error);
      return null;
    }
  }

  /**
   * Cache permission result.
   * 
   * @param request - Permission check request
   * @param permissions - All permissions
   * @param policies - User's policies
   * @param roleIds - User's role IDs
   */
  private async cachePermissionResult(
    request: PermissionCheckRequest,
    permissions: Permission[],
    policies: Policy[],
    roleIds: string[]
  ): Promise<void> {
    try {
      // Get permission IDs from policies
      const userPolicies = policies.filter((policy) =>
        roleIds.includes(policy.roleId)
      );
      const permissionIds = userPolicies.map((policy) => policy.permissionId);

      // Get permission names
      const permissionNames = permissions
        .filter((p) => permissionIds.includes(p.id))
        .map((p) => p.name);

      const cacheKey: PermissionCacheKey = {
        tenantId: request.tenantId,
        userId: request.userId,
      };

      const cachedPermissions: CachedPermissions = {
        permissions: new Set(permissionNames),
        cachedAt: new Date(),
        ttl: this.config.cacheTtl,
      };

      await this.cache.set(cacheKey, cachedPermissions, this.config.cacheTtl);
    } catch (error) {
      // If caching fails, just log and continue
      console.error('Failed to cache permission result:', error);
    }
  }

  /**
   * Log permission check for auditing.
   * 
   * @param request - Permission check request
   * @param response - Permission check response
   * @param durationMs - Duration of the check in milliseconds
   */
  private async logPermissionCheck(
    request: PermissionCheckRequest,
    response: PermissionCheckResponse,
    durationMs: number
  ): Promise<void> {
    try {
      await this.repository.createAuditLog({
        tenantId: request.tenantId,
        actorId: request.userId,
        action: 'permission.check',
        entityType: 'permission',
        entityId: request.action,
        newState: {
          allowed: response.allowed,
          reason: response.reason,
          durationMs,
        },
      });
    } catch (error) {
      // If audit logging fails, just log and continue
      console.error('Failed to log permission check:', error);
    }
  }

  /**
   * Create a new role.
   * 
   * @param tenantId - Tenant ID
   * @param name - Role name
   * @param description - Role description
   * @param actorId - User creating the role
   * @returns Created role
   */
  async createRole(
    tenantId: string,
    name: string,
    description: string | undefined,
    actorId: string
  ): Promise<Role> {
    const role = await this.repository.createRole({
      tenantId,
      name,
      description,
    });

    // Invalidate cache for the tenant
    await this.cache.invalidateTenant(tenantId);

    // Log the action
    if (this.config.enableAuditLogging) {
      await this.repository.createAuditLog({
        tenantId,
        actorId,
        action: 'role.created',
        entityType: 'role',
        entityId: role.id,
        newState: role,
      });
    }

    return role;
  }

  /**
   * Assign a permission to a role.
   * 
   * @param roleId - Role ID
   * @param permissionId - Permission ID
   * @param tenantId - Tenant ID
   * @param actorId - User assigning the permission
   * @returns Created policy
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    tenantId: string,
    actorId: string
  ): Promise<Policy> {
    // Verify the role exists and belongs to the tenant
    const role = await this.repository.getRoleById(roleId, tenantId);
    if (!role) {
      throw new WeegError(
        WeegErrorCode.ROLE_NOT_FOUND,
        `Role not found: ${roleId}`
      );
    }

    // Verify the permission exists
    const permission = await this.repository.getPermissionById(permissionId);
    if (!permission) {
      throw new WeegError(
        WeegErrorCode.PERMISSION_NOT_FOUND,
        `Permission not found: ${permissionId}`
      );
    }

    // Create the policy
    const policy = await this.repository.createPolicy({
      roleId,
      permissionId,
    });

    // Invalidate cache for the tenant
    await this.cache.invalidateTenant(tenantId);

    // Log the action
    if (this.config.enableAuditLogging) {
      await this.repository.createAuditLog({
        tenantId,
        actorId,
        action: 'permission.assigned',
        entityType: 'policy',
        entityId: policy.id,
        newState: policy,
      });
    }

    return policy;
  }

  /**
   * Assign a role to a user.
   * 
   * @param userId - User ID
   * @param roleId - Role ID
   * @param tenantId - Tenant ID
   * @param actorId - User assigning the role
   * @returns Created user role
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    tenantId: string,
    actorId: string
  ): Promise<UserRole> {
    // Verify the role exists and belongs to the tenant
    const role = await this.repository.getRoleById(roleId, tenantId);
    if (!role) {
      throw new WeegError(
        WeegErrorCode.ROLE_NOT_FOUND,
        `Role not found: ${roleId}`
      );
    }

    // Assign the role
    const userRole = await this.repository.assignRoleToUser(
      userId,
      roleId,
      tenantId
    );

    // Invalidate cache for the user
    await this.cache.invalidateUser(userId, tenantId);

    // Log the action
    if (this.config.enableAuditLogging) {
      await this.repository.createAuditLog({
        tenantId,
        actorId,
        action: 'role.assigned',
        entityType: 'user_role',
        entityId: `${userId}:${roleId}`,
        newState: userRole,
      });
    }

    return userRole;
  }
}
