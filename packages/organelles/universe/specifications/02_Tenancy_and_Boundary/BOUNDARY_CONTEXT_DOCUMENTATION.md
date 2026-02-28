# BOUNDARY CONTEXT ORGANELLE — Complete Documentation Suite
**Code:** `ORG-TB-BOUNDARY_CONTEXT-v0.1.0`  
**Phase:** 5 — Documentation  
**Agent:** webwakaagent4  
**Date:** 2026-02-26

---

## Part 1 — Operational Runbook (P5-T01)

### 1.1 Overview

The Boundary Context Organelle (`ORG-TB-BOUNDARY_CONTEXT`) is a foundational infrastructure component that enforces domain boundary constraints across the WebWaka platform. It maintains a registry of bounded contexts, their ownership declarations, and the explicit integration maps between them. It also records boundary violations for audit and enforcement purposes.

**Criticality:** CRITICAL — all higher-layer structures (Cell, Tissue, Organ, Organism) depend on this organelle for boundary enforcement. Degradation of this organelle will propagate to all dependent layers.

### 1.2 Health Monitoring

**Health Endpoint:** `GET /organelles/boundary-context/health`

Expected healthy response:
```json
{
  "status": "healthy",
  "organelle": "ORG-TB-BOUNDARY_CONTEXT-v0.1.0",
  "checked_at": "2026-02-26T00:00:00.000Z",
  "checks": {
    "storage_reachable": true,
    "event_publisher_reachable": true,
    "active_context_count": 42,
    "violation_rate_last_hour": 0
  }
}
```

**Degraded state** (`violation_rate_last_hour > 100`): Indicates a boundary enforcement breakdown. Escalate immediately to the Tenancy & Boundary team.

**Unhealthy state** (`storage_reachable: false` or `event_publisher_reachable: false`): The organelle cannot process commands. All dependent layers will begin failing. Page on-call immediately.

### 1.3 Metrics Dashboard

| Metric | Type | Alert Threshold | Description |
|---|---|---|---|
| `boundary_context.context.registered` | Counter | — | Total contexts ever registered |
| `boundary_context.context.deprecated` | Counter | — | Total deprecations |
| `boundary_context.context.retired` | Counter | — | Total retirements |
| `boundary_context.context_map.declared` | Counter | — | Total maps declared |
| `boundary_context.context_map.revoked` | Counter | — | Total maps revoked |
| `boundary_context.violation.reported` | Counter | > 10/hour | Boundary violations detected |
| `boundary_context.registration.rejected` | Counter | > 5/hour | Rejected registrations |
| `boundary_context.registration.duration_ms` | Histogram | p99 > 500ms | Registration latency |
| `boundary_context.active_context.count` | Gauge | — | Current active contexts |
| `boundary_context.active_map.count` | Gauge | — | Current active maps |

### 1.4 Runbook: Context Registration Failure

**Symptom:** `registerContext` returning `AGGREGATE_OWNERSHIP_CONFLICT` or `EVENT_OWNERSHIP_CONFLICT`

**Diagnosis steps:**
1. Query `GET /organelles/boundary-context/contexts?status=ACTIVE` to list all active contexts
2. Search for the conflicting aggregate or event: `GET /organelles/boundary-context/contexts?aggregate=<name>`
3. Determine if the owning context is still legitimately active or should be deprecated/retired

**Resolution:**
- If the owning context is stale: deprecate it via `PATCH /organelles/boundary-context/contexts/{id}` with `{"status": "DEPRECATED"}`
- If the conflict is a genuine design error: escalate to the Tenancy & Boundary team for domain model review

### 1.5 Runbook: High Boundary Violation Rate

**Symptom:** `boundary_context.violation.reported` counter exceeding 10/hour

**Diagnosis steps:**
1. Query `GET /organelles/boundary-context/violations?from_timestamp=<1h_ago>` to list recent violations
2. Group by `violating_context` and `violation_type`
3. Check if the violating context has a declared map to the target context

