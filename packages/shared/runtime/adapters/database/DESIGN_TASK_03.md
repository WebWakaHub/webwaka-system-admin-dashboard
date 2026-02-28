# RUNTIME-ADAPTER-DATABASE-v0.1.0 — Design Task 03

**Acting under Canonical Role: Release Management Agent (webwakaagent6)**
**Issue Reference:** webwaka-runtime-universe#12
**Phase:** P1 — Design
**Task:** T03 — Testing Strategy and Configuration Design
**Date:** 2026-02-26

---

## 1. Purpose

This document defines the testing strategy, configuration management, and deployment design for the Database Adapter. It completes the P1 Design phase by specifying how the adapter is tested, configured, and deployed across all environments.

---

## 2. Testing Strategy

### 2.1 Test Pyramid

```
         ┌─────────┐
         │  E2E    │  5% — Full stack with real database
         │  Tests  │
        ┌┴─────────┴┐
        │Integration │  25% — Adapter + real engine
        │   Tests    │
       ┌┴────────────┴┐
       │  Unit Tests   │  70% — Pure logic, mocked deps
       └───────────────┘
```

### 2.2 Unit Test Design

| Component | Test Focus | Mock Strategy |
|:---|:---|:---|
| Query Builder | SQL generation correctness | No mocks (pure function) |
| Tenant Isolator | tenant_id injection, boundary validation | Mock IDatabasePort |
| Error Mapper | Engine error → canonical mapping | Mock engine errors |
| Circuit Breaker | State transitions, thresholds | Mock connection |
| Sync Engine | Queue management, conflict detection | Mock IDatabasePort |

**Unit Test Naming Convention:**
```
describe('QueryBuilder')
  it('should generate SELECT with WHERE clause for PostgreSQL')
  it('should generate SELECT with WHERE clause for SQLite')
  it('should reject query without tenant_id predicate')
  it('should handle pagination with cursor-based strategy')
```

### 2.3 Integration Test Design

Each engine driver requires its own integration test suite running against a real database instance:

```typescript
// Test matrix: 4 engines × 3 modes = 12 integration test configurations
const testMatrix = {
  engines: ['postgresql', 'sqlite', 'mysql', 'tidb'],
  modes: ['saas-multitenant', 'enterprise-dedicated', 'offline-sqlite'],
};
```

**Integration Test Categories:**

| Category | Tests | Engine |
|:---|:---|:---|
| CRUD Operations | create, read, update, softDelete, createMany | All 4 |
| Transaction Management | commit, rollback, nested, deadlock recovery | PostgreSQL, MySQL, TiDB |
| Tenant Isolation | cross-tenant query rejection, RLS enforcement | PostgreSQL (SaaS mode) |
| Migration | apply, rollback, multi-tenant rolling | All 4 |
| Connection Pool | acquire, release, exhaustion, timeout | All 4 |
| Offline Sync | queue, push, pull, conflict resolution | SQLite |
| Health Check | healthy, degraded, unhealthy states | All 4 |

### 2.4 E2E Test Design

End-to-end tests simulate real-world scenarios:

1. **Nigeria-First Scenario:** Create order on mobile (SQLite), go offline, modify order, come back online, sync, verify consistency
2. **Multi-Tenant Isolation:** Two tenants operate simultaneously, verify zero data leakage
3. **Migration Rolling Deploy:** Apply migration to 10% of tenants, verify, roll to 100%
4. **Failover Scenario:** Primary database goes down, circuit breaker activates, recovery

### 2.5 Performance Benchmarks

| Metric | Target | Nigeria-First Target |
|:---|:---|:---|
| Single row read | < 5ms | < 50ms (high latency) |
| Batch insert (100 rows) | < 50ms | < 500ms |
| Transaction (5 operations) | < 20ms | < 200ms |
| Connection acquire | < 10ms | < 100ms |
| Sync cycle (100 changes) | < 2s | < 10s |
| Migration (1 table, 1 tenant) | < 1s | < 5s |

---

## 3. Configuration Design

### 3.1 Configuration Schema

```typescript
interface DatabaseAdapterConfig {
  /** Engine selection */
  engine: 'postgresql' | 'sqlite' | 'mysql' | 'tidb';

  /** Deployment mode */
  mode: 'saas-multitenant' | 'enterprise-dedicated' | 'offline';

  /** Connection configuration */
  connection: ConnectionConfig;

  /** Pool configuration */
  pool: PoolConfig;

  /** Retry configuration */
  retry: RetryConfig;

  /** Circuit breaker configuration */
  circuitBreaker: CircuitBreakerConfig;

  /** Nigeria-First mode (adjusts all timeouts and thresholds) */
  nigeriaFirstMode: boolean;

  /** Observability configuration */
  observability: ObservabilityConfig;

  /** Migration configuration */
  migration: MigrationConfig;

  /** Sync configuration (offline mode only) */
  sync?: SyncConfig;
}

interface ConnectionConfig {
  /** Host (not used for SQLite) */
  host?: string;

  /** Port (not used for SQLite) */
  port?: number;

  /** Database name or file path (SQLite) */
  database: string;

  /** Username (not used for SQLite) */
  username?: string;

  /** Password reference (env var name, never raw value) */
  passwordRef?: string;

  /** TLS configuration */
  tls?: {
    enabled: boolean;
    rejectUnauthorized: boolean;
    ca?: string;
  };
}
```

