/**
 * WEEG (Permission System) - Policy Engine
 * 
 * The Policy Engine is the core component that evaluates permission requests.
 * It implements both RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control).
 * 
 * @module weeg/policy-engine
 */

import {
  PermissionCheckRequest,
  PermissionCheckResponse,
  Permission,
  Role,
  UserRole,
  Policy,
  AbacRule,
  WeegError,
  WeegErrorCode,
} from './types';

/**
 * Policy Engine Configuration
 */
export interface PolicyEngineConfig {
  /** Whether to enable ABAC evaluation */
  enableAbac: boolean;
  
  /** Whether to cache permission results */
  enableCaching: boolean;
  
  /** Cache TTL in seconds */
  cacheTtl: number;
  
  /** Whether to log all permission checks for auditing */
  enableAuditLogging: boolean;
}

/**
 * Default configuration for the Policy Engine
 */
const DEFAULT_CONFIG: PolicyEngineConfig = {
  enableAbac: true,
  enableCaching: true,
  cacheTtl: 300, // 5 minutes
  enableAuditLogging: true,
};

/**
 * Policy Engine
 * 
 * Evaluates permission requests against roles, permissions, and policies.
 * Supports both RBAC and ABAC evaluation.
 */
export class PolicyEngine {
  private config: PolicyEngineConfig;