**Resolution:**
- If no map exists: the violating context must declare a context map before consuming the target's events/commands
- If map exists but violation is still reported: the integration point type may not match the declared map — update the map's `integration_points`
- If systematic: escalate to the Platform Architecture team for boundary enforcement review

### 1.6 Runbook: Context Retirement Cascade

**Symptom:** Multiple context maps suddenly showing `REVOKED` status

**Cause:** A context was retired, triggering cascade revocation of all its maps (INV-BC-07 + CON-BC-04)

**Impact assessment:**
1. Query `GET /organelles/boundary-context/maps?status=REVOKED` to list all revoked maps
2. For each revoked map, identify dependent contexts that were consuming events/commands through that map
3. Those dependent contexts now have undeclared integrations — they must either:
   - Stop consuming the retired context's events/commands, OR
   - Declare new maps to the replacement context

**Recovery:** Notify all dependent context owners via the `CONTEXT_RETIRED` event (published automatically on retirement).

### 1.7 Backup and Recovery

The `context_records`, `context_maps`, and `boundary_violations` tables must be included in the platform's standard database backup schedule. The `boundary_violations` table is append-only and must never be truncated.

**Recovery time objective (RTO):** 15 minutes  
**Recovery point objective (RPO):** 5 minutes (matching database replication lag)

---

## Part 2 — API Reference (P5-T02)

### 2.1 Commands

#### `registerContext(cmd: RegisterContextCommand): Promise<RegisterContextResult>`

Registers a new bounded context in the platform registry.

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `context_id` | `string` (UUID v4) | ✓ | Globally unique identifier. Must be a valid UUID v4. |
| `context_name` | `string` | ✓ | Human-readable name. Must be unique among non-RETIRED contexts. |
| `domain_scope` | `string` | ✓ | Plain-language description of the context's domain boundary. |
| `owned_aggregates` | `string[]` (min 1) | ✓ | Aggregate roots exclusively owned by this context. |
| `owned_events` | `string[]` (min 1) | ✓ | Domain events exclusively owned by this context. |
| `version` | `string` | ✓ | Semantic version of the context definition (e.g., `"1.0.0"`). |
| `registered_by` | `string` (UUID) | ✓ | Agent or user ID performing the registration. |

**Success result:**
```typescript
{ success: true, context: ContextRecord }
```

**Error codes:**

| Code | Cause |
|---|---|
| `DUPLICATE_CONTEXT_NAME` | A non-RETIRED context with this name already exists |
| `AGGREGATE_OWNERSHIP_CONFLICT` | One of the aggregates is already owned by another ACTIVE context |
| `EVENT_OWNERSHIP_CONFLICT` | One of the events is already owned by another ACTIVE context |
| `INVALID_CONTEXT_ID_FORMAT` | `context_id` is not a valid UUID v4 |
| `MISSING_REQUIRED_FIELD` | One or more required fields are absent |
| `INSUFFICIENT_OWNERSHIP_DECLARATION` | `owned_aggregates` or `owned_events` is empty |

---

#### `declareContextMap(cmd: DeclareContextMapCommand): Promise<DeclareContextMapResult>`

Declares an explicit integration relationship between two bounded contexts.

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `source_context_id` | `string` (UUID) | ✓ | The consuming context (the one that depends on the target). |
| `target_context_id` | `string` (UUID) | ✓ | The providing context. |
| `relationship_type` | `RelationshipType` | ✓ | One of: `CONFORMIST`, `ACL`, `OPEN_HOST`, `PUBLISHED_LANGUAGE`, `PARTNERSHIP`, `CUSTOMER_SUPPLIER` |
| `integration_points` | `IntegrationPoint[]` (min 1) | ✓ | Explicit list of events/queries/commands consumed across the boundary. |
| `declared_by` | `string` | ✓ | Agent or user ID declaring the map. |

**Idempotency:** If an ACTIVE map with the same source, target, and relationship type already exists, the existing map is returned with `was_idempotent: true`. No duplicate is created.

**Error codes:**

