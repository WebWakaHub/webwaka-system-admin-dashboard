# RUNTIME-ADAPTER-DATABASE-v0.1.0 — Design Task 01

**Acting under Canonical Role: Release Management Agent (webwakaagent6)**
**Issue Reference:** webwaka-runtime-universe#10
**Phase:** P1 — Design
**Task:** T01 — Architecture Design Document
**Date:** 2026-02-26

---

## 1. Purpose

This document defines the architectural design of the Database Adapter, translating the P0 Specification into concrete architectural decisions, component diagrams, and interaction patterns. This is the first of three P1 Design tasks.

---

## 2. Architectural Overview

### 2.1 Hexagonal Architecture (Ports & Adapters)

The Database Adapter follows the Hexagonal Architecture pattern, placing the domain logic at the center with ports defining the contract and adapters implementing engine-specific behavior.

```
┌─────────────────────────────────────────────────────┐
│                  Capability Layer                     │
│        (Cells, Tissues, Organs, Systems)             │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│              DATABASE PORT (Interface)                │
│  IDatabasePort  IOfflineSyncPort  IConnectionPoolPort│
└──────────────────────┬──────────────────────────────┘
                       │ implemented by
┌──────────────────────▼──────────────────────────────┐
│            ADAPTER CORE (Engine-Agnostic)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Query    │ │ Tenant   │ │ Migration            │ │
│  │ Builder  │ │ Isolator │ │ Runner               │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Error    │ │ Health   │ │ Sync                 │ │
│  │ Mapper   │ │ Monitor  │ │ Engine               │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ delegates to
┌──────────────────────▼──────────────────────────────┐
│            ENGINE DRIVERS (Engine-Specific)           │
│  ┌────────────┐ ┌────────┐ ┌───────┐ ┌──────────┐  │
│  │ PostgreSQL │ │ SQLite │ │ MySQL │ │ TiDB     │  │
│  │ Driver     │ │ Driver │ │ Driver│ │ Driver   │  │
│  └────────────┘ └────────┘ └───────┘ └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

| Component | Responsibility | Dependencies |
|:---|:---|:---|
| **IDatabasePort** | Contract for all database operations (CRUD, transactions, bulk) | None (pure interface) |
| **IOfflineSyncPort** | Contract for offline sync operations | IDatabasePort |
| **IConnectionPoolPort** | Contract for connection lifecycle management | None (pure interface) |
| **Query Builder** | Constructs engine-agnostic queries from abstract query objects | None |
| **Tenant Isolator** | Enforces tenant boundary on every operation | Query Builder |
| **Migration Runner** | Applies schema migrations across tenants | Tenant Isolator |
| **Error Mapper** | Translates engine errors to canonical DatabaseError types | None |
| **Health Monitor** | Produces DatabaseHealthStatus from pool and latency checks | Connection Pool |
| **Sync Engine** | Manages offline queue, conflict resolution, and sync cycles | IDatabasePort, IOfflineSyncPort |
| **Engine Drivers** | Engine-specific SQL generation, connection handling, type mapping | Error Mapper |

---

## 3. Design Patterns

### 3.1 Strategy Pattern — Engine Selection

```typescript
interface IEngineDriver {
  readonly engineName: string;
  connect(config: ConnectionConfig): Promise<IConnection>;
  buildQuery(abstract: AbstractQuery): EngineQuery;
  mapError(engineError: unknown): DatabaseError;
  healthCheck(connection: IConnection): Promise<HealthResult>;
}

class DatabaseAdapter implements IDatabasePort {
  private driver: IEngineDriver;

  constructor(config: DatabaseConfig) {
    this.driver = EngineDriverFactory.create(config.engine);
  }
}
```

**Engine selection is determined at startup** from configuration. The adapter NEVER changes engines at runtime for a given deployment.

### 3.2 Decorator Pattern — Tenant Isolation

Every query passes through the TenantIsolationDecorator before reaching the engine driver:

```typescript
class TenantIsolationDecorator implements IDatabasePort {
  constructor(private inner: IDatabasePort) {}

  async query<T>(query: AbstractQuery, context: TenantContext): Promise<T[]> {
    // 1. Validate tenant_id is present
    this.validateTenantContext(context);

    // 2. Inject tenant predicate into query
    const isolatedQuery = this.injectTenantPredicate(query, context.tenantId);

    // 3. Set connection search_path (PostgreSQL) or validate file (SQLite)
    await this.setTenantScope(context);

    // 4. Delegate to inner adapter
    return this.inner.query(isolatedQuery, context);
  }
}
```

### 3.3 Circuit Breaker Pattern — Connection Resilience

```typescript
interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;     // Default: 5

  /** Time in ms before attempting to half-open */
  resetTimeout: number;         // Default: 30000 (30s)

  /** Number of successful calls to close circuit */
  successThreshold: number;     // Default: 3

  /** Nigeria-First: higher thresholds for intermittent networks */
  nigeriaMode: {
    failureThreshold: number;   // Default: 10
    resetTimeout: number;       // Default: 60000 (60s)
  };
}
```

States: **CLOSED** (normal) → **OPEN** (all calls fail fast) → **HALF-OPEN** (test calls) → **CLOSED**

### 3.4 Unit of Work Pattern — Transaction Management

```typescript
interface IUnitOfWork {
  /** Begin a new transaction */
  begin(): Promise<void>;

  /** Commit all changes */
  commit(): Promise<void>;

  /** Rollback all changes */
  rollback(): Promise<void>;

