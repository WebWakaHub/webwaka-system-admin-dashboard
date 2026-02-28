# Offline-First Architecture — Phase 2 Detailed Design

**Document Type:** Phase 2 Architecture Specification  
**Task ID:** WA3-P2-003  
**Department:** Architecture & System Design  
**Owning Agent:** webwakaagent3  
**Status:** DRAFT  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Phase 1 Reference:** WEBWAKA_OFFLINE_FIRST_ARCHITECTURE.md  
**Version:** 1.0  
**Date:** 2026-02-06  
**Scope:** Detailed architecture for Offline Transaction Queues, Sync & Conflict Resolution mechanisms, and data integrity in low-connectivity environments  
**GitHub Issue:** [WA3-P2-003](https://github.com/WebWakaHub/webwaka-governance/issues/3)  
**Input Dependencies:** WA3-P2-001 (Identity System Architecture), WA3-P2-002 (Event Engine Architecture)

---

## 1. Executive Summary

This document provides the detailed architecture and design for the WebWaka Offline-First capabilities, the critical differentiator that enables the platform to operate reliably across Africa where connectivity is intermittent, unreliable, and expensive. Building on the Phase 1 conceptual architecture (WEBWAKA_OFFLINE_FIRST_ARCHITECTURE.md), this specification defines the concrete mechanisms for offline transaction queuing, synchronization protocols, conflict resolution strategies, and data integrity guarantees.

The design prioritizes data integrity and resilience in low-connectivity environments, ensuring that business operations continue seamlessly regardless of network state, and that all offline transactions are eventually synchronized without data loss.

---

## 2. Architecture Overview

### 2.1 System Context

The Offline-First Architecture spans both client and server, providing a seamless bridge between local operations and server synchronization:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT DEVICE                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Application │  │  Local Data  │  │  Offline Queue     │    │
│  │  Layer       │──▶│  Store       │  │  Manager           │    │
│  │              │  │  (IndexedDB/ │  │  ┌──────────────┐  │    │
│  │              │  │   SQLite)    │  │  │ Transaction  │  │    │
│  │              │  │              │  │  │ Queue        │  │    │
│  └──────────────┘  └──────┬───────┘  │  └──────────────┘  │    │
│                           │          │  ┌──────────────┐  │    │
│                           │          │  │ Event Queue  │  │    │
│                           │          │  └──────────────┘  │    │
│                           │          │  ┌──────────────┐  │    │
│                           │          │  │ Sync State   │  │    │
│                           │          │  │ Manager      │  │    │
│                           │          │  └──────────────┘  │    │
│                           │          └────────┬───────────┘    │
│                           │                   │                 │
│  ┌────────────────────────┴───────────────────┴──────────┐     │
│  │              Connectivity Manager                      │     │
│  │  (Online/Offline detection, bandwidth estimation)      │     │
│  └────────────────────────┬──────────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                   ─ ─ ─ ─ ─│─ ─ ─ ─ ─  (Network Boundary)
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                        SERVER                                    │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │              Sync Gateway                                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │  Batch       │  │  Conflict    │  │  Checkpoint  │  │    │
│  │  │  Processor   │  │  Resolver    │  │  Manager     │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Event Engine (Kafka)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

1. **Local-First:** All data is stored locally first. The server is a sync target, not the primary store.
2. **Seamless Transition:** Users should not notice the transition between online and offline modes.
3. **Data Integrity:** No transaction is ever lost, regardless of connectivity state.
4. **Deterministic Conflict Resolution:** Conflicts are resolved by deterministic rules, not user intervention (except when explicitly required).
5. **Minimal Bandwidth:** Sync payloads are compressed and deduplicated to minimize data transfer costs.
6. **Battery Efficient:** Sync operations are batched and scheduled to minimize battery consumption.
7. **Graceful Degradation:** On low-end devices, the system degrades gracefully (reduced local cache, simpler sync).

---

## 3. Connectivity Management

### 3.1 Connectivity States

The system recognizes four connectivity states:

| State | Description | Behavior |
|-------|-------------|----------|
| **ONLINE** | Full connectivity, low latency | Real-time sync, WebSocket active |
| **DEGRADED** | Connectivity available but slow/unreliable | Batched sync, reduced payload size |
| **OFFLINE** | No connectivity | Full local operation, queue all changes |
| **METERED** | Connectivity available but expensive | User-controlled sync, essential only |

### 3.2 Connectivity Detection

```
┌──────────────────────────────────────────────┐
│           Connectivity Manager                │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Network API  │  │  Heartbeat Probe     │  │
│  │  (navigator   │  │  (ping sync endpoint │  │
│  │   .onLine)    │  │   every 30s)         │  │
│  └──────┬───────┘  └──────────┬───────────┘  │
│         │                     │               │
│         ▼                     ▼               │
│  ┌────────────────────────────────────────┐  │
│  │  State Machine                         │  │
│  │                                        │  │
│  │  ONLINE ──▶ DEGRADED ──▶ OFFLINE      │  │
│  │    ▲            ▲            │         │  │
│  │    │            │            │         │  │
│  │    └────────────┴────────────┘         │  │
│  │                                        │  │
│  │  Transitions based on:                 │  │
│  │  - Network API events                  │  │
│  │  - Heartbeat success/failure           │  │
│  │  - Latency measurements               │  │
│  │  - Bandwidth estimation               │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Bandwidth Estimator                   │  │
│  │  - Measures sync response times        │  │
│  │  - Classifies: fast/slow/metered       │  │
│  │  - Adapts sync strategy accordingly    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 3.3 State Transition Events

| Transition | Trigger | Action |
|-----------|---------|--------|
| ONLINE → DEGRADED | Latency > 2s or packet loss > 10% | Switch to batched sync |
| ONLINE → OFFLINE | Network API offline + heartbeat fails | Activate offline queue |
| DEGRADED → OFFLINE | 3 consecutive heartbeat failures | Activate offline queue |
| OFFLINE → DEGRADED | Network API online + heartbeat succeeds (slow) | Begin cautious sync |
| OFFLINE → ONLINE | Network API online + heartbeat succeeds (fast) | Begin full sync |
| DEGRADED → ONLINE | Latency < 500ms and no packet loss | Resume real-time sync |
| Any → METERED | User enables data-saving mode | Restrict sync to essential |

---

## 4. Offline Transaction Queue

### 4.1 Queue Architecture

The Offline Transaction Queue stores all user actions performed while offline, ensuring they are eventually synced to the server.

**Queue Entry Schema:**
```json
{
  "queue_id": "q_<ulid>",
  "transaction_type": "create | update | delete",
  "resource_type": "order | payment | inventory_adjustment | ...",
  "resource_id": "res_<ulid>",
  "payload": { },
  "actor_id": "uid_01HR...",
  "tenant_id": "uid_01HR...",
  "device_id": "dev_01HQ...",
  "created_at": "2026-02-06T08:00:00Z (local clock)",
  "logical_clock": 42,
  "dependencies": ["q_<ulid>", "q_<ulid>"],
  "sync_status": "pending | syncing | synced | conflict | failed",
  "retry_count": 0,
  "max_retries": 5,
  "conflict_resolution": null,
  "server_ack": null
}
```

### 4.2 Logical Clock

Since device clocks may be inaccurate, the system uses a hybrid logical clock (HLC) for ordering:

- **Physical Component:** Device wall clock (best effort)
- **Logical Component:** Monotonically increasing counter per device
- **Merge Rule:** `max(local_physical, remote_physical) + 1` for the logical component

**HLC Format:**
```json
{
  "physical_ts": 1707206400000,
  "logical_counter": 42,
  "device_id": "dev_01HQ..."
}
```

### 4.3 Transaction Dependencies

Some offline transactions depend on previous transactions (e.g., an order update depends on the order creation). The queue tracks dependencies:

```
q_001: Create Order #123          (no dependencies)
q_002: Add Item to Order #123     (depends on q_001)
q_003: Update Item in Order #123  (depends on q_002)
q_004: Create Order #124          (no dependencies, parallel)
```

**Dependency Resolution During Sync:**
1. Build dependency graph from queue entries
2. Topologically sort entries
3. Sync in dependency order
4. If a dependency fails, mark all dependents as blocked

### 4.4 Queue Size Management

To prevent unbounded queue growth on devices with limited storage:

| Device Tier | Max Queue Size | Max Queue Age | Eviction Policy |
|------------|---------------|---------------|-----------------|
| High-end (>4GB RAM) | 10,000 entries | 30 days | LRU with priority |
| Mid-range (2-4GB RAM) | 5,000 entries | 14 days | LRU with priority |
| Low-end (<2GB RAM) | 1,000 entries | 7 days | LRU with priority |

**Priority Levels:**
1. **Critical:** Financial transactions (orders, payments) — never evicted
2. **High:** Inventory changes — evicted only under extreme pressure
3. **Medium:** Profile updates, preferences — evicted when needed
4. **Low:** Analytics events, read receipts — evicted first

---

## 5. Synchronization Protocol

### 5.1 Sync Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Detect  │────▶│  Prepare │────▶│  Upload  │────▶│  Process │
│  Online  │     │  Batch   │     │  Batch   │     │  Server  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
┌──────────┐     ┌──────────┐     ┌──────────┐         │
│  Update  │◀────│  Apply   │◀────│ Download │◀────────┘
│  Local   │     │  Server  │     │  Changes │
│  State   │     │  Changes │     │          │
└──────────┘     └──────────┘     └──────────┘
```

### 5.2 Upstream Sync (Client → Server)

**Step 1: Prepare Batch**
- Collect all pending queue entries
- Sort by dependency order
- Compress payload (gzip)
- Calculate batch checksum

**Step 2: Upload Batch**
```
POST /api/v1/sync/upstream
Authorization: Bearer <access_token>
Content-Type: application/json
Content-Encoding: gzip
X-Device-ID: dev_01HQ...
X-Sync-Checkpoint: 2026-02-06T08:00:00Z

{
  "batch_id": "batch_01HQ...",
  "device_id": "dev_01HQ...",
  "actor_id": "uid_01HR...",
  "checkpoint": "2026-02-06T08:00:00Z",
  "entries": [ ... ],
  "entry_count": 42,
  "checksum": "sha256:abc123..."
}
```

**Step 3: Server Processing**
- Validate batch integrity (checksum)
- Validate actor authentication and authorization
- Process entries in dependency order
- Detect conflicts with server state
- Apply conflict resolution strategy
- Emit events to Event Engine
- Return sync result

**Step 4: Sync Response**
```json
{
  "batch_id": "batch_01HQ...",
  "status": "partial_success",
  "processed": 40,
  "conflicts": 2,
  "failed": 0,
  "results": [
    { "queue_id": "q_001", "status": "synced", "server_id": "srv_001" },
    { "queue_id": "q_002", "status": "conflict", "conflict_type": "concurrent_update", "resolution": { ... } }
  ],
  "new_checkpoint": "2026-02-06T09:00:00Z"
}
```

### 5.3 Downstream Sync (Server → Client)

**Step 1: Request Changes**
```
GET /api/v1/sync/downstream?since=2026-02-06T08:00:00Z&device_id=dev_01HQ...&limit=500
Authorization: Bearer <access_token>
```

**Step 2: Server Prepares Changes**
- Query events since checkpoint
- Filter by tenant and actor scope
- Compress and paginate
- Include conflict resolutions

**Step 3: Apply Changes Locally**
- Apply server changes to local data store
- Update local projections
- Resolve any local-server conflicts
- Update sync checkpoint

### 5.4 Delta Sync

To minimize bandwidth, the system supports delta sync — only changed fields are transmitted:

```json
{
  "resource_type": "order",
  "resource_id": "ord_01HR...",
  "operation": "delta_update",
  "delta": {
    "status": { "from": "pending", "to": "confirmed" },
    "updated_at": { "to": "2026-02-06T09:00:00Z" }
  },
  "version": { "from": 3, "to": 4 }
}
```

**Delta Compression Savings:**
- Full order payload: ~2KB
- Delta update (status change): ~200 bytes
- Savings: ~90% bandwidth reduction

---

## 6. Conflict Resolution

### 6.1 Conflict Types

| Conflict Type | Description | Example |
|--------------|-------------|---------|
| **Concurrent Update** | Same resource modified on client and server | Two staff update same order |
| **Delete-Update** | Resource deleted on one side, updated on other | Order cancelled while being modified |
| **Create-Create** | Same logical resource created on multiple devices | Same customer registered twice |
| **Dependency Conflict** | Dependent resource conflicts | Item added to cancelled order |
| **Constraint Violation** | Offline action violates server constraint | Overselling inventory |

### 6.2 Resolution Strategies

The system supports multiple conflict resolution strategies, configurable per resource type:

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Last-Write-Wins (LWW)** | Most recent write (by HLC) wins | Profile updates, preferences |
| **Server-Wins** | Server version always wins | Financial reconciliation |
| **Client-Wins** | Client version always wins | Draft content, notes |
| **Merge** | Automatically merge non-conflicting fields | Orders with different field changes |
| **Manual** | Flag for human resolution | High-value transactions |
| **Custom Rule** | Apply business-specific rules | Inventory (min of quantities) |

### 6.3 Resolution Configuration

```json
{
  "resource_type": "order",
  "conflict_strategies": {
    "concurrent_update": {
      "strategy": "merge",
      "field_rules": {
        "status": "server_wins",
        "items": "merge_append",
        "notes": "client_wins",
        "amount": "server_wins"
      }
    },
    "delete_update": {
      "strategy": "server_wins",
      "notify_client": true
    },
    "constraint_violation": {
      "strategy": "server_wins",
      "rollback_dependent": true,
      "notify_client": true
    }
  }
}
```

### 6.4 Conflict Resolution Flow

```
Incoming Sync Entry
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  Load Server │────▶│  Compare     │
│  Version     │     │  Versions    │
└──────────────┘     └──────┬───────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
            No Conflict         Conflict Detected
                   │                 │
                   ▼                 ▼
            Apply Directly    ┌──────────────┐
                              │  Load        │
                              │  Resolution  │
                              │  Strategy    │
                              └──────┬───────┘
                                     │
                        ┌────────────┼────────────┐
                        ▼            ▼            ▼
                   Auto-Resolve  Merge       Flag Manual
                        │            │            │
                        ▼            ▼            ▼
                   Apply Winner  Merge Fields  Create Conflict
                                               Record
                        │            │            │
                        └────────────┴────────────┘
                                     │
                                     ▼
                              Emit Resolution Event
                              Update Sync Response
```

### 6.5 Conflict Audit Trail

Every conflict and its resolution is logged:

```json
{
  "conflict_id": "cnf_<ulid>",
  "resource_type": "order",
  "resource_id": "ord_01HR...",
  "conflict_type": "concurrent_update",
  "client_version": { "version": 3, "data": { ... } },
  "server_version": { "version": 4, "data": { ... } },
  "resolution_strategy": "merge",
  "resolved_version": { "version": 5, "data": { ... } },
  "resolved_at": "2026-02-06T09:00:00Z",
  "resolved_by": "system | uid_01HR...",
  "actor_id": "uid_01HR...",
  "device_id": "dev_01HQ..."
}
```

---

## 7. Local Data Store

### 7.1 Storage Architecture

The client maintains a local data store that mirrors the server-side data relevant to the user:

| Platform | Primary Store | Capacity | Encryption |
|----------|--------------|----------|------------|
| **Web (PWA)** | IndexedDB | 50MB-unlimited (browser-dependent) | SubtleCrypto API |
| **Mobile (React Native)** | SQLite (via WatermelonDB) | Device storage | SQLCipher |
| **Desktop** | SQLite | Device storage | SQLCipher |

### 7.2 Local Schema Design

The local schema mirrors the server schema with additional sync metadata:

```sql
-- Local orders table (SQLite example)
CREATE TABLE orders (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL,
    status          TEXT NOT NULL,
    customer_id     TEXT,
    items           TEXT NOT NULL,  -- JSON array
    total_amount    REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'NGN',
    notes           TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    -- Sync metadata
    _sync_status    TEXT NOT NULL DEFAULT 'synced',  -- synced | modified | created | deleted
    _sync_version   INTEGER NOT NULL DEFAULT 0,
    _server_version INTEGER,
    _last_synced_at TEXT,
    _local_modified_at TEXT,
    _conflict_flag  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_orders_sync ON orders(_sync_status);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
```

### 7.3 Data Scoping

The local store only contains data relevant to the current user's scope:

- **End User:** Own orders, own profile, own notifications
- **Staff/Agent:** Tenant orders (assigned), tenant inventory, tenant customers
- **Tenant Admin:** All tenant data
- **Partner:** Aggregated tenant data (summaries only, not full records)

**Scope Enforcement:**
- Downstream sync only delivers scoped data
- Local queries are automatically scoped by tenant/actor
- Scope changes (e.g., role change) trigger re-sync

---

## 8. Data Integrity Guarantees

### 8.1 Integrity Invariants

The Offline-First Architecture guarantees the following invariants:

1. **No Data Loss:** Every offline transaction is eventually synced or explicitly rejected with notification.
2. **Causal Ordering:** Dependent transactions are synced in causal order.
3. **Conflict Visibility:** All conflicts are detected, resolved, and audited.
4. **Eventual Consistency:** Local and server state converge within one sync cycle after connectivity returns.
5. **Idempotent Sync:** Re-syncing the same batch produces the same result (safe to retry).

### 8.2 Integrity Verification

Periodic integrity checks ensure local and server state consistency:

```
┌──────────────────────────────────────────┐
│         Integrity Verification            │
│                                          │
│  1. Checksum Comparison                  │
│     - Hash local data set                │
│     - Compare with server checksum       │
│     - Flag discrepancies                 │
│                                          │
│  2. Version Vector Check                 │
│     - Compare local version vectors      │
│     - Detect missed updates              │
│     - Trigger catch-up sync              │
│                                          │
│  3. Queue Drain Verification             │
│     - Ensure all pending entries synced  │
│     - Alert if entries stuck > 24 hours  │
│     - Escalate if entries stuck > 72 hrs │
│                                          │
│  Frequency: Every 6 hours (online)       │
│             On every reconnection        │
└──────────────────────────────────────────┘
```

---

## 9. Bandwidth Optimization

### 9.1 Compression

All sync payloads are compressed:

| Method | Use Case | Compression Ratio |
|--------|----------|-------------------|
| **gzip** | Standard sync batches | ~70% reduction |
| **brotli** | Large batches (>100KB) | ~80% reduction |
| **delta encoding** | Incremental updates | ~90% reduction |

### 9.2 Sync Scheduling

Sync operations are scheduled based on connectivity state and battery level:

| Condition | Sync Frequency | Batch Size |
|-----------|---------------|------------|
| WiFi + Charging | Immediate (real-time) | Unlimited |
| WiFi + Battery | Every 5 minutes | Up to 500 entries |
| Mobile Data + Charging | Every 15 minutes | Up to 100 entries |
| Mobile Data + Battery | Every 30 minutes | Up to 50 entries |
| Metered + Any | Manual trigger only | Up to 20 entries |

### 9.3 Priority-Based Sync

When bandwidth is limited, sync entries are prioritized:

1. **Critical:** Financial transactions (orders, payments) — sync first
2. **High:** Inventory changes — sync second
3. **Medium:** Profile updates, customer data — sync third
4. **Low:** Analytics, preferences — sync last (or defer)

---

## 10. Error Handling and Recovery

### 10.1 Sync Failure Handling

| Failure Type | Retry Strategy | Max Retries | Fallback |
|-------------|---------------|-------------|----------|
| Network timeout | Exponential backoff (1s, 5s, 30s, 2m, 10m) | 5 | Queue for next sync cycle |
| Server error (5xx) | Exponential backoff | 3 | Queue for next sync cycle |
| Client error (4xx) | No retry (fix required) | 0 | Flag for manual review |
| Conflict | Apply resolution strategy | 1 | Flag for manual resolution |
| Checksum mismatch | Retry with full payload | 2 | Re-download server state |

### 10.2 Recovery Procedures

**Full Re-Sync:**
When local state is corrupted or significantly diverged:
1. Clear local data store (preserve pending queue)
2. Download full server state for user's scope
3. Re-apply pending queue entries against fresh state
4. Resolve any conflicts
5. Resume normal sync

**Queue Recovery:**
When the offline queue is corrupted:
1. Attempt to read queue entries from backup
2. If backup unavailable, scan local data store for unsynced changes
3. Reconstruct queue from local modifications
4. Resume sync

---

## 11. Monitoring and Observability

### 11.1 Client-Side Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `offline.queue.depth` | Number of pending sync entries | > 500 entries |
| `offline.queue.age` | Age of oldest pending entry | > 24 hours |
| `offline.sync.duration` | Time to complete sync cycle | > 30 seconds |
| `offline.conflict.count` | Number of conflicts per sync | > 10 per sync |
| `offline.storage.usage` | Local storage usage percentage | > 80% |
| `offline.connectivity.state` | Current connectivity state | OFFLINE > 1 hour |

### 11.2 Server-Side Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `sync.batch.rate` | Sync batches processed per minute | > 1000/min (capacity) |
| `sync.conflict.rate` | Conflicts per minute | > 100/min |
| `sync.latency` | Batch processing latency | > 5 seconds (p95) |
| `sync.failure.rate` | Failed sync batches per minute | > 5% of total |
| `sync.stale_devices` | Devices not synced in 48+ hours | > 100 devices |

---

## 12. Security Considerations

### 12.1 Local Data Encryption

- All local data encrypted at rest using device-level encryption
- SQLCipher for SQLite databases (AES-256-CBC)
- IndexedDB encrypted via SubtleCrypto API wrapper
- Encryption key derived from user credentials + device key

### 12.2 Sync Security

- All sync communication over TLS 1.3
- Sync requests authenticated with access token (or offline token)
- Batch integrity verified with SHA-256 checksum
- Replay protection via batch ID uniqueness

### 12.3 Data Scope Enforcement

- Local store only contains data within user's authorization scope
- Scope changes trigger immediate re-evaluation of local data
- Out-of-scope data is purged from local store
- Sync gateway enforces scope on both upload and download

---

## 13. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Local read latency | < 10ms | IndexedDB/SQLite query |
| Local write latency | < 20ms | Including queue entry |
| Sync batch upload (100 entries) | < 3s | Including compression |
| Sync batch download (100 entries) | < 2s | Including decompression |
| Conflict resolution | < 100ms per conflict | Automated resolution |
| Full re-sync (1000 records) | < 30s | Including schema setup |
| Connectivity state detection | < 5s | From actual state change |

---

## 14. Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Identity System (WA3-P2-001) | Internal | Actor authentication, offline tokens |
| Event Engine (WA3-P2-002) | Internal | Event queuing, sync events |
| IndexedDB | Client | Web local storage |
| SQLite / WatermelonDB | Client | Mobile local storage |
| PostgreSQL 15+ | Server | Server-side data store |
| Redis 7+ | Server | Sync state caching |

---

## 15. Open Questions and Decisions

| # | Question | Proposed Answer | Status |
|---|----------|----------------|--------|
| 1 | CRDT vs. OT for conflict resolution? | Neither — use HLC + deterministic merge rules (simpler, sufficient) | DECIDED |
| 2 | Maximum offline duration supported? | 30 days (configurable per tenant) | DECIDED |
| 3 | Should sync be push or pull? | Pull with server-sent hints (via WebSocket when online) | DECIDED |
| 4 | Local database migration strategy? | Versioned migrations bundled with app updates | DECIDED |
| 5 | Multi-device conflict resolution? | HLC ordering + device priority (primary device wins ties) | DECIDED |

---

## Document Attribution

**Produced by:** webwakaagent3 (Architecture & System Design)  
**Department:** Architecture & System Design  
**Phase:** Phase 2 — Implementation & Infrastructure  
**Milestone:** Milestone 4 — Integration & Optimization  
**Date:** 2026-02-06  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Review Required By:** Chief of Staff (webwakaagent1)