| Code | Cause |
|---|---|
| `SELF_REFERENTIAL_MAP` | `source_context_id === target_context_id` |
| `EMPTY_INTEGRATION_POINTS` | `integration_points` array is empty |
| `RETIRED_CONTEXT_REFERENCE` | Source or target context has RETIRED status |
| `CONTEXT_NOT_FOUND` | Source or target context does not exist |

---

#### `reportBoundaryViolation(cmd: ReportBoundaryViolationCommand): Promise<ReportBoundaryViolationResult>`

Records a detected boundary violation in the append-only audit log.

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `violation_id` | `string` (UUID) | ✓ | Caller-supplied idempotency key. |
| `violating_context` | `string` (UUID) | ✓ | Context that committed the violation. |
| `target_context` | `string` (UUID) | ✓ | Context whose boundary was violated. |
| `violation_type` | `ViolationType` | ✓ | One of: `DIRECT_MODEL_ACCESS`, `UNDECLARED_EVENT_CONSUMPTION`, `UNDECLARED_COMMAND_INVOCATION` |
| `violation_detail` | `string` | ✓ | Human-readable description of the specific violation. |
| `detected_at` | `number` (UTC ms) | ✓ | Timestamp of detection. |
| `detected_by` | `string` | ✓ | Enforcement layer or agent that detected the violation. |

**Idempotency:** If a violation with the same `violation_id` already exists, the call returns `{ success: true, was_idempotent: true }` without writing a duplicate record.

---

#### `deprecateContext(cmd) / retireContext(cmd)`

Transitions a context through its lifecycle. See §2.3 for state machine rules.

---

### 2.2 Queries

| Method | Description |
|---|---|
| `getContext(context_id)` | Returns a single `ContextRecord` or `null` |
| `findContextByName(context_name)` | Returns a single `ContextRecord` or `null` |
| `listContexts({ status_filter?, page?, page_size? })` | Paginated list of contexts. `page_size` capped at 100. |
| `getContextMap(map_id)` | Returns a single `ContextMapRecord` or `null` |
| `listContextMaps({ source_context_id?, target_context_id?, status_filter?, page?, page_size? })` | Paginated list of maps |
| `listBoundaryViolations({ violating_context_id?, target_context_id?, violation_type?, from_timestamp?, to_timestamp?, page?, page_size? })` | Paginated violation audit log |

### 2.3 State Machine Reference

```
ACTIVE ──────────────────────────────────────────► RETIRED
   │                                                   ▲
   │                                                   │
   ▼                                                   │
DEPRECATED ─────────────────────────────────────────►─┘
```

| From | To | Trigger | Side Effects |
|---|---|---|---|
| `ACTIVE` | `DEPRECATED` | `deprecateContext()` | Publishes `CONTEXT_DEPRECATED` |
| `ACTIVE` | `RETIRED` | `retireContext()` | Cascades to revoke all maps; publishes `CONTEXT_RETIRED` |
| `DEPRECATED` | `RETIRED` | `retireContext()` | Cascades to revoke all maps; publishes `CONTEXT_RETIRED` |
| `DEPRECATED` | `ACTIVE` | — | **FORBIDDEN** — no reactivation |
| `RETIRED` | any | — | **FORBIDDEN** — terminal state |

### 2.4 Events Published

| Event | Trigger | Key Payload Fields |
|---|---|---|
| `CONTEXT_REGISTERED` | `registerContext` success | `context_id`, `context_name`, `registered_by`, `registered_at` |
| `CONTEXT_DEPRECATED` | `deprecateContext` success | `context_id`, `deprecated_by`, `deprecated_at` |
| `CONTEXT_RETIRED` | `retireContext` success | `context_id`, `retired_by`, `retired_at`, `cascaded_map_revocations` |
| `CONTEXT_MAP_DECLARED` | `declareContextMap` success (non-idempotent) | `map_id`, `source_context_id`, `target_context_id`, `relationship_type` |
| `CONTEXT_MAP_REVOKED` | `revokeContextMap` success | `map_id`, `revoked_by`, `revoked_at` |
| `BOUNDARY_VIOLATION_DETECTED` | `reportBoundaryViolation` success (non-idempotent) | `violation_id`, `violating_context`, `target_context`, `violation_type`, `detected_at` |
| `HEALTH_CHECK` | `checkBoundaryContextHealth` | `probe: true` |

