/**
 * Query Interceptor
 * 
 * Automatically adds tenant_id filters to all database queries to ensure
 * tenant isolation. Intercepts SELECT, INSERT, UPDATE, DELETE operations
 * and adds tenant scoping without requiring manual intervention.
 * 
 * @module Multi-Tenant Data Scoping
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { tenantContextManager, TenantContextMissingError } from './tenant-context.manager';

/**
 * Query operation types
 */
export enum QueryOperation {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RAW = 'RAW',
}

/**
 * Query interceptor options
 */
export interface QueryInterceptorOptions {
  /**
   * Skip tenant scoping for system queries
   */
  skipTenantScoping?: boolean;

  /**
   * Allow queries without tenant context (use with caution)
   */
  allowWithoutTenantContext?: boolean;

  /**
   * Custom tenant ID override (for cross-tenant operations)
   */
  tenantIdOverride?: string;
}

/**
 * Intercepted query result
 */
export interface InterceptedQuery {
  /**
   * Original query or query builder
   */
  query: any;

  /**
   * Tenant ID applied to the query
   */
  tenantId: string | null;

  /**
   * Query operation type
   */
  operation: QueryOperation;

  /**
   * Whether tenant scoping was applied
   */
  tenantScopingApplied: boolean;
}

/**
 * Query Interceptor
 * 
 * Provides methods to intercept and modify database queries to add
 * automatic tenant scoping. Works with ORM query builders and raw SQL.
 */
