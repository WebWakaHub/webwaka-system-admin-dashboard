# RUNTIME-ADAPTER-DATABASE-v0.1.0 — Specification Task 02

**Acting under Canonical Role: Release Management Agent (webwakaagent6)**
**Issue Reference:** webwaka-runtime-universe#4
**Phase:** P0 — Specification
**Task:** T02 — Data Model, Schema Isolation & Migration Specification
**Date:** 2026-02-26

---

## 1. Purpose

This document specifies the data model conventions, schema isolation strategies, and migration framework for the Database Adapter. Building on T01's port interface definitions, this task defines HOW data is structured, isolated between tenants, and evolved over time.

---

## 2. Data Model Conventions

### 2.1 Table Naming Standard

All tables follow the canonical naming convention:

```
{layer}_{domain}_{entity}
```

| Component | Description | Example |
|:---|:---|:---|
| `layer` | Biological layer abbreviation | `org` (organelle), `cel` (cell), `tis` (tissue), `ogn` (organ), `sys` (system) |
| `domain` | Domain code | `com` (commerce), `fin` (finance), `trn` (transport) |
| `entity` | Entity name in snake_case | `product`, `order_line`, `payment_intent` |

**Example:** `ogn_com_product`, `cel_fin_ledger_entry`, `tis_trn_route_segment`

### 2.2 Column Conventions

Every table MUST include the following system columns:

```typescript
interface SystemColumns {
  /** UUID v7 — time-ordered for index performance */
  id: string;

  /** Tenant identifier — MANDATORY for multi-tenant isolation */
  tenant_id: string;

  /** ISO 8601 timestamp — creation time */
  created_at: string;

  /** ISO 8601 timestamp — last modification */
  updated_at: string;

  /** Soft delete marker — never hard delete */
  deleted_at: string | null;

  /** Optimistic concurrency control */
  version: number;

  /** Agent/user who created the record */
  created_by: string;

  /** Agent/user who last modified the record */
  updated_by: string;
}
```

### 2.3 Data Type Mapping

| Abstract Type | PostgreSQL | SQLite | MySQL | TiDB |
|:---|:---|:---|:---|:---|
| `UUID` | `uuid` | `TEXT` | `CHAR(36)` | `CHAR(36)` |
| `String` | `text` | `TEXT` | `TEXT` | `TEXT` |
| `Integer` | `bigint` | `INTEGER` | `BIGINT` | `BIGINT` |
| `Decimal` | `numeric(19,4)` | `TEXT` (stored as string) | `DECIMAL(19,4)` | `DECIMAL(19,4)` |
| `Boolean` | `boolean` | `INTEGER` (0/1) | `TINYINT(1)` | `TINYINT(1)` |
| `Timestamp` | `timestamptz` | `TEXT` (ISO 8601) | `DATETIME(6)` | `DATETIME(6)` |
| `JSON` | `jsonb` | `TEXT` (JSON string) | `JSON` | `JSON` |
| `Binary` | `bytea` | `BLOB` | `LONGBLOB` | `LONGBLOB` |

### 2.4 Currency & Financial Data

Per **Nigeria-First Doctrine**, all monetary values MUST:

- Use `numeric(19,4)` precision (supports Naira kobo subdivisions)
- Store currency code alongside amount (ISO 4217)
- Support multi-currency with NGN as primary
- Never use floating-point for financial calculations

```typescript
interface MonetaryValue {
  amount: string;          // Stored as numeric(19,4), transmitted as string
  currency_code: string;   // ISO 4217: "NGN", "USD", "GBP", etc.
  minor_units: number;     // 2 for NGN, 2 for USD, etc.
}
```

---

## 3. Schema Isolation Model

### 3.1 Multi-Tenant SaaS Mode — Schema-Per-Tenant

```
PostgreSQL Instance
├── public (shared system tables)
│   ├── sys_tenants
│   ├── sys_migrations
│   └── sys_feature_flags
├── tenant_abc123 (tenant schema)
│   ├── ogn_com_product
│   ├── ogn_com_order
│   └── ...
├── tenant_def456 (tenant schema)
│   ├── ogn_com_product
│   ├── ogn_com_order
│   └── ...
└── tenant_ghi789 (tenant schema)
    └── ...
```

**Isolation Guarantees:**

| Mechanism | Description |
|:---|:---|
| **Schema Separation** | Each tenant gets its own PostgreSQL schema |
| **Row-Level Security (RLS)** | Additional RLS policies as defense-in-depth |
| **Connection Context** | `SET search_path = tenant_{id}` on every connection |
| **Query Validation** | All queries validated to include `tenant_id` predicate |

### 3.2 Dedicated Enterprise Mode — Database-Per-Tenant

