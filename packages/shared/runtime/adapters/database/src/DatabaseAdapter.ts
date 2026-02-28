/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * DatabaseAdapter — Main facade composing all internal components
 *
 * Issue: webwaka-runtime-universe#20 (P3-T03)
 */

import { IDatabasePort, ITransactionScope } from './ports/IDatabasePort';
import { IOfflineSyncPort } from './ports/IOfflineSyncPort';
import {
  BaseEntity,
  EntityType,
  CreateInput,
  UpdateInput,
} from './types/entities';
import {
  FindManyQuery,
  FindOneQuery,
  CountQuery,
  PaginatedResult,
} from './types/queries';
import { ExecutionContext, DatabaseHealthStatus } from './types/context';
import { DatabaseAdapterConfig } from './types/config';
import { DatabaseError, DatabaseErrorCode } from './types/errors';
import { TenantIsolator } from './core/TenantIsolator';
import { CircuitBreaker } from './core/CircuitBreaker';
import { HealthMonitor } from './core/HealthMonitor';
import { ConnectionPool } from './pool/ConnectionPool';
import { EngineDriverFactory } from './drivers/EngineDriverFactory';
import { ConfigLoader } from './config/ConfigLoader';
import { SyncEngine } from './sync/SyncEngine';
import { IConnection } from './ports/IConnectionPoolPort';
import { IEngineDriver } from './ports/IEngineDriver';

export class DatabaseAdapter implements IDatabasePort {
  private readonly config: DatabaseAdapterConfig;
  private readonly driver: IEngineDriver;
  private readonly pool: ConnectionPool;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly healthMonitor: HealthMonitor;
  private readonly syncEngine?: SyncEngine;
  private initialized: boolean = false;

  constructor(userConfig: Partial<DatabaseAdapterConfig>) {
    this.config = ConfigLoader.load(userConfig);
    this.driver = EngineDriverFactory.create(this.config.engine);
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.pool = new ConnectionPool(
      this.driver,
      this.config.pool,
      this.config.connection,
      this.circuitBreaker,
    );
    this.healthMonitor = new HealthMonitor(this.pool, this.driver);

    if (this.config.mode === 'offline' && this.config.sync) {
      this.syncEngine = new SyncEngine(
        this.config.sync.maxBatchSize,
        this.config.sync.conflictStrategy,
      );
    }
  }

  /**
   * Initialize the adapter — must be called before any operations.
   */
  async initialize(): Promise<void> {
    await this.pool.initialize();
    this.initialized = true;
  }

  /**
   * Gracefully shut down the adapter.
   */
  async shutdown(): Promise<void> {
    await this.pool.drain();
    this.initialized = false;
  }

  async findMany<T extends BaseEntity>(
    query: FindManyQuery<T>,
    context: ExecutionContext,
  ): Promise<PaginatedResult<T>> {
    this.ensureInitialized();
    const isolated = TenantIsolator.isolateFindMany(query, context);
    return this.withConnection(context, async (conn) => {
      const engineQuery = this.driver.compileQuery({
        table: '__dynamic__',
        operation: 'SELECT',
        where: isolated.where,
        orderBy: isolated.orderBy,
        limit: isolated.pagination?.type === 'offset' ? isolated.pagination.limit : (isolated.pagination?.limit || 50),
        offset: isolated.pagination?.type === 'offset' ? isolated.pagination.offset : 0,
      });
      const rows = await conn.execute<T>(engineQuery.sql, engineQuery.params);
      return {
        data: rows,
        total: rows.length,
        hasMore: rows.length === (isolated.pagination?.limit || 50),
      };
    });
  }

