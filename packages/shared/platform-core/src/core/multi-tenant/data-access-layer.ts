/**
 * Data Access Layer Integration
 * 
 * Integrates multi-tenant scoping with the data access layer.
 * Provides base repository class with automatic tenant scoping.
 * 
 * @module Multi-Tenant Data Scoping
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { queryInterceptor, QueryInterceptorOptions } from './query-interceptor';
import { tenantContextManager } from './tenant-context.manager';
import { tenantValidator, TenantPermission } from './tenant-validator';

/**
 * Base repository with automatic tenant scoping
 * 
 * All repositories should extend this class to get automatic tenant scoping.
 */
export abstract class TenantScopedRepository<T> {
  /**
   * Table name for this repository
   */
  protected abstract tableName: string;

  /**
   * Query builder instance (e.g., Knex)
   */
  protected abstract queryBuilder: any;

  /**
   * Find all records for current tenant
   * 
   * @param options - Query interceptor options
   * @returns Array of records
   */
  public async findAll(options: QueryInterceptorOptions = {}): Promise<T[]> {
    const query = this.queryBuilder(this.tableName);
    const intercepted = queryInterceptor.interceptSelect(query, options);
    return await intercepted.query;
  }

  /**
   * Find record by ID for current tenant
   * 
   * @param id - Record ID
   * @param options - Query interceptor options
   * @returns Record or null
   */
  public async findById(
    id: string,
    options: QueryInterceptorOptions = {}
  ): Promise<T | null> {
    const query = this.queryBuilder(this.tableName).where('id', id);
    const intercepted = queryInterceptor.interceptSelect(query, options);
    const results = await intercepted.query;
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find records matching criteria for current tenant
   * 
   * @param criteria - Search criteria
   * @param options - Query interceptor options
   * @returns Array of records
   */
  public async findWhere(
    criteria: Record<string, any>,
    options: QueryInterceptorOptions = {}
  ): Promise<T[]> {
    let query = this.queryBuilder(this.tableName);
    
    // Apply criteria
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, value);
    });

    const intercepted = queryInterceptor.interceptSelect(query, options);
    return await intercepted.query;
  }

  /**
   * Create new record for current tenant
   * 
   * @param data - Record data
   * @param options - Query interceptor options
   * @returns Created record
   */
  public async create(
    data: Partial<T>,
    options: QueryInterceptorOptions = {}
  ): Promise<T> {
    const query = this.queryBuilder(this.tableName);
    const intercepted = queryInterceptor.interceptInsert(query, data, options);
    const results = await intercepted.query.returning('*');
    return results[0];
  }

  /**
   * Update record by ID for current tenant
   * 
   * @param id - Record ID
   * @param data - Updated data
   * @param options - Query interceptor options
   * @returns Updated record
   */
  public async update(
    id: string,
    data: Partial<T>,
    options: QueryInterceptorOptions = {}
  ): Promise<T> {
    const query = this.queryBuilder(this.tableName)
      .where('id', id)
      .update(data);
    
    const intercepted = queryInterceptor.interceptUpdate(query, options);
    const results = await intercepted.query.returning('*');
    
    if (results.length === 0) {
      throw new Error(`Record with ID ${id} not found or access denied`);
    }
    
    return results[0];
  }

  /**
   * Delete record by ID for current tenant
   * 
   * @param id - Record ID
   * @param options - Query interceptor options
   * @returns True if deleted
   */
  public async delete(
    id: string,
    options: QueryInterceptorOptions = {}
  ): Promise<boolean> {
    const query = this.queryBuilder(this.tableName).where('id', id).delete();
    const intercepted = queryInterceptor.interceptDelete(query, options);
    const deletedCount = await intercepted.query;
    return deletedCount > 0;
  }

  /**
   * Count records for current tenant
   * 
   * @param criteria - Optional search criteria
   * @param options - Query interceptor options
   * @returns Record count
   */
  public async count(
    criteria: Record<string, any> = {},
    options: QueryInterceptorOptions = {}
  ): Promise<number> {
    let query = this.queryBuilder(this.tableName).count('* as count');
    
    // Apply criteria
    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, value);
    });

    const intercepted = queryInterceptor.interceptSelect(query, options);
    const results = await intercepted.query;
    return parseInt(results[0].count, 10);
  }

  /**
   * Execute query with automatic tenant scoping
   * 
   * @param queryFn - Query function
   * @param options - Query interceptor options
   * @returns Query result
   */
  protected async executeQuery<R>(
    queryFn: (qb: any) => any,
    options: QueryInterceptorOptions = {}
  ): Promise<R> {
    const query = queryFn(this.queryBuilder(this.tableName));
    const intercepted = queryInterceptor.interceptSelect(query, options);
    return await intercepted.query;
  }
}

/**
 * Tenant-scoped transaction wrapper
 * 
 * Ensures tenant context is maintained within transactions
 */
export class TenantScopedTransaction {
  private tenantId: string;
  private transaction: any;

  constructor(transaction: any) {
    this.transaction = transaction;
    this.tenantId = tenantContextManager.getTenantId(true)!;
  }

  /**
   * Execute function within transaction with tenant context
   * 
   * @param fn - Function to execute
   * @returns Function result
   */
  public async execute<T>(fn: (trx: any) => Promise<T>): Promise<T> {
    return await tenantContextManager.runWithTenantContext(
      this.tenantId,
      async () => await fn(this.transaction)
    );
  }

  /**
   * Commit transaction
   */
  public async commit(): Promise<void> {
    await this.transaction.commit();
  }

  /**
   * Rollback transaction
   */
  public async rollback(): Promise<void> {
    await this.transaction.rollback();
  }
}

/**
 * Create tenant-scoped transaction
 * 
 * @param db - Database instance
 * @returns Tenant-scoped transaction
 */
export async function createTenantScopedTransaction(
  db: any
): Promise<TenantScopedTransaction> {
  const transaction = await db.transaction();
  return new TenantScopedTransaction(transaction);
}