```
Enterprise A Instance    Enterprise B Instance
├── all tables           ├── all tables
└── single tenant        └── single tenant
```

No schema separation needed — entire database is dedicated.

### 3.3 Offline Mode — SQLite File-Per-Tenant

```
Device Local Storage
├── tenant_abc123.db
│   ├── ogn_com_product
│   ├── _sync_queue
│   └── _sync_metadata
└── tenant_def456.db (if multi-tenant device)
    └── ...
```

**Sync Tables (local only):**

```sql
-- Tracks pending sync operations
CREATE TABLE _sync_queue (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL,
  synced_at TEXT,
  retry_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0  -- Higher = sync first (financial > analytics)
);

-- Tracks sync state per table
CREATE TABLE _sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_sync_at TEXT,
  last_sync_cursor TEXT,
  sync_version INTEGER DEFAULT 0
);
```

---

## 4. Migration Framework Specification

### 4.1 Migration File Convention

```
migrations/
├── 0001_initial_schema.sql
├── 0002_add_product_table.sql
├── 0003_add_order_tables.sql
└── ...
```

Each migration file MUST:
- Be idempotent (safe to re-run)
- Include both `UP` and `DOWN` sections
- Be numbered sequentially with zero-padding
- Include a checksum for integrity verification

### 4.2 Migration Record Schema

```sql
CREATE TABLE sys_migrations (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by TEXT NOT NULL,
  execution_time_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('applied', 'rolled_back', 'failed'))
);
```

### 4.3 Multi-Tenant Migration Strategy

When a migration is applied:
1. Lock the migration table (prevent concurrent migrations)
2. Apply migration to `public` schema (shared tables) if applicable
3. Iterate over all tenant schemas and apply migration to each
4. Record migration in `sys_migrations`
5. Release lock

**Rolling Migration Support:**
- Migrations can be applied to tenants in batches (not all at once)
- Supports canary deployment: apply to 1% of tenants first, then 10%, then 100%
- Failed tenant migration does not block other tenants

### 4.4 Offline Migration Handling

When the device comes online after a schema change:
1. Check `sys_migrations` on remote for new migrations
2. Download migration files
3. Apply to local SQLite database
4. Transform any queued sync operations to match new schema
5. Resume sync

---

## 5. Index Strategy

### 5.1 Mandatory Indexes

Every table MUST have:

```sql
-- Primary key (UUID v7 — naturally ordered by time)
PRIMARY KEY (id)

-- Tenant isolation index
CREATE INDEX idx_{table}_tenant ON {table} (tenant_id);

-- Soft delete filter
CREATE INDEX idx_{table}_active ON {table} (tenant_id, deleted_at) WHERE deleted_at IS NULL;

-- Temporal query support
CREATE INDEX idx_{table}_created ON {table} (tenant_id, created_at DESC);
```

### 5.2 Nigeria-First Performance Indexes

Given typical Nigerian network conditions (high latency, intermittent connectivity), indexes are optimized for:
- **Batch read operations** (load data in bulk during connectivity windows)
- **Offline query performance** (SQLite indexes for local queries)
- **Sync queue priority** (financial transactions indexed for priority sync)

---

## 6. Acceptance Criteria

- [ ] Table naming convention defined and documented
- [ ] System columns specified for all tables
- [ ] Data type mapping across all 4 engines documented
- [ ] Currency/financial data handling specified (Nigeria-First)
- [ ] Schema isolation model defined for all 3 modes (SaaS, Enterprise, Offline)
- [ ] Sync queue schema defined for offline mode
- [ ] Migration framework specified with multi-tenant support
- [ ] Rolling migration strategy documented
- [ ] Offline migration handling specified
- [ ] Index strategy defined with Nigeria-First optimizations

---

## 7. Constitutional Compliance Verification

| Doctrine | Compliance | Evidence |
|:---|:---|:---|
| Build Once, Use Infinitely | ✅ | Single schema model serves all deployment modes |
| Mobile First | ✅ | SQLite schema for mobile with sync queue |
| PWA First | ✅ | Same SQLite model works in browser via sql.js |
| Offline First | ✅ | Full offline schema with sync queue and metadata |
| Nigeria First | ✅ | NGN currency support, batch-optimized indexes, low-bandwidth sync |
| Africa First | ✅ | Multi-currency support, intermittent connectivity handling |
| AI Vendor Neutrality | ✅ | No AI dependencies in data model |
| Infrastructure Neutrality | ✅ | Abstract types mapped to 4 different engines |

---

**End of Specification Task 02**
**Authored by:** webwakaagent6 (Release, Operations & Support)
**Issue:** webwaka-runtime-universe#4
**Depends on:** #3 (Specification Task 1) ✅ COMPLETED