---

## Part 3 — Integration Guide (P5-T03)

### 3.1 Quick Start

```typescript
import { BoundaryContextOrganelle } from './organelles/ORG-TB-BOUNDARY_CONTEXT/index.js';
import { MySQLBoundaryContextStorage } from './organelles/ORG-TB-BOUNDARY_CONTEXT/storage.mysql.js';
import { BoundaryContextPrometheusMetrics } from './organelles/ORG-TB-BOUNDARY_CONTEXT/observability.js';

// 1. Wire up dependencies
const storage = new MySQLBoundaryContextStorage(dbConnection);
const events = new YourEventPublisher();
const metrics = new BoundaryContextPrometheusMetrics();

// 2. Instantiate the organelle
const boundaryContext = new BoundaryContextOrganelle(storage, events, metrics);

// 3. Register your first context
const result = await boundaryContext.registerContext({
  context_id: crypto.randomUUID(),
  context_name: 'OrderManagement',
  domain_scope: 'Manages the full lifecycle of customer orders from placement to fulfilment',
  owned_aggregates: ['Order', 'OrderLine'],
  owned_events: ['OrderPlaced', 'OrderShipped', 'OrderCancelled'],
  version: '1.0.0',
  registered_by: agentId,
});

if (!result.success) {
  console.error('Registration failed:', result.error_code, result.error_message);
} else {
  console.log('Registered:', result.context.context_id);
}
```

### 3.2 Database Schema

Apply the following migration before first use:

```sql
-- context_records: one row per registered bounded context
CREATE TABLE context_records (
  context_id       VARCHAR(36)   NOT NULL PRIMARY KEY,
  context_name     VARCHAR(255)  NOT NULL,
  domain_scope     TEXT          NOT NULL,
  owned_aggregates JSON          NOT NULL,
  owned_events     JSON          NOT NULL,
  version          VARCHAR(50)   NOT NULL,
  status           ENUM('ACTIVE','DEPRECATED','RETIRED') NOT NULL DEFAULT 'ACTIVE',
  registered_at    BIGINT        NOT NULL,
  registered_by    VARCHAR(255)  NOT NULL,
  updated_at       BIGINT        NOT NULL,
  record_version   INT           NOT NULL DEFAULT 1,
  INDEX idx_context_name (context_name),
  INDEX idx_status (status),
  INDEX idx_registered_at (registered_at)
);

-- context_maps: explicit integration relationships
CREATE TABLE context_maps (
  map_id              VARCHAR(36)   NOT NULL PRIMARY KEY,
  source_context_id   VARCHAR(36)   NOT NULL,
  target_context_id   VARCHAR(36)   NOT NULL,
  relationship_type   ENUM('CONFORMIST','ACL','OPEN_HOST','PUBLISHED_LANGUAGE','PARTNERSHIP','CUSTOMER_SUPPLIER') NOT NULL,
  integration_points  JSON          NOT NULL,
  status              ENUM('ACTIVE','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  declared_at         BIGINT        NOT NULL,
  declared_by         VARCHAR(255)  NOT NULL,
  INDEX idx_source (source_context_id),
  INDEX idx_target (target_context_id),
  INDEX idx_status (status),
  FOREIGN KEY (source_context_id) REFERENCES context_records(context_id),
  FOREIGN KEY (target_context_id) REFERENCES context_records(context_id)
);

-- boundary_violations: append-only audit log
CREATE TABLE boundary_violations (
  violation_id      VARCHAR(36)   NOT NULL PRIMARY KEY,
  violating_context VARCHAR(36)   NOT NULL,
  target_context    VARCHAR(36)   NOT NULL,
  violation_type    ENUM('DIRECT_MODEL_ACCESS','UNDECLARED_EVENT_CONSUMPTION','UNDECLARED_COMMAND_INVOCATION') NOT NULL,
  violation_detail  TEXT          NOT NULL,
  detected_at       BIGINT        NOT NULL,
  detected_by       VARCHAR(255)  NOT NULL,
  INDEX idx_violating (violating_context),
  INDEX idx_target (target_context),
  INDEX idx_detected_at (detected_at)
  -- NOTE: No UPDATE or DELETE permissions should be granted on this table.
  -- Enforce at the database level: REVOKE UPDATE, DELETE ON boundary_violations FROM app_user;
);
```