  /** Register an entity for insert */
  registerNew<T>(entity: T): void;

  /** Register an entity for update */
  registerDirty<T>(entity: T): void;

  /** Register an entity for deletion (soft delete) */
  registerDeleted<T>(entity: T): void;
}
```

---

## 4. Data Flow Diagrams

### 4.1 Online Query Flow

```
Client Request
    │
    ▼
[TenantContext Extraction]
    │
    ▼
[Query Validation] ──── REJECT if no tenant_id
    │
    ▼
[Tenant Isolation Decorator]
    │ inject tenant_id predicate
    ▼
[Query Builder] ──── build engine-specific SQL
    │
    ▼
[Connection Pool] ──── acquire connection
    │
    ▼
[Engine Driver] ──── execute query
    │
    ├── SUCCESS ──► [Result Mapper] ──► Return typed result
    │
    └── FAILURE ──► [Error Mapper] ──► [Retry Policy]
                                          │
                                          ├── RETRY ──► back to Engine Driver
                                          │
                                          └── FAIL ──► Return DatabaseError
```

### 4.2 Offline Sync Flow

```
[Local SQLite] ──── modified records
    │
    ▼
[Change Detector] ──── compare version vectors
    │
    ▼
[Sync Queue] ──── prioritize (financial > analytics)
    │
    ▼
[Connectivity Check] ──── is online?
    │
    ├── NO ──► queue and wait
    │
    └── YES ──► [Batch Uploader]
                    │
                    ▼
                [Remote Database]
                    │
                    ├── SUCCESS ──► mark synced, update cursor
                    │
                    └── CONFLICT ──► [Conflict Resolver]
                                        │
                                        ├── LWW (Last Writer Wins) for non-critical
                                        │
                                        └── Vector Clock merge for financial data
```

---

## 5. Connection Pool Design

### 5.1 Pool Configuration

```typescript
interface PoolConfig {
  /** Minimum idle connections */
  minConnections: number;        // Default: 2

  /** Maximum total connections */
  maxConnections: number;        // Default: 20

  /** Max time to wait for connection (ms) */
  acquireTimeout: number;        // Default: 10000

  /** Max connection idle time before eviction (ms) */
  idleTimeout: number;           // Default: 300000 (5min)

  /** Max connection lifetime (ms) */
  maxLifetime: number;           // Default: 1800000 (30min)

  /** Validation query interval (ms) */
  validationInterval: number;    // Default: 30000

  /** Nigeria-First: lower pool for resource-constrained environments */
  resourceConstrainedMode: {
    minConnections: 1;
    maxConnections: 5;
    idleTimeout: 60000;
  };
}
```

### 5.2 Per-Tenant Pool Isolation

In SaaS multi-tenant mode, each tenant gets a **logical pool** within the physical pool:

```typescript
interface TenantPoolConfig {
  /** Max connections per tenant (prevents noisy neighbor) */
  maxConnectionsPerTenant: number;  // Default: 5

  /** Priority tenants get higher allocation */
  priorityTenants: string[];

  /** Burst allowance for temporary spikes */
  burstAllowance: number;           // Default: 2 extra connections
}
```

---

## 6. Module Dependency Graph

```
IDatabasePort ◄─── DatabaseAdapter
                        │
                        ├── TenantIsolationDecorator
                        │       └── QueryValidator
                        │
                        ├── QueryBuilder
                        │       └── EngineQueryCompiler
                        │
                        ├── ConnectionPool
                        │       ├── CircuitBreaker
                        │       └── HealthMonitor
                        │
                        ├── ErrorMapper
                        │       └── EngineErrorRegistry
                        │
                        └── EngineDriverFactory
                                ├── PostgreSQLDriver
                                ├── SQLiteDriver
                                ├── MySQLDriver
                                └── TiDBDriver

IOfflineSyncPort ◄─── SyncEngine
                          ├── ChangeDetector
                          ├── ConflictResolver
                          ├── SyncQueue
                          └── BatchUploader
```

---

## 7. Acceptance Criteria

- [ ] Hexagonal architecture with clear port/adapter separation documented
- [ ] All 6 core components with responsibilities and dependencies defined
- [ ] 4 design patterns (Strategy, Decorator, Circuit Breaker, Unit of Work) specified
- [ ] Online query flow diagram with tenant isolation
- [ ] Offline sync flow diagram with conflict resolution
- [ ] Connection pool design with per-tenant isolation
- [ ] Module dependency graph showing all components
- [ ] Nigeria-First adjustments in circuit breaker and pool config

---

## 8. Constitutional Compliance

| Doctrine | Compliance | Evidence |
|:---|:---|:---|
| Build Once, Use Infinitely | ✅ | Strategy pattern allows single codebase for all engines |
| Mobile First | ✅ | SQLite driver for mobile, resource-constrained pool config |
| PWA First | ✅ | Same architecture works in browser via sql.js driver |
| Offline First | ✅ | Full sync engine with change detection and conflict resolution |
| Nigeria First | ✅ | Circuit breaker Nigeria mode, resource-constrained pool, higher timeouts |
| Africa First | ✅ | Batch sync for intermittent connectivity, priority-based queue |
| AI Vendor Neutrality | ✅ | No AI dependencies in architecture |
| Infrastructure Neutrality | ✅ | Engine driver factory abstracts all infrastructure |

---

**End of Design Task 01**
**Authored by:** webwakaagent6
**Issue:** webwaka-runtime-universe#10
