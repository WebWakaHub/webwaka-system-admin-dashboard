# RUNTIME-ADAPTER-DATABASE-v0.1.0 — Specification Task 03

**Acting under Canonical Role: Release Management Agent (webwakaagent6)**
**Issue Reference:** webwaka-runtime-universe#5
**Phase:** P0 — Specification
**Task:** T03 — Error Handling, Observability & Security Specification
**Date:** 2026-02-26

---

## 1. Purpose

This document completes the P0 Specification phase by defining the error handling model, observability integration, and security requirements for the Database Adapter. Building on T01 (port interfaces) and T02 (data model & schema isolation), this task specifies HOW the adapter handles failures, reports its health, and enforces security boundaries.

---

## 2. Error Handling Model

### 2.1 Error Classification

All database errors are classified into canonical error types. The adapter MUST translate engine-specific errors into these abstract types so that capability layers never see engine-specific error codes.

```typescript
/**
 * Canonical Database Error Types
 * 
 * All engine-specific errors MUST be mapped to one of these types.
 * Capability layers interact ONLY with these abstract error types.
 */
enum DatabaseErrorType {
  /** Connection to database failed or was lost */
  CONNECTION_FAILED = 'CONNECTION_FAILED',

  /** Connection pool exhausted — no available connections */
  POOL_EXHAUSTED = 'POOL_EXHAUSTED',

  /** Query timed out */
  QUERY_TIMEOUT = 'QUERY_TIMEOUT',

  /** Unique constraint violation */
  DUPLICATE_KEY = 'DUPLICATE_KEY',

  /** Foreign key constraint violation */
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',

  /** Check constraint violation */
  CHECK_VIOLATION = 'CHECK_VIOLATION',

  /** Row was modified by another transaction (optimistic lock failure) */
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',

  /** Requested record not found */
  NOT_FOUND = 'NOT_FOUND',

  /** Transaction deadlock detected */
  DEADLOCK = 'DEADLOCK',

  /** Schema migration failure */
  MIGRATION_FAILED = 'MIGRATION_FAILED',

  /** Tenant isolation boundary violated */
  TENANT_ISOLATION_BREACH = 'TENANT_ISOLATION_BREACH',

  /** Sync conflict between local and remote */
  SYNC_CONFLICT = 'SYNC_CONFLICT',

  /** Database is in read-only mode */
  READ_ONLY = 'READ_ONLY',

  /** Unclassified database error */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### 2.2 Error Response Structure

```typescript
interface DatabaseError {
  /** Canonical error type */
  type: DatabaseErrorType;

  /** Human-readable error message (never engine-specific) */
  message: string;

  /** Correlation ID for tracing */
  correlation_id: string;

  /** Tenant context where error occurred */
  tenant_id: string;

  /** Whether the operation can be safely retried */
  retryable: boolean;

  /** Suggested retry delay in milliseconds (if retryable) */
  retry_after_ms?: number;

  /** Original engine error code (for debug logging only, never exposed to capability layers) */
  _engine_error_code?: string;
}
```

### 2.3 Engine Error Mapping

| PostgreSQL Code | SQLite Code | MySQL Code | Canonical Type |
|:---|:---|:---|:---|
| `23505` | `SQLITE_CONSTRAINT_UNIQUE` | `1062` | `DUPLICATE_KEY` |
| `23503` | `SQLITE_CONSTRAINT_FOREIGNKEY` | `1452` | `FOREIGN_KEY_VIOLATION` |
| `23514` | `SQLITE_CONSTRAINT_CHECK` | `3819` | `CHECK_VIOLATION` |
| `40P01` | N/A | `1213` | `DEADLOCK` |
| `57014` | `SQLITE_INTERRUPT` | `1317` | `QUERY_TIMEOUT` |
| `08006` | `SQLITE_CANTOPEN` | `2003` | `CONNECTION_FAILED` |
| `40001` | `SQLITE_BUSY` | `1205` | `CONCURRENT_MODIFICATION` |

### 2.4 Retry Policy

```typescript
interface RetryPolicy {
  /** Maximum number of retry attempts */
  max_retries: number;           // Default: 3

