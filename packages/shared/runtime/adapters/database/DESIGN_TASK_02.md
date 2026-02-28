# RUNTIME-ADAPTER-DATABASE-v0.1.0 — Design Task 02

**Acting under Canonical Role: Release Management Agent (webwakaagent6)**
**Issue Reference:** webwaka-runtime-universe#11
**Phase:** P1 — Design
**Task:** T02 — Interface Contracts and Type System Design
**Date:** 2026-02-26

---

## 1. Purpose

This document defines the complete TypeScript interface contracts and type system for the Database Adapter. Every public-facing type, generic constraint, and method signature is specified here to ensure type safety across all consumers.

---

## 2. Core Port Interfaces

### 2.1 IDatabasePort — Primary Database Contract

```typescript
/**
 * Primary database port interface.
 * All capability layers interact with the database exclusively through this port.
 * Engine-specific behavior is hidden behind this contract.
 */
interface IDatabasePort {
  /**
   * Execute a read query and return typed results.
   * @param query - Abstract query object (never raw SQL)
   * @param context - Tenant and correlation context
   * @returns Array of typed results
   */
  findMany<T extends BaseEntity>(
    query: FindManyQuery<T>,
    context: ExecutionContext,
  ): Promise<PaginatedResult<T>>;

  /**
   * Find a single entity by ID.
   * @throws NOT_FOUND if entity does not exist
   */
  findById<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<T>;

  /**
   * Find a single entity matching criteria, or null.
   */
  findOne<T extends BaseEntity>(
    query: FindOneQuery<T>,
    context: ExecutionContext,
  ): Promise<T | null>;

  /**
   * Insert a new entity.
   * @returns The created entity with generated fields (id, created_at, etc.)
   */
  create<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>,
    context: ExecutionContext,
  ): Promise<T>;

  /**
   * Insert multiple entities in a single batch operation.
   * @returns Array of created entities
   */
  createMany<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>[],
    context: ExecutionContext,
  ): Promise<T[]>;

  /**
   * Update an existing entity by ID.
   * Uses optimistic concurrency control (version check).
   * @throws CONCURRENT_MODIFICATION if version mismatch
   */
  update<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    data: UpdateInput<T>,
    context: ExecutionContext,
  ): Promise<T>;

  /**
   * Soft-delete an entity by setting deleted_at.
   * Never performs hard delete.
   */
  softDelete<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<void>;

  /**
   * Execute a counted query (for pagination metadata).
   */
  count<T extends BaseEntity>(
    query: CountQuery<T>,
    context: ExecutionContext,
  ): Promise<number>;

  /**
   * Execute operations within a transaction.
   * Automatically rolls back on error.
   */
  transaction<R>(
    fn: (tx: ITransactionScope) => Promise<R>,
    context: ExecutionContext,
  ): Promise<R>;

  /**
   * Check database health.
   */
  healthCheck(): Promise<DatabaseHealthStatus>;
}
```

### 2.2 IOfflineSyncPort — Offline Synchronization Contract

```typescript
/**
 * Offline sync port for managing local-remote data synchronization.
 * Used exclusively in offline-first mode (SQLite).
 */
interface IOfflineSyncPort {
  /**
   * Queue a local change for sync to remote.
   */
  queueChange(change: SyncChange): Promise<void>;

  /**
   * Get all pending changes ordered by priority.
   */
  getPendingChanges(limit?: number): Promise<SyncChange[]>;

  /**
   * Execute a sync cycle: push local changes, pull remote changes.
   * @returns Sync result with statistics
   */
  sync(context: ExecutionContext): Promise<SyncResult>;

  /**
   * Resolve a sync conflict.
   */
  resolveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution,
  ): Promise<void>;

  /**
   * Get current sync status.
   */
  getSyncStatus(): Promise<SyncStatus>;

  /**
   * Force a full re-sync from remote.
   * Used when local state is corrupted or after extended offline period.
   */
  fullResync(context: ExecutionContext): Promise<SyncResult>;
}
```

### 2.3 IConnectionPoolPort — Connection Lifecycle Contract

```typescript
/**
 * Connection pool management port.
 * Handles connection acquisition, release, and health monitoring.
 */
interface IConnectionPoolPort {
  /**
   * Acquire a connection from the pool.
   * Blocks until a connection is available or timeout.
   * @throws POOL_EXHAUSTED if timeout exceeded
   */
  acquire(context: ExecutionContext): Promise<IConnection>;

  /**
   * Release a connection back to the pool.
   */
  release(connection: IConnection): Promise<void>;

  /**
   * Get current pool statistics.
   */
  getStats(): PoolStats;

  /**
   * Gracefully drain the pool (for shutdown).
   */
  drain(): Promise<void>;

  /**
   * Destroy the pool and all connections.
   */
  destroy(): Promise<void>;
}
```

---

## 3. Entity Type System

### 3.1 Base Entity

```typescript
/**
 * All database entities extend this base.
 * System columns are automatically managed by the adapter.
 */
interface BaseEntity {
  readonly id: string;
  readonly tenant_id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
  readonly version: number;
  readonly created_by: string;
  readonly updated_by: string;
}

/**
 * Entity type descriptor — used for runtime type information.
 */
interface EntityType<T extends BaseEntity> {
  readonly name: string;
  readonly tableName: string;
  readonly schema: EntitySchema<T>;
}

/**
 * Schema definition for compile-time and runtime validation.
 */
type EntitySchema<T extends BaseEntity> = {
  [K in keyof Omit<T, keyof BaseEntity>]: FieldDefinition;
};

interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'json' | 'decimal' | 'timestamp';
  nullable: boolean;
  indexed: boolean;
  unique: boolean;
  maxLength?: number;
  precision?: [number, number];  // For decimal: [total, scale]
}
```

