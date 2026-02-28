/**
 * Tenant Hierarchy Manager
 * 
 * Manages hierarchical tenant relationships (parent-child) for organization structures
 * and reseller scenarios. Supports efficient hierarchy queries using materialized paths.
 * 
 * @module TenantHierarchyManager
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { tenantContextManager } from './tenant-context.manager';
import { tenantValidator, TenantPermission } from './tenant-validator';

/**
 * Tenant hierarchy node representing a tenant and its position in the hierarchy
 */
export interface TenantHierarchyNode {
  /** Tenant ID */
  tenantId: string;
  /** Parent tenant ID (null for root tenants) */
  parentTenantId: string | null;
  /** Materialized path for efficient hierarchy queries (e.g., "/root/child1/child2") */
  path: string;
  /** Depth in the hierarchy (0 for root tenants) */
  depth: number;
  /** Whether this tenant is a root tenant */
  isRoot: boolean;
  /** Child tenant IDs */
  childTenantIds: string[];
}

/**
 * Options for hierarchy queries
 */
export interface HierarchyQueryOptions {
  /** Maximum depth to traverse (default: unlimited) */
  maxDepth?: number;
  /** Include the starting tenant in results (default: false) */
  includeSelf?: boolean;
}

/**
 * Error thrown when tenant hierarchy operation fails
 */
export class TenantHierarchyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantHierarchyError';
  }
}

/**
 * Tenant Hierarchy Manager
 * 
 * Manages hierarchical tenant relationships and provides efficient hierarchy queries.
 * Uses materialized paths for O(1) ancestor/descendant checks.
 */
export class TenantHierarchyManager {
  private static instance: TenantHierarchyManager;
  private hierarchyCache: Map<string, TenantHierarchyNode> = new Map();
  private readonly maxHierarchyDepth: number = 3;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TenantHierarchyManager {
    if (!TenantHierarchyManager.instance) {
      TenantHierarchyManager.instance = new TenantHierarchyManager();
    }
    return TenantHierarchyManager.instance;
  }

  /**
   * Get tenant hierarchy node
   * 
   * @param tenantId - Tenant ID
   * @returns Tenant hierarchy node
   */
  public async getTenantNode(tenantId: string): Promise<TenantHierarchyNode> {
    // Check cache first
    if (this.hierarchyCache.has(tenantId)) {
      return this.hierarchyCache.get(tenantId)!;
    }

    // In a real implementation, this would query the database
    // For now, we'll simulate with a mock implementation
    const node: TenantHierarchyNode = {
      tenantId,
      parentTenantId: null,
      path: `/${tenantId}`,
      depth: 0,
      isRoot: true,
      childTenantIds: [],
    };

    this.hierarchyCache.set(tenantId, node);
    return node;
  }

  /**
   * Get parent tenant ID
   * 
   * @param tenantId - Tenant ID
   * @returns Parent tenant ID or null if root tenant
   */
  public async getParentTenantId(tenantId: string): Promise<string | null> {
    const node = await this.getTenantNode(tenantId);
    return node.parentTenantId;
  }

  /**
   * Get all ancestor tenant IDs (from immediate parent to root)
   * 
   * @param tenantId - Tenant ID
   * @param options - Query options
   * @returns Array of ancestor tenant IDs
   */
  public async getAncestorTenantIds(
    tenantId: string,
    options: HierarchyQueryOptions = {}
  ): Promise<string[]> {
    const node = await this.getTenantNode(tenantId);
    const ancestors: string[] = [];

    // Parse path to get ancestors
    const pathParts = node.path.split('/').filter(p => p);
    
    // Remove the tenant itself from the path
    pathParts.pop();

    // Apply max depth if specified
    const maxDepth = options.maxDepth ?? pathParts.length;
    const ancestorParts = pathParts.slice(-maxDepth);

    ancestors.push(...ancestorParts);

    // Include self if requested
    if (options.includeSelf) {
      ancestors.push(tenantId);
    }

    return ancestors;
  }

  /**
   * Get all descendant tenant IDs (all children recursively)
   * 
   * @param tenantId - Tenant ID
   * @param options - Query options
   * @returns Array of descendant tenant IDs
   */
  public async getDescendantTenantIds(
    tenantId: string,
    options: HierarchyQueryOptions = {}
  ): Promise<string[]> {
    const node = await this.getTenantNode(tenantId);
    const descendants: string[] = [];

    // In a real implementation, this would query the database for all tenants
    // whose path starts with the current tenant's path
    // For now, we'll just return the direct children
    descendants.push(...node.childTenantIds);

    // Include self if requested
    if (options.includeSelf) {
      descendants.unshift(tenantId);
    }

    return descendants;
  }

  /**
   * Get immediate child tenant IDs
   * 
   * @param tenantId - Tenant ID
   * @returns Array of child tenant IDs
   */
  public async getChildTenantIds(tenantId: string): Promise<string[]> {
    const node = await this.getTenantNode(tenantId);
    return [...node.childTenantIds];
  }