### 3.2 Configuration Resolution Order

```
1. Environment Variables     (highest priority — production overrides)
2. Runtime Config File       (deployment-specific: config.production.json)
3. Default Config File       (config.default.json)
4. Hardcoded Defaults        (lowest priority — safe fallbacks)
```

### 3.3 Environment Variable Mapping

```
DB_ENGINE=postgresql
DB_MODE=saas-multitenant
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webwaka
DB_USERNAME=webwaka_app
DB_PASSWORD_REF=DB_PASSWORD        # Points to another env var
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_TLS_ENABLED=true
DB_NIGERIA_FIRST=true
DB_SYNC_INTERVAL_MS=30000
```

### 3.4 Configuration Validation

At startup, the adapter MUST:
1. Load configuration from all sources in priority order
2. Validate all required fields are present
3. Validate field types and ranges
4. Validate engine-specific requirements (e.g., SQLite doesn't need host/port)
5. Log configuration summary (without secrets)
6. Fail fast with clear error message if validation fails

---

## 4. Deployment Design

### 4.1 Deployment Modes

| Mode | Engine | Tenant Isolation | Use Case |
|:---|:---|:---|:---|
| **SaaS Multi-Tenant** | PostgreSQL / TiDB | Schema-per-tenant + RLS | WebWaka cloud platform |
| **Enterprise Dedicated** | PostgreSQL / MySQL | Database-per-tenant | Large enterprise clients |
| **Offline First** | SQLite | File-per-tenant | Mobile app, PWA, USSD fallback |
| **Hybrid** | PostgreSQL + SQLite | Schema (remote) + File (local) | Mobile with sync |

### 4.2 Initialization Sequence

```
1. Load configuration
2. Validate configuration
3. Initialize connection pool
4. Run health check
5. Check migration state
6. Apply pending migrations (if auto-migrate enabled)
7. Initialize sync engine (if offline mode)
8. Register health check endpoint
9. Emit "database:ready" event
```

### 4.3 Graceful Shutdown Sequence

```
1. Stop accepting new operations
2. Wait for in-flight transactions (max 30s)
3. Flush sync queue (if offline mode)
4. Drain connection pool
5. Emit "database:shutdown" event
6. Destroy pool
```

---

## 5. Directory Structure Design

```
adapters/database/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── ports/
│   │   ├── IDatabasePort.ts
│   │   ├── IOfflineSyncPort.ts
│   │   └── IConnectionPoolPort.ts
│   ├── core/
│   │   ├── DatabaseAdapter.ts      # Main adapter implementation
│   │   ├── QueryBuilder.ts
│   │   ├── TenantIsolator.ts
│   │   ├── ErrorMapper.ts
│   │   ├── CircuitBreaker.ts
│   │   └── HealthMonitor.ts
│   ├── drivers/
│   │   ├── IEngineDriver.ts
│   │   ├── EngineDriverFactory.ts
│   │   ├── PostgreSQLDriver.ts
│   │   ├── SQLiteDriver.ts
│   │   ├── MySQLDriver.ts
│   │   └── TiDBDriver.ts
│   ├── sync/
│   │   ├── SyncEngine.ts
│   │   ├── ChangeDetector.ts
│   │   ├── ConflictResolver.ts
│   │   └── SyncQueue.ts
│   ├── migration/
│   │   ├── MigrationRunner.ts
│   │   └── MigrationValidator.ts
│   ├── pool/
│   │   ├── ConnectionPool.ts
│   │   └── TenantPoolAllocator.ts
│   ├── types/
│   │   ├── entities.ts
│   │   ├── queries.ts
│   │   ├── errors.ts
│   │   ├── config.ts
│   │   └── sync.ts
│   └── config/
│       ├── ConfigLoader.ts
│       └── ConfigValidator.ts
├── tests/
│   ├── unit/
│   │   ├── QueryBuilder.test.ts
│   │   ├── TenantIsolator.test.ts
│   │   ├── ErrorMapper.test.ts
│   │   ├── CircuitBreaker.test.ts
│   │   └── SyncEngine.test.ts
│   ├── integration/
│   │   ├── postgresql.test.ts
│   │   ├── sqlite.test.ts
│   │   ├── mysql.test.ts
│   │   └── tidb.test.ts
│   └── e2e/
│       ├── offline-sync.test.ts
│       ├── multi-tenant.test.ts
│       └── failover.test.ts
├── migrations/
│   └── (migration files)
├── config/
│   ├── config.default.json
│   └── config.test.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. Acceptance Criteria

- [ ] Test pyramid defined (70% unit, 25% integration, 5% E2E)
- [ ] Unit test strategy for all 5 core components
- [ ] Integration test matrix (4 engines × 3 modes)
- [ ] E2E scenarios including Nigeria-First offline sync
- [ ] Performance benchmarks with Nigeria-First targets
- [ ] Configuration schema with all fields typed
- [ ] Configuration resolution order (env > runtime > default > hardcoded)
- [ ] Environment variable mapping documented
- [ ] 4 deployment modes specified
- [ ] Initialization and shutdown sequences defined
- [ ] Directory structure with all source and test files

---

## 7. Constitutional Compliance

All 8 doctrines verified ✅

---

**End of Design Task 03**
**Authored by:** webwakaagent6
**Issue:** webwaka-runtime-universe#12