  async findById<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<T> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    return this.withConnection(context, async (conn) => {
      const engineQuery = this.driver.compileQuery({
        table: entityType.tableName,
        operation: 'SELECT',
        where: { id, tenant_id: context.tenantId, deleted_at: { isNull: true } },
        limit: 1,
      });
      const rows = await conn.execute<T>(engineQuery.sql, engineQuery.params);
      if (rows.length === 0) {
        throw new DatabaseError(
          DatabaseErrorCode.NOT_FOUND,
          `${entityType.name} with id ${id} not found`,
          undefined,
          { entityType: entityType.name, id },
        );
      }
      TenantIsolator.validateOwnership(rows[0], context);
      return rows[0];
    });
  }

  async findOne<T extends BaseEntity>(
    query: FindOneQuery<T>,
    context: ExecutionContext,
  ): Promise<T | null> {
    this.ensureInitialized();
    const isolated = TenantIsolator.isolateFindOne(query, context);
    return this.withConnection(context, async (conn) => {
      const engineQuery = this.driver.compileQuery({
        table: '__dynamic__',
        operation: 'SELECT',
        where: isolated.where,
        limit: 1,
      });
      const rows = await conn.execute<T>(engineQuery.sql, engineQuery.params);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  async create<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>,
    context: ExecutionContext,
  ): Promise<T> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    return this.withConnection(context, async (conn) => {
      const id = this.generateId();
      const now = new Date().toISOString();
      const fullData = {
        ...data,
        id,
        tenant_id: context.tenantId,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        version: 1,
        created_by: context.actorId,
        updated_by: context.actorId,
      };
      const engineQuery = this.driver.compileQuery({
        table: entityType.tableName,
        operation: 'INSERT',
        data: fullData,
      });
      const rows = await conn.execute<T>(engineQuery.sql, engineQuery.params);
      return rows[0] || (fullData as unknown as T);
    });
  }

  async createMany<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>[],
    context: ExecutionContext,
  ): Promise<T[]> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    // Execute as individual inserts within a transaction for atomicity
    return this.transaction(async (tx) => {
      const results: T[] = [];
      for (const item of data) {
        const result = await tx.create(entityType, item, context);
        results.push(result);
      }
      return results;
    }, context);
  }

  async update<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    data: UpdateInput<T>,
    context: ExecutionContext,
  ): Promise<T> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    return this.withConnection(context, async (conn) => {
      // Optimistic concurrency check
      const existing = await this.findById(entityType, id, context);
      if (existing.version !== data.version) {
        throw new DatabaseError(
          DatabaseErrorCode.CONCURRENT_MODIFICATION,
          `Version mismatch: expected ${data.version}, found ${existing.version}`,
          undefined,
          { entityType: entityType.name, id, expectedVersion: data.version, actualVersion: existing.version },
        );
      }

      const { version: _v, ...updateFields } = data;
      const updateData = {
        ...updateFields,
        updated_at: new Date().toISOString(),
        updated_by: context.actorId,
        version: existing.version + 1,
      };

      const engineQuery = this.driver.compileQuery({
        table: entityType.tableName,
        operation: 'UPDATE',
        data: updateData,
        where: { id, tenant_id: context.tenantId, version: existing.version },
      });
      await conn.execute(engineQuery.sql, engineQuery.params);

      return { ...existing, ...updateData } as T;
    });
  }

  async softDelete<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<void> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    await this.withConnection(context, async (conn) => {
      // Verify ownership first
      await this.findById(entityType, id, context);

      const engineQuery = this.driver.compileQuery({
        table: entityType.tableName,
        operation: 'DELETE',
        where: { id, tenant_id: context.tenantId },
      });
      await conn.execute(engineQuery.sql, engineQuery.params);
    });
  }

  async count<T extends BaseEntity>(
    query: CountQuery<T>,
    context: ExecutionContext,
  ): Promise<number> {
    this.ensureInitialized();
    const isolated = TenantIsolator.isolateCount(query, context);
    return this.withConnection(context, async (conn) => {
      const engineQuery = this.driver.compileQuery({
        table: '__dynamic__',
        operation: 'COUNT',
        where: isolated.where,
      });
      const rows = await conn.execute<{ count: number }>(engineQuery.sql, engineQuery.params);
      return rows[0]?.count || 0;
    });
  }

  async transaction<R>(
    fn: (tx: ITransactionScope) => Promise<R>,
    context: ExecutionContext,
  ): Promise<R> {
    this.ensureInitialized();
    TenantIsolator.validateContext(context);
    return this.withConnection(context, async (conn) => {
      await conn.execute('BEGIN', []);
      try {
        const txScope: ITransactionScope = {
          findMany: (q, c) => this.findMany(q, c),
          findById: (et, id, c) => this.findById(et, id, c),
          create: (et, d, c) => this.create(et, d, c),
          createMany: (et, d, c) => this.createMany(et, d, c),
          update: (et, id, d, c) => this.update(et, id, d, c),
          softDelete: (et, id, c) => this.softDelete(et, id, c),
        };
        const result = await fn(txScope);
        await conn.execute('COMMIT', []);
        return result;
      } catch (error) {
        await conn.execute('ROLLBACK', []);
        throw error;
      }
    });
  }

  async healthCheck(): Promise<DatabaseHealthStatus> {
    return this.healthMonitor.check();
  }

  /**
   * Get the sync engine (only available in offline mode).
   */
  getSyncEngine(): IOfflineSyncPort | undefined {
    return this.syncEngine;
  }

  private async withConnection<R>(
    context: ExecutionContext,
    fn: (conn: IConnection) => Promise<R>,
  ): Promise<R> {
    const conn = await this.circuitBreaker.execute(() => this.pool.acquire(context));
    try {
      return await fn(conn);
    } finally {
      await this.pool.release(conn);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new DatabaseError(
        DatabaseErrorCode.VALIDATION_ERROR,
        'DatabaseAdapter is not initialized. Call initialize() first.',
      );
    }
  }

  private generateId(): string {
    // UUIDv4-like generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