export class QueryInterceptor {
  private static instance: QueryInterceptor;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): QueryInterceptor {
    if (!QueryInterceptor.instance) {
      QueryInterceptor.instance = new QueryInterceptor();
    }
    return QueryInterceptor.instance;
  }

  /**
   * Intercept SELECT query
   * 
   * Adds WHERE tenant_id = ? filter to SELECT queries
   * 
   * @param queryBuilder - ORM query builder
   * @param options - Interceptor options
   * @returns Intercepted query
   */
  public interceptSelect(
    queryBuilder: any,
    options: QueryInterceptorOptions = {}
  ): InterceptedQuery {
    // Skip tenant scoping if explicitly requested
    if (options.skipTenantScoping) {
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.SELECT,
        tenantScopingApplied: false,
      };
    }

    // Get tenant ID from context or override
    const tenantId = options.tenantIdOverride || tenantContextManager.getTenantId(
      !options.allowWithoutTenantContext
    );

    if (!tenantId) {
      if (!options.allowWithoutTenantContext) {
        throw new TenantContextMissingError(
          'Tenant context is required for SELECT queries. Set tenant context or use skipTenantScoping option.'
        );
      }
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.SELECT,
        tenantScopingApplied: false,
      };
    }

    // Add tenant_id filter to query
    // Assuming query builder has a where() method (e.g., Knex, TypeORM)
    const scopedQuery = queryBuilder.where('tenant_id', tenantId);

    return {
      query: scopedQuery,
      tenantId,
      operation: QueryOperation.SELECT,
      tenantScopingApplied: true,
    };
  }

  /**
   * Intercept INSERT query
   * 
   * Adds tenant_id column to INSERT queries
   * 
   * @param queryBuilder - ORM query builder
   * @param data - Data to insert
   * @param options - Interceptor options
   * @returns Intercepted query
   */
  public interceptInsert(
    queryBuilder: any,
    data: Record<string, any> | Record<string, any>[],
    options: QueryInterceptorOptions = {}
  ): InterceptedQuery {
    // Skip tenant scoping if explicitly requested
    if (options.skipTenantScoping) {
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.INSERT,
        tenantScopingApplied: false,
      };
    }

    // Get tenant ID from context or override
    const tenantId = options.tenantIdOverride || tenantContextManager.getTenantId(
      !options.allowWithoutTenantContext
    );

    if (!tenantId) {
      if (!options.allowWithoutTenantContext) {
        throw new TenantContextMissingError(
          'Tenant context is required for INSERT queries. Set tenant context or use skipTenantScoping option.'
        );
      }
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.INSERT,
        tenantScopingApplied: false,
      };
    }

    // Add tenant_id to data
    const scopedData = Array.isArray(data)
      ? data.map(item => ({ ...item, tenant_id: tenantId }))
      : { ...data, tenant_id: tenantId };

    // Validate that tenant_id is not being overridden
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item.tenant_id && item.tenant_id !== tenantId) {
          throw new Error(
            `Cannot override tenant_id in INSERT query. Attempted to set tenant_id to ${item.tenant_id} but current context is ${tenantId} (row ${index})`
          );
        }
      });
    } else {
      if (data.tenant_id && data.tenant_id !== tenantId) {
        throw new Error(
          `Cannot override tenant_id in INSERT query. Attempted to set tenant_id to ${data.tenant_id} but current context is ${tenantId}`
        );
      }
    }

    const scopedQuery = queryBuilder.insert(scopedData);

    return {
      query: scopedQuery,
      tenantId,
      operation: QueryOperation.INSERT,
      tenantScopingApplied: true,
    };
  }

  /**
   * Intercept UPDATE query
   * 
   * Adds WHERE tenant_id = ? filter to UPDATE queries
   * 
   * @param queryBuilder - ORM query builder
   * @param options - Interceptor options
   * @returns Intercepted query
   */
  public interceptUpdate(
    queryBuilder: any,
    options: QueryInterceptorOptions = {}
  ): InterceptedQuery {
    // Skip tenant scoping if explicitly requested
    if (options.skipTenantScoping) {
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.UPDATE,
        tenantScopingApplied: false,
      };
    }

    // Get tenant ID from context or override
    const tenantId = options.tenantIdOverride || tenantContextManager.getTenantId(
      !options.allowWithoutTenantContext
    );

    if (!tenantId) {
      if (!options.allowWithoutTenantContext) {
        throw new TenantContextMissingError(
          'Tenant context is required for UPDATE queries. Set tenant context or use skipTenantScoping option.'
        );
      }
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.UPDATE,
        tenantScopingApplied: false,
      };
    }

    // Add tenant_id filter to query
    const scopedQuery = queryBuilder.where('tenant_id', tenantId);

    return {
      query: scopedQuery,
      tenantId,
      operation: QueryOperation.UPDATE,
      tenantScopingApplied: true,
    };
  }

  /**
   * Intercept DELETE query
   * 
   * Adds WHERE tenant_id = ? filter to DELETE queries
   * 
   * @param queryBuilder - ORM query builder
   * @param options - Interceptor options
   * @returns Intercepted query
   */
  public interceptDelete(
    queryBuilder: any,
    options: QueryInterceptorOptions = {}
  ): InterceptedQuery {
    // Skip tenant scoping if explicitly requested
    if (options.skipTenantScoping) {
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.DELETE,
        tenantScopingApplied: false,
      };
    }

    // Get tenant ID from context or override
    const tenantId = options.tenantIdOverride || tenantContextManager.getTenantId(
      !options.allowWithoutTenantContext
    );

    if (!tenantId) {
      if (!options.allowWithoutTenantContext) {
        throw new TenantContextMissingError(
          'Tenant context is required for DELETE queries. Set tenant context or use skipTenantScoping option.'
        );
      }
      return {
        query: queryBuilder,
        tenantId: null,
        operation: QueryOperation.DELETE,
        tenantScopingApplied: false,
      };
    }

    // Add tenant_id filter to query
    const scopedQuery = queryBuilder.where('tenant_id', tenantId);

    return {
      query: scopedQuery,
      tenantId,
      operation: QueryOperation.DELETE,
      tenantScopingApplied: true,
    };
  }

  /**
   * Validate raw SQL query for tenant scoping
   * 
   * Checks if raw SQL query includes tenant_id filter
   * 
   * @param sql - Raw SQL query
   * @param options - Interceptor options
   * @returns Validation result
   */
  public validateRawSql(
    sql: string,
    options: QueryInterceptorOptions = {}
  ): { valid: boolean; warning?: string } {
    // Skip validation if explicitly requested
    if (options.skipTenantScoping) {
      return { valid: true };
    }

    // Check if SQL includes tenant_id filter
    const hasTenantIdFilter = /tenant_id\s*=\s*['"]?[a-f0-9-]+['"]?/i.test(sql);

    if (!hasTenantIdFilter) {
      return {
        valid: false,
        warning: 'Raw SQL query does not include tenant_id filter. This may cause data leakage. Use skipTenantScoping option if this is intentional.',
      };
    }

    return { valid: true };
  }

  /**
   * Get current tenant ID for query scoping
   * 
   * @param options - Interceptor options
   * @returns Tenant ID or null
   */
  public getTenantIdForQuery(
    options: QueryInterceptorOptions = {}
  ): string | null {
    if (options.skipTenantScoping) {
      return null;
    }

    return options.tenantIdOverride || tenantContextManager.getTenantId(
      !options.allowWithoutTenantContext
    );
  }
}

// Export singleton instance
export const queryInterceptor = QueryInterceptor.getInstance();