  constructor(config?: Partial<PolicyEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a user has permission to perform an action.
   * 
   * This is the main entry point for permission checks.
   * It evaluates both RBAC and ABAC rules.
   * 
   * @param request - Permission check request
   * @param userRoles - Roles assigned to the user
   * @param rolePolicies - Policies for the user's roles
   * @param permissions - All permissions in the system
   * @param abacRules - ABAC rules (optional)
   * @returns Permission check response
   */
  async checkPermission(
    request: PermissionCheckRequest,
    userRoles: UserRole[],
    rolePolicies: Policy[],
    permissions: Permission[],
    abacRules?: AbacRule[]
  ): Promise<PermissionCheckResponse> {
    // Validate request
    this.validateRequest(request);

    // Filter roles for the current tenant
    const tenantRoles = userRoles.filter(
      (ur) => ur.tenantId === request.tenantId
    );

    if (tenantRoles.length === 0) {
      return {
        allowed: false,
        reason: 'User has no roles in this tenant',
        checkedAt: new Date(),
      };
    }

    // Get role IDs
    const roleIds = tenantRoles.map((ur) => ur.roleId);

    // Get permissions for these roles
    const userPermissions = this.getUserPermissions(
      roleIds,
      rolePolicies,
      permissions
    );

    // Check RBAC
    const rbacAllowed = this.checkRbac(request.action, userPermissions);

    if (rbacAllowed) {
      return {
        allowed: true,
        checkedAt: new Date(),
      };
    }

    // Check ABAC if enabled
    if (this.config.enableAbac && abacRules && abacRules.length > 0) {
      const abacAllowed = await this.checkAbac(
        request,
        abacRules,
        permissions
      );

      if (abacAllowed) {
        return {
          allowed: true,
          checkedAt: new Date(),
        };
      }
    }

    // Permission denied
    return {
      allowed: false,
      reason: `User does not have permission: ${request.action}`,
      checkedAt: new Date(),
    };
  }

  /**
   * Validate the permission check request.
   * 
   * @param request - Permission check request
   * @throws WeegError if the request is invalid
   */
  private validateRequest(request: PermissionCheckRequest): void {
    if (!request.tenantId) {
      throw new WeegError(
        WeegErrorCode.INVALID_REQUEST,
        'tenantId is required'
      );
    }

    if (!request.userId) {
      throw new WeegError(
        WeegErrorCode.INVALID_REQUEST,
        'userId is required'
      );
    }

    if (!request.action) {
      throw new WeegError(
        WeegErrorCode.INVALID_REQUEST,
        'action is required'
      );
    }
  }

  /**
   * Get all permissions for a set of roles.
   * 
   * @param roleIds - Role IDs
   * @param rolePolicies - All policies
   * @param permissions - All permissions
   * @returns Set of permission names
   */
  private getUserPermissions(
    roleIds: string[],
    rolePolicies: Policy[],
    permissions: Permission[]
  ): Set<string> {
    const userPermissions = new Set<string>();

    // Get policies for the user's roles
    const userPolicies = rolePolicies.filter((policy) =>
      roleIds.includes(policy.roleId)
    );

    // Get permission IDs from policies
    const permissionIds = userPolicies.map((policy) => policy.permissionId);

    // Get permission names
    permissions.forEach((permission) => {
      if (permissionIds.includes(permission.id)) {
        userPermissions.add(permission.name);
      }
    });

    return userPermissions;
  }

  /**
   * Check RBAC permissions.
   * 
   * Supports hierarchical permissions (e.g., "user.*" grants "user.create", "user.delete").
   * 
   * @param action - Action being performed
   * @param userPermissions - User's permissions
   * @returns Whether the action is allowed
   */
  private checkRbac(action: string, userPermissions: Set<string>): boolean {
    // Direct match
    if (userPermissions.has(action)) {
      return true;
    }

    // Check wildcard permissions
    // e.g., "user.*" grants "user.create", "user.delete"
    const actionParts = action.split('.');
    for (let i = actionParts.length - 1; i > 0; i--) {
      const wildcardPermission = actionParts.slice(0, i).join('.') + '.*';
      if (userPermissions.has(wildcardPermission)) {
        return true;
      }
    }

    // Check for global admin permission
    if (userPermissions.has('*') || userPermissions.has('admin.*')) {
      return true;
    }

    return false;
  }

  /**
   * Check ABAC rules.
   * 
   * Evaluates attribute-based access control rules.
   * 
   * @param request - Permission check request
   * @param abacRules - ABAC rules
   * @param permissions - All permissions
   * @returns Whether the action is allowed
   */
  private async checkAbac(
    request: PermissionCheckRequest,
    abacRules: AbacRule[],
    permissions: Permission[]
  ): Promise<boolean> {
    // Filter active rules for the tenant
    const activeRules = abacRules.filter(
      (rule) => rule.active && rule.tenantId === request.tenantId
    );

    // Get the permission ID for the requested action
    const permission = permissions.find((p) => p.name === request.action);
    if (!permission) {
      return false;
    }

    // Evaluate each rule
    for (const rule of activeRules) {
      // Check if the rule grants the required permission
      if (rule.permissionId !== permission.id) {
        continue;
      }

      // Evaluate the rule condition
      const ruleMatches = this.evaluateAbacCondition(
        rule.condition,
        request.userAttributes || {},
        request.resource?.attributes || {},
        request.context || {}
      );

      if (ruleMatches) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate an ABAC rule condition.
   * 
   * This is a simple rule evaluator that supports basic comparisons.
   * For production, consider using a library like json-rules-engine.
   * 
   * @param condition - Rule condition
   * @param userAttributes - User attributes
   * @param resourceAttributes - Resource attributes
   * @param context - Environmental context
   * @returns Whether the condition matches
   */
  private evaluateAbacCondition(
    condition: Record<string, any>,
    userAttributes: Record<string, any>,
    resourceAttributes: Record<string, any>,
    context: Record<string, any>
  ): boolean {
    // Simple condition evaluator
    // Supports: { "user.department": "engineering", "resource.owner": "user.id" }
    
    for (const [key, expectedValue] of Object.entries(condition)) {
      const actualValue = this.resolveAttributePath(
        key,
        userAttributes,
        resourceAttributes,
        context
      );

      if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve an attribute path (e.g., "user.department", "resource.owner").
   * 
   * @param path - Attribute path
   * @param userAttributes - User attributes
   * @param resourceAttributes - Resource attributes
   * @param context - Environmental context
   * @returns Attribute value
   */
  private resolveAttributePath(
    path: string,
    userAttributes: Record<string, any>,
    resourceAttributes: Record<string, any>,
    context: Record<string, any>
  ): any {
    const parts = path.split('.');
    const source = parts[0];
    const attributePath = parts.slice(1).join('.');

    let attributes: Record<string, any>;
    if (source === 'user') {
      attributes = userAttributes;
    } else if (source === 'resource') {
      attributes = resourceAttributes;
    } else if (source === 'context') {
      attributes = context;
    } else {
      return undefined;
    }

    // Navigate the attribute path
    let value: any = attributes;
    for (const part of attributePath.split('.')) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if a permission name matches a pattern (supports wildcards).
   * 
   * @param permission - Permission name
   * @param pattern - Pattern (may include wildcards)
   * @returns Whether the permission matches the pattern
   */
  matchesPattern(permission: string, pattern: string): boolean {
    if (pattern === '*') {
      return true;
    }

    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return permission.startsWith(prefix + '.');
    }

    return permission === pattern;
  }
}