  /** Base delay between retries in ms */
  base_delay_ms: number;         // Default: 100

  /** Maximum delay between retries in ms */
  max_delay_ms: number;          // Default: 5000

  /** Backoff multiplier */
  backoff_factor: number;        // Default: 2.0

  /** Add random jitter to prevent thundering herd */
  jitter: boolean;               // Default: true
}
```

**Retryable errors:** `CONNECTION_FAILED`, `POOL_EXHAUSTED`, `QUERY_TIMEOUT`, `DEADLOCK`, `CONCURRENT_MODIFICATION`

**Non-retryable errors:** `DUPLICATE_KEY`, `FOREIGN_KEY_VIOLATION`, `CHECK_VIOLATION`, `TENANT_ISOLATION_BREACH`, `NOT_FOUND`

### 2.5 Nigeria-First Error Handling

Given intermittent connectivity in Nigerian network conditions:

- **Connection failures** default to 5 retries (not 3) with longer base delay (500ms)
- **Timeout thresholds** are set higher (30s vs 10s default) to accommodate high-latency networks
- **Offline fallback:** On persistent connection failure, automatically switch to local SQLite and queue operations for sync
- **Graceful degradation:** If remote database is unreachable, the application MUST continue functioning with local data

---

## 3. Observability Integration

### 3.1 Metrics

The Database Adapter MUST emit the following metrics via the Observability Port (defined by the Observability Adapter):

| Metric Name | Type | Description |
|:---|:---|:---|
| `db.connection.active` | Gauge | Number of active connections per tenant |
| `db.connection.idle` | Gauge | Number of idle connections in pool |
| `db.connection.wait_time_ms` | Histogram | Time spent waiting for a connection from pool |
| `db.query.duration_ms` | Histogram | Query execution time |
| `db.query.count` | Counter | Total queries executed (by type: SELECT, INSERT, UPDATE, DELETE) |
| `db.query.error_count` | Counter | Total query errors (by error type) |
| `db.transaction.duration_ms` | Histogram | Transaction duration |
| `db.transaction.rollback_count` | Counter | Number of transaction rollbacks |
| `db.migration.duration_ms` | Histogram | Migration execution time |
| `db.sync.queue_depth` | Gauge | Number of pending sync operations |
| `db.sync.duration_ms` | Histogram | Sync cycle duration |
| `db.sync.conflict_count` | Counter | Number of sync conflicts detected |

### 3.2 Structured Logging

All database operations MUST produce structured log entries:

```typescript
interface DatabaseLogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;

  /** Log level */
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

  /** Operation type */
  operation: 'QUERY' | 'TRANSACTION' | 'MIGRATION' | 'SYNC' | 'CONNECTION';

  /** Tenant context */
  tenant_id: string;

  /** Correlation ID for distributed tracing */
  correlation_id: string;

  /** Duration in milliseconds */
  duration_ms: number;

  /** Whether operation succeeded */
  success: boolean;

  /** Error details (if failed) */
  error?: DatabaseError;

  /** Query fingerprint (parameterized, never raw values) */
  query_fingerprint?: string;

  /** Rows affected */
  rows_affected?: number;
}
```

**Security Rule:** Log entries MUST NEVER contain:
- Raw query parameter values (PII risk)
- Tenant data
- Connection strings or credentials
- Raw SQL (only parameterized fingerprints)

### 3.3 Health Check Specification

```typescript
interface DatabaseHealthStatus {
  /** Overall health */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Engine type and version */
  engine: string;

  /** Connection pool health */
  pool: {
    active: number;
    idle: number;
    max: number;
    wait_queue: number;
  };

  /** Latency check (simple SELECT 1) */
  latency_ms: number;

  /** Replication lag (if applicable) */
  replication_lag_ms?: number;

  /** Last successful migration version */
  migration_version: number;

