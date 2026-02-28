/**
 * WEEG (Permission System) - Core Types and Interfaces
 * 
 * This file defines the core types for the WebWaka Permission System.
 * All permission-related data structures are defined here.
 * 
 * @module weeg/types
 */

/**
 * Represents a role in the system.
 * Roles are collections of permissions that can be assigned to users.
 */
export interface Role {
  /** Unique identifier for the role */
  id: string;
  
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  
  /** Human-readable name of the role */
  name: string;
  
  /** Optional description of the role's purpose */
  description?: string;
  
  /** Timestamp when the role was created */
  createdAt: Date;
  
  /** Timestamp when the role was last updated */
  updatedAt: Date;
}

/**
 * Represents a permission in the system.
 * Permissions define specific actions that can be performed.
 */
export interface Permission {
  /** Unique identifier for the permission */
  id: string;
  
  /** Permission name in hierarchical format (e.g., "user.create", "user.delete") */
  name: string;
  
  /** Optional description of what this permission allows */
  description?: string;
  
  /** Timestamp when the permission was created */
  createdAt: Date;
}

/**
 * Represents a policy that grants permissions to a role.
 * Policies are the link between roles and permissions.
 */
export interface Policy {
  /** Unique identifier for the policy */
  id: string;
  
  /** Role ID that this policy applies to */
  roleId: string;
  
  /** Permission ID that is granted by this policy */
  permissionId: string;
  
  /** Timestamp when the policy was created */
  createdAt: Date;
}

/**
 * Represents the assignment of a role to a user.
 */
export interface UserRole {
  /** User ID */
  userId: string;
  
  /** Role ID */
  roleId: string;
  
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  
  /** Timestamp when the role was assigned */
  assignedAt: Date;
}

/**
 * Request payload for checking permissions.
 */
export interface PermissionCheckRequest {
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  
  /** User ID whose permissions are being checked */
  userId: string;
  
  /** Action being performed (e.g., "user.create", "document.delete") */
  action: string;
  
  /** Optional resource information for ABAC evaluation */
  resource?: {
    /** Type of resource (e.g., "user", "document") */
    type: string;
    
    /** Resource ID */
    id: string;
    
    /** Additional resource attributes for ABAC */
    attributes?: Record<string, any>;
  };
  
  /** Optional user attributes for ABAC evaluation */
  userAttributes?: Record<string, any>;
  
  /** Optional environmental context for ABAC evaluation */
  context?: Record<string, any>;
}

/**
 * Response payload for permission checks.
 */
export interface PermissionCheckResponse {
  /** Whether the action is allowed */
  allowed: boolean;
  
  /** Optional reason for denial (for debugging/auditing) */
  reason?: string;
  
  /** Timestamp of the check */
  checkedAt: Date;
}

/**
 * Represents an ABAC rule for attribute-based access control.
 */
export interface AbacRule {
  /** Unique identifier for the rule */
  id: string;
  
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  
  /** Human-readable name of the rule */
  name: string;
  
  /** Rule condition in JSON format */
  condition: Record<string, any>;
  
  /** Permission granted if the rule matches */
  permissionId: string;
  
  /** Whether the rule is active */
  active: boolean;
  
  /** Timestamp when the rule was created */
  createdAt: Date;
  
  /** Timestamp when the rule was last updated */
  updatedAt: Date;
}

/**
 * Cache key format for permission data.
 */
export interface PermissionCacheKey {
  tenantId: string;
  userId: string;
  action?: string;
}

/**
 * Cached permission data.
 */
export interface CachedPermissions {
  /** Set of permission names the user has */
  permissions: Set<string>;
  
  /** Timestamp when the cache was created */
  cachedAt: Date;
  
  /** TTL in seconds */
  ttl: number;
}

/**
 * Audit log entry for permission changes.
 */
export interface PermissionAuditLog {
  /** Unique identifier for the audit log entry */
  id: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** User who made the change */
  actorId: string;
  
  /** Type of action (e.g., "role.created", "permission.assigned") */
  action: string;
  
  /** Entity type affected (e.g., "role", "permission", "policy") */
  entityType: string;
  
  /** Entity ID affected */
  entityId: string;
  
  /** Previous state (for updates/deletes) */
  previousState?: Record<string, any>;
  
  /** New state (for creates/updates) */
  newState?: Record<string, any>;
  
  /** Timestamp of the action */
  timestamp: Date;
}

/**
 * Error types for the WEEG module.
 */
export enum WeegErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  POLICY_NOT_FOUND = 'POLICY_NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
}

/**
 * Custom error class for WEEG errors.
 */
export class WeegError extends Error {
  constructor(
    public code: WeegErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'WeegError';
  }
}