### 3.3 Declaring a Context Map

Before any context can consume events or invoke commands from another context, it must declare a context map:

```typescript
// OrderManagement wants to consume StockReserved from InventoryManagement
const mapResult = await boundaryContext.declareContextMap({
  source_context_id: orderManagementId,
  target_context_id: inventoryManagementId,
  relationship_type: 'CONFORMIST',
  integration_points: [
    { type: 'EVENT', name: 'StockReserved', direction: 'INBOUND' },
    { type: 'EVENT', name: 'StockReleased', direction: 'INBOUND' },
    { type: 'COMMAND', name: 'ReserveStock', direction: 'OUTBOUND' },
  ],
  declared_by: agentId,
});
```

### 3.4 Reporting a Boundary Violation

The enforcement layer (typically a middleware or event bus interceptor) should call this when it detects an undeclared cross-boundary interaction:

```typescript
await boundaryContext.reportBoundaryViolation({
  violation_id: crypto.randomUUID(),
  violating_context: orderManagementId,
  target_context: inventoryManagementId,
  violation_type: 'UNDECLARED_EVENT_CONSUMPTION',
  violation_detail: 'OrderManagement consumed StockReserved without a declared context map (detected by event bus interceptor)',
  detected_at: Date.now(),
  detected_by: 'event-bus-enforcement-layer',
});
```

### 3.5 Implementing a Custom Event Publisher

```typescript
import type { BoundaryContextEventPublisher } from './organelles/ORG-TB-BOUNDARY_CONTEXT/index.js';

class KafkaBoundaryContextEventPublisher implements BoundaryContextEventPublisher {
  constructor(private readonly kafka: KafkaProducer) {}

  async publish(event_type: string, payload: object): Promise<void> {
    await this.kafka.send({
      topic: 'webwaka.boundary-context.events',
      messages: [{
        key: event_type,
        value: JSON.stringify({ event_type, payload, published_at: Date.now() }),
      }],
    });
  }
}
```

### 3.6 Implementing a Custom Storage Adapter

For non-MySQL databases, implement the `BoundaryContextStorage` interface directly. All 13 methods must be implemented. Key constraints to preserve:

1. `insertViolation` must be the **only** write operation on the violations store — never implement `updateViolation` or `deleteViolation`
2. `updateContextStatus` must implement **optimistic concurrency** — check `record_version` before updating and return `false` on mismatch
3. `findActiveContextsOwningAggregate` and `findActiveContextsOwningEvent` must only return ACTIVE contexts

### 3.7 Known Limitations (v0.1.0)

| Limitation | Impact | Planned Fix |
|---|---|---|
| No event ordering guarantee across concurrent registrations | Two agents registering conflicting contexts simultaneously may both succeed if the DB lacks serializable isolation | v0.2.0: Serializable transaction isolation for `registerContext` |
| No bulk context import API | Bootstrapping large existing systems requires N individual `registerContext` calls | v0.2.0: `bulkRegisterContexts` command |
| Violation log has no TTL or archival | `boundary_violations` table will grow unbounded | v0.2.0: Configurable archival policy |
| No context map version history | Revoking and re-declaring a map loses the previous integration point history | v0.3.0: Map version history |

---

*Documentation generated by webwakaagent4 | ORG-TB-BOUNDARY_CONTEXT-v0.1.0 | Phase 5*