  /** Sync status (offline mode) */
  sync?: {
    pending_operations: number;
    last_sync_at: string;
    sync_healthy: boolean;
  };
}
```

---

## 4. Security Specification

### 4.1 Tenant Isolation Enforcement

**Constitutional Mandate:** Tenant data MUST be cryptographically and logically isolated (Master Constitution §III, AI Cognitive Fabric Constitution §IV).

| Layer | Mechanism | Enforcement |
|:---|:---|:---|
| **Schema** | Schema-per-tenant (PostgreSQL) | `SET search_path` on every connection |
| **Query** | Mandatory `tenant_id` predicate | Query validator rejects queries without `tenant_id` |
| **RLS** | Row-Level Security policies | Defense-in-depth: even if query validator fails |
| **Connection** | Per-tenant connection context | Connection cannot cross tenant boundaries |
| **Audit** | All cross-tenant access attempts logged | AGVE Level 4 violation trigger |

### 4.2 Query Validation

Every query MUST pass through the query validator before execution:

```typescript
interface QueryValidator {
  /**
   * Validate that a query is safe to execute.
   * Checks:
   * 1. tenant_id predicate present
   * 2. No cross-schema references
   * 3. No DDL statements (unless migration context)
   * 4. No raw SQL injection patterns
   * 5. Query complexity within limits
   */
  validate(query: AbstractQuery, context: TenantContext): ValidationResult;
}
```

### 4.3 Credential Management

- Database credentials MUST be loaded from environment variables or secret store
- Credentials MUST NEVER be hardcoded, logged, or included in error messages
- Credential rotation MUST be supported without downtime (dual-credential window)
- Per-tenant BYOK (Bring Your Own Key) encryption keys MUST be supported for enterprise mode

### 4.4 Data Encryption

| Layer | Mechanism |
|:---|:---|
| **At Rest** | Database-level encryption (TDE) or filesystem encryption |
| **In Transit** | TLS 1.3 mandatory for all database connections |
| **Application** | Column-level encryption for PII fields using tenant-specific keys |
| **Offline** | SQLite databases encrypted using SQLCipher with tenant-derived key |

### 4.5 AGVE Violation Triggers

The following conditions trigger automatic AGVE violations:

| Condition | AGVE Level | Action |
|:---|:---|:---|
| Cross-tenant data access attempt | **Level 4** (Global Freeze) | Immediate halt, audit log, alert |
| Unencrypted PII storage detected | **Level 3** (Layer Freeze) | Halt runtime layer, remediation required |
| Missing tenant_id in query | **Level 2** (Domain Freeze) | Reject query, log violation |
| Credential exposure in logs | **Level 4** (Global Freeze) | Immediate halt, credential rotation |

---

## 5. Acceptance Criteria

- [ ] Error classification with all canonical error types defined
- [ ] Engine-specific error mapping table for all 4 engines
- [ ] Retry policy with Nigeria-First adjustments documented
- [ ] Offline fallback behavior on persistent connection failure specified
- [ ] All observability metrics defined with types and descriptions
- [ ] Structured logging format defined with security rules
- [ ] Health check specification with pool, latency, and sync status
- [ ] Tenant isolation enforcement at 4 layers (schema, query, RLS, connection)
- [ ] Query validator specification defined
- [ ] Credential management and rotation requirements documented
- [ ] Data encryption at rest, in transit, and application level specified
- [ ] AGVE violation triggers mapped to freeze levels

---

## 6. Constitutional Compliance Verification

| Doctrine | Compliance | Evidence |
|:---|:---|:---|
| Build Once, Use Infinitely | ✅ | Single error model serves all engines and deployment modes |
| Mobile First | ✅ | SQLCipher encryption for mobile SQLite, lightweight health checks |
| PWA First | ✅ | Browser-compatible error handling, offline fallback |
| Offline First | ✅ | Automatic offline fallback, sync conflict handling |
| Nigeria First | ✅ | Extended timeouts, 5x retry, graceful degradation |
| Africa First | ✅ | High-latency tolerance, intermittent connectivity resilience |
| AI Vendor Neutrality | ✅ | No AI dependencies in error/security model |
| Infrastructure Neutrality | ✅ | Abstract error types, engine-agnostic security model |

---

**End of Specification Task 03**
**Authored by:** webwakaagent6 (Release, Operations & Support)
**Issue:** webwaka-runtime-universe#5
**Depends on:** #4 (Specification Task 2) ✅ COMPLETED
**Unblocks:** #2 (P0 Specification Phase Issue)