  /**
   * Check if a tenant is an ancestor of another tenant
   * 
   * @param ancestorTenantId - Potential ancestor tenant ID
   * @param descendantTenantId - Potential descendant tenant ID
   * @returns True if ancestorTenantId is an ancestor of descendantTenantId
   */
  public async isAncestor(
    ancestorTenantId: string,
    descendantTenantId: string
  ): Promise<boolean> {
    const descendantNode = await this.getTenantNode(descendantTenantId);
    
    // Check if ancestor's path is a prefix of descendant's path
    return descendantNode.path.startsWith(`/${ancestorTenantId}/`);
  }

  /**
   * Check if a tenant is a descendant of another tenant
   * 
   * @param descendantTenantId - Potential descendant tenant ID
   * @param ancestorTenantId - Potential ancestor tenant ID
   * @returns True if descendantTenantId is a descendant of ancestorTenantId
   */
  public async isDescendant(
    descendantTenantId: string,
    ancestorTenantId: string
  ): Promise<boolean> {
    return this.isAncestor(ancestorTenantId, descendantTenantId);
  }

  /**
   * Check if current user can access a tenant based on hierarchy
   * 
   * @param targetTenantId - Target tenant ID to access
   * @returns True if access is allowed based on hierarchy
   */
  public async canAccessTenantInHierarchy(targetTenantId: string): Promise<boolean> {
    const currentTenantId = tenantContextManager.getTenantId();
    
    if (!currentTenantId) {
      return false;
    }

    // Same tenant - always allowed
    if (currentTenantId === targetTenantId) {
      return true;
    }

    // Check if current tenant is an ancestor (parent can access children)
    const isParent = await this.isAncestor(currentTenantId, targetTenantId);
    if (isParent) {
      // Verify user has appropriate permission
      return tenantValidator.validateCrossTenantAccess(
        currentTenantId,
        targetTenantId,
        TenantPermission.READ
      );
    }

    return false;
  }

  /**
   * Get all accessible tenant IDs for current user based on hierarchy
   * 
   * @param includeDescendants - Include descendant tenants (default: true)
   * @returns Array of accessible tenant IDs
   */
  public async getAccessibleTenantIds(
    includeDescendants: boolean = true
  ): Promise<string[]> {
    const currentTenantId = tenantContextManager.getTenantId();
    
    if (!currentTenantId) {
      return [];
    }

    const accessibleTenantIds: string[] = [currentTenantId];

    if (includeDescendants) {
      const descendants = await this.getDescendantTenantIds(currentTenantId);
      accessibleTenantIds.push(...descendants);
    }

    return accessibleTenantIds;
  }

  /**
   * Create a child tenant
   * 
   * @param parentTenantId - Parent tenant ID
   * @param childTenantId - Child tenant ID
   * @throws TenantHierarchyError if hierarchy depth exceeds maximum
   */
  public async createChildTenant(
    parentTenantId: string,
    childTenantId: string
  ): Promise<void> {
    const parentNode = await this.getTenantNode(parentTenantId);

    // Check hierarchy depth
    if (parentNode.depth >= this.maxHierarchyDepth) {
      throw new TenantHierarchyError(
        `Cannot create child tenant: maximum hierarchy depth (${this.maxHierarchyDepth}) exceeded`
      );
    }

    // Create child node
    const childNode: TenantHierarchyNode = {
      tenantId: childTenantId,
      parentTenantId,
      path: `${parentNode.path}/${childTenantId}`,
      depth: parentNode.depth + 1,
      isRoot: false,
      childTenantIds: [],
    };

    // Update parent's children
    parentNode.childTenantIds.push(childTenantId);
    this.hierarchyCache.set(parentTenantId, parentNode);

    // Cache child node
    this.hierarchyCache.set(childTenantId, childNode);
  }

  /**
   * Remove a tenant from the hierarchy
   * 
   * @param tenantId - Tenant ID to remove
   * @throws TenantHierarchyError if tenant has children
   */
  public async removeTenant(tenantId: string): Promise<void> {
    const node = await this.getTenantNode(tenantId);

    // Check if tenant has children
    if (node.childTenantIds.length > 0) {
      throw new TenantHierarchyError(
        `Cannot remove tenant: tenant has ${node.childTenantIds.length} child tenant(s)`
      );
    }

    // Remove from parent's children
    if (node.parentTenantId) {
      const parentNode = await this.getTenantNode(node.parentTenantId);
      parentNode.childTenantIds = parentNode.childTenantIds.filter(
        id => id !== tenantId
      );
      this.hierarchyCache.set(node.parentTenantId, parentNode);
    }

    // Remove from cache
    this.hierarchyCache.delete(tenantId);
  }

  /**
   * Clear hierarchy cache
   */
  public clearCache(): void {
    this.hierarchyCache.clear();
  }
}

/**
 * Singleton instance of Tenant Hierarchy Manager
 */
export const tenantHierarchyManager = TenantHierarchyManager.getInstance();