### 3.2 Input Types (Create/Update)

```typescript
/**
 * Input type for creating entities.
 * Excludes system-managed fields.
 */
type CreateInput<T extends BaseEntity> = Omit<
  T,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'created_by' | 'updated_by'
>;

/**
 * Input type for updating entities.
 * All fields optional except version (for optimistic concurrency).
 */
type UpdateInput<T extends BaseEntity> = Partial<CreateInput<T>> & {
  version: number;
};
```

### 3.3 Query Types

```typescript
/**
 * Abstract query for finding multiple entities.
 */
interface FindManyQuery<T extends BaseEntity> {
  where?: WhereClause<T>;
  orderBy?: OrderByClause<T>[];
  pagination?: PaginationInput;
  include?: IncludeClause;
}

/**
 * Type-safe where clause using field names from entity.
 */
type WhereClause<T extends BaseEntity> = {
  [K in keyof T]?: FieldFilter<T[K]>;
} & {
  AND?: WhereClause<T>[];
  OR?: WhereClause<T>[];
  NOT?: WhereClause<T>;
};

/**
 * Filter operators for a single field.
 */
type FieldFilter<V> =
  | V                                    // equals
  | { eq: V }
  | { neq: V }
  | { gt: V }
  | { gte: V }
  | { lt: V }
  | { lte: V }
  | { in: V[] }
  | { notIn: V[] }
  | { contains: string }                 // string only
  | { startsWith: string }               // string only
  | { isNull: boolean };

/**
 * Order by clause.
 */
interface OrderByClause<T extends BaseEntity> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Pagination input — cursor-based preferred for performance.
 */
type PaginationInput =
  | { type: 'cursor'; cursor?: string; limit: number }
  | { type: 'offset'; offset: number; limit: number };

/**
 * Paginated result with metadata.
 */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

---

## 4. Context Types

```typescript
/**
 * Execution context passed to every database operation.
 * Provides tenant isolation and audit trail.
 */
interface ExecutionContext {
  /** Tenant identifier — MANDATORY */
  tenantId: string;

  /** Correlation ID for distributed tracing */
  correlationId: string;

  /** Acting user or agent ID */
  actorId: string;

  /** Actor type */
  actorType: 'user' | 'agent' | 'system';

  /** Request timestamp */
  timestamp: string;
}

/**
 * Transaction scope — subset of IDatabasePort available within transactions.
 */
interface ITransactionScope {
  findMany<T extends BaseEntity>(query: FindManyQuery<T>, context: ExecutionContext): Promise<PaginatedResult<T>>;
  findById<T extends BaseEntity>(entityType: EntityType<T>, id: string, context: ExecutionContext): Promise<T>;
  create<T extends BaseEntity>(entityType: EntityType<T>, data: CreateInput<T>, context: ExecutionContext): Promise<T>;
  createMany<T extends BaseEntity>(entityType: EntityType<T>, data: CreateInput<T>[], context: ExecutionContext): Promise<T[]>;
  update<T extends BaseEntity>(entityType: EntityType<T>, id: string, data: UpdateInput<T>, context: ExecutionContext): Promise<T>;
  softDelete<T extends BaseEntity>(entityType: EntityType<T>, id: string, context: ExecutionContext): Promise<void>;
}
```

---

## 5. Sync Types

```typescript
interface SyncChange {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  priority: number;  // Higher = sync first
}

interface SyncConflict {
  localChange: SyncChange;
  remoteVersion: Record<string, unknown>;
  conflictType: 'UPDATE_UPDATE' | 'UPDATE_DELETE' | 'DELETE_UPDATE';
}

type ConflictResolution =
  | { strategy: 'local_wins' }
  | { strategy: 'remote_wins' }
  | { strategy: 'merge'; mergedData: Record<string, unknown> };

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  resolved: number;
  failed: number;
  duration_ms: number;
}

interface SyncStatus {
  pendingChanges: number;
  lastSyncAt: string | null;
  syncHealthy: boolean;
  consecutiveFailures: number;
}
```

---

## 6. Acceptance Criteria

- [ ] IDatabasePort with all CRUD, transaction, and health methods
- [ ] IOfflineSyncPort with queue, sync, conflict resolution methods
- [ ] IConnectionPoolPort with acquire, release, drain methods
- [ ] BaseEntity with all system columns
- [ ] Type-safe query system (WhereClause, FieldFilter, OrderBy, Pagination)
- [ ] CreateInput/UpdateInput utility types
- [ ] ExecutionContext with tenant isolation
- [ ] Sync types (SyncChange, SyncConflict, ConflictResolution, SyncResult)
- [ ] All types use generics for compile-time safety

---

## 7. Constitutional Compliance

All 8 doctrines verified ✅ — Type system is engine-agnostic, supports offline mode, and enforces tenant isolation at the type level.

---

**End of Design Task 02**
**Authored by:** webwakaagent6
**Issue:** webwaka-runtime-universe#11
