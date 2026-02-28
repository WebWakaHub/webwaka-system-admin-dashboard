# BOUNDARY CONTEXT ORGANELLE — Design

**Organelle Code:** `ORG-TB-BOUNDARY_CONTEXT-v0.1.0`  
**Document Type:** Design  
**Phase:** 1 — Design  
**Responsible Agent:** webwakaagent4  
**Date:** 2026-02-26  
**Specification Reference:** `BOUNDARY_CONTEXT_ORGANELLE.md` v0.1.0

---

## Part 1 — State Machine Model (P1-T01)

### 1.1. ContextRecord State Machine

The ContextRecord is the primary stateful entity managed by this organelle. It follows a strict unidirectional lifecycle.

#### States

| State | Description | Entry Condition | Exit Condition |
|-------|-------------|-----------------|----------------|
| `ACTIVE` | Context is registered, valid, and fully operational | Successful ContextRegistrationRequest | Deprecation or emergency retirement |
| `DEPRECATED` | Context is scheduled for retirement; existing integrations remain valid but no new integrations should be created | Explicit deprecation request by context owner | Retirement |
| `RETIRED` | Context is permanently decommissioned; no new references permitted | Explicit retirement request or end of deprecation period | Terminal state — no exit |

#### State Transition Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    ▼                                             │
         ┌──────────────────┐                                     │
         │                  │                                     │
         │     ACTIVE       │──────────────────────────────────►  │
         │                  │  emergency_retire()                 │
         └────────┬─────────┘                                     │
                  │                                               │
                  │ deprecate()                                   │
                  ▼                                               │
         ┌──────────────────┐                                     │
         │                  │                                     │
         │   DEPRECATED     │──────────────────────────────────►  │
         │                  │  retire()                           │
         └──────────────────┘                                     │
                                                                  │
                                             ┌────────────────────┘
                                             ▼
                                    ┌──────────────────┐
                                    │                  │
                                    │    RETIRED       │
                                    │   (terminal)     │
                                    └──────────────────┘
```

#### Transition Rules

| Transition | Trigger | Pre-conditions | Post-conditions |
|-----------|---------|----------------|-----------------|
| `ACTIVE → DEPRECATED` | `deprecate(context_id, deprecated_by)` | Context must be ACTIVE; caller must be context owner or Founder | Status set to DEPRECATED; CONTEXT_DEPRECATED event published |
| `ACTIVE → RETIRED` | `emergency_retire(context_id, retired_by)` | Context must be ACTIVE; caller must be Founder | Status set to RETIRED; all ACTIVE context maps involving this context set to REVOKED; CONTEXT_RETIRED event published |
| `DEPRECATED → RETIRED` | `retire(context_id, retired_by)` | Context must be DEPRECATED; caller must be context owner or Founder | Status set to RETIRED; all ACTIVE context maps involving this context set to REVOKED; CONTEXT_RETIRED event published |

#### Prohibited Transitions

| Attempted Transition | Error Code |
|---------------------|-----------|
| `DEPRECATED → ACTIVE` | `INVALID_STATUS_TRANSITION` |
| `RETIRED → ACTIVE` | `INVALID_STATUS_TRANSITION` |
| `RETIRED → DEPRECATED` | `INVALID_STATUS_TRANSITION` |

---

### 1.2. ContextMapRecord State Machine

The ContextMapRecord tracks the lifecycle of declared integration relationships.

#### States

| State | Description |
|-------|-------------|
| `ACTIVE` | Integration relationship is declared and valid |
| `REVOKED` | Integration relationship has been revoked; cross-context access via this map is no longer permitted |

#### State Transition Diagram

```
         ┌──────────────────┐
         │                  │
         │     ACTIVE       │──────────────────────────────────►  REVOKED (terminal)
         │                  │  revoke() or cascade from context retirement
         └──────────────────┘
```

#### Transition Rules

| Transition | Trigger | Pre-conditions |
|-----------|---------|----------------|
| `ACTIVE → REVOKED` | `revoke_map(map_id, revoked_by)` | Map must be ACTIVE; caller must be source context owner or Founder |
| `ACTIVE → REVOKED` | Cascade from `CONTEXT_RETIRED` event | Either source or target context is retired |

---

### 1.3. BoundaryViolationRecord State Machine

BoundaryViolationRecords are immutable once created. They have no state transitions.

```
         ┌──────────────────┐
         │                  │
         │    RECORDED      │  (single terminal state — no transitions)
         │                  │
         └──────────────────┘
```

---

## Part 2 — Interface Contracts (P1-T02)

### 2.1. Command Interface

The Boundary Context Organelle exposes the following commands (write operations):

#### Command: RegisterContext

```typescript
interface RegisterContextCommand {
  context_id: string;           // UUID v4, caller-generated
  context_name: string;         // 1-128 chars, unique
  domain_scope: string;         // 1-256 chars
  owned_aggregates: string[];   // min 1 item
  owned_events: string[];       // min 1 item
  version: string;              // semantic version
  registered_by: string;        // subject_id UUID v4
}

interface RegisterContextResult {
  success: true;
  context: ContextRecord;
} | {
  success: false;
  error_code: 'DUPLICATE_CONTEXT_NAME' | 'AGGREGATE_OWNERSHIP_CONFLICT' | 
              'EVENT_OWNERSHIP_CONFLICT' | 'INVALID_CONTEXT_ID_FORMAT' | 
              'MISSING_REQUIRED_FIELD' | 'INSUFFICIENT_OWNERSHIP_DECLARATION';
  error_message: string;
}
```

#### Command: DeclareContextMap

```typescript
interface DeclareContextMapCommand {
  source_context_id: string;
  target_context_id: string;
  relationship_type: 'CONFORMIST' | 'ACL' | 'OPEN_HOST' | 'PUBLISHED_LANGUAGE' | 
                     'PARTNERSHIP' | 'CUSTOMER_SUPPLIER';
  integration_points: Array<{
    type: 'EVENT' | 'QUERY' | 'COMMAND';
    name: string;
    direction: 'INBOUND' | 'OUTBOUND';
  }>;
  declared_by: string;
}

interface DeclareContextMapResult {
  success: true;
  map: ContextMapRecord;
  was_idempotent: boolean;  // true if this was a duplicate declaration
} | {
  success: false;
  error_code: 'RETIRED_CONTEXT_REFERENCE' | 'SELF_REFERENTIAL_MAP' | 
              'UNDECLARED_EVENT_REFERENCE' | 'EMPTY_INTEGRATION_POINTS';
  error_message: string;
}
```

#### Command: ReportBoundaryViolation

```typescript
interface ReportBoundaryViolationCommand {
  violation_id: string;
  violating_context: string;
  target_context: string;
  violation_type: 'DIRECT_MODEL_ACCESS' | 'UNDECLARED_EVENT_CONSUMPTION' | 
                  'UNDECLARED_COMMAND_INVOCATION';
  violation_detail: string;
  detected_at: number;  // UTC milliseconds
  detected_by: string;
}

interface ReportBoundaryViolationResult {
  success: true;
  violation_id: string;
  was_idempotent: boolean;
} | {
  success: false;
  error_code: 'CONTEXT_NOT_FOUND' | 'MISSING_REQUIRED_FIELD';
  error_message: string;
}
```

#### Command: DeprecateContext

```typescript
interface DeprecateContextCommand {
  context_id: string;
  deprecated_by: string;  // subject_id
  deprecation_reason: string;
  planned_retirement_date?: number;  // UTC milliseconds, optional
}
```

#### Command: RetireContext

```typescript
interface RetireContextCommand {
  context_id: string;
  retired_by: string;  // subject_id
  retirement_reason: string;
}
```

#### Command: RevokeContextMap

```typescript
interface RevokeContextMapCommand {
  map_id: string;
  revoked_by: string;  // subject_id
  revocation_reason: string;
}
```

---

### 2.2. Query Interface

The Boundary Context Organelle exposes the following queries (read operations):

#### Query: GetContext

```typescript
interface GetContextQuery {
  context_id: string;
}

interface GetContextResult {
  found: true;
  context: ContextRecord;
} | {
  found: false;
  error_code: 'CONTEXT_NOT_FOUND';
}
```

#### Query: FindContextByName

```typescript
interface FindContextByNameQuery {
  context_name: string;
}

interface FindContextByNameResult {
  found: true;
  context: ContextRecord;
} | {
  found: false;
}
```

#### Query: ListContexts

```typescript
interface ListContextsQuery {
  status_filter?: ('ACTIVE' | 'DEPRECATED' | 'RETIRED')[];
  page?: number;
  page_size?: number;  // max 100
}

interface ListContextsResult {
  contexts: ContextRecord[];
  total_count: number;
  page: number;
  page_size: number;
}
```

#### Query: GetContextMap

```typescript
interface GetContextMapQuery {
  map_id: string;
}
```

#### Query: ListContextMaps

```typescript
interface ListContextMapsQuery {
  source_context_id?: string;
  target_context_id?: string;
  status_filter?: ('ACTIVE' | 'REVOKED')[];
  page?: number;
  page_size?: number;
}
```

#### Query: ListBoundaryViolations

```typescript
interface ListBoundaryViolationsQuery {
  violating_context_id?: string;
  target_context_id?: string;
  violation_type?: string;
  from_timestamp?: number;
  to_timestamp?: number;
  page?: number;
  page_size?: number;
}
```

---

### 2.3. Event Publication Interface

All events are published to the platform event stream with the following envelope:

```typescript
interface BoundaryContextEvent {
  event_id: string;          // UUID v4, generated by organelle
  event_type: string;        // See event catalogue
  event_version: string;     // "1.0.0"
  organelle_code: string;    // "ORG-TB-BOUNDARY_CONTEXT-v0.1.0"
  occurred_at: number;       // UTC milliseconds
  payload: object;           // Event-specific payload
}
```

---

## Part 3 — Architectural Diagram (P1-T03)

### 3.1. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BOUNDARY CONTEXT ORGANELLE                               │
│                    ORG-TB-BOUNDARY_CONTEXT-v0.1.0                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      COMMAND HANDLER LAYER                          │   │
│  │                                                                     │   │
│  │  RegisterContext  │  DeclareContextMap  │  ReportViolation  │  ...  │   │
│  └──────────┬──────────────────┬────────────────────┬───────────────┘   │
│             │                  │                    │                    │
│  ┌──────────▼──────────────────▼────────────────────▼───────────────┐   │
│  │                      DOMAIN LOGIC LAYER                           │   │
│  │                                                                   │   │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │   │
│  │  │  Context         │  │  Context Map     │  │  Boundary       │  │   │
│  │  │  Registry        │  │  Registry        │  │  Violation      │  │   │
│  │  │  Service         │  │  Service         │  │  Recorder       │  │   │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘  │   │
│  │           │                     │                      │           │   │
│  │  ┌────────▼─────────────────────▼──────────────────────▼────────┐  │   │
│  │  │                    INVARIANT ENFORCER                         │  │   │
│  │  │  INV-BC-01 through INV-BC-08 + CON-BC-01 through CON-BC-06   │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      STORAGE LAYER                                  │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │   │
│  │  │  context_records │  │  context_maps    │  │  boundary_      │   │   │
│  │  │  table           │  │  table           │  │  violations     │   │   │
│  │  │                  │  │                  │  │  table          │   │   │
│  │  └─────────────────┘  └──────────────────┘  └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      EVENT PUBLISHER                                │   │
│  │  CONTEXT_REGISTERED │ CONTEXT_DEPRECATED │ CONTEXT_RETIRED │ ...   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      QUERY HANDLER LAYER                            │   │
│  │  GetContext │ FindContextByName │ ListContexts │ ListContextMaps    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                                              │
         │ Commands/Queries                             │ Events
         ▼                                              ▼
  ┌─────────────┐                              ┌──────────────────┐
  │  Cell Layer │                              │  Platform Event  │
  │  Consumers  │                              │  Stream          │
  └─────────────┘                              └──────────────────┘
```

### 3.2. Storage Schema

#### Table: context_records

```sql
CREATE TABLE context_records (
  context_id        CHAR(36)     NOT NULL,
  context_name      VARCHAR(128) NOT NULL,
  domain_scope      VARCHAR(256) NOT NULL,
  owned_aggregates  JSON         NOT NULL,   -- string[]
  owned_events      JSON         NOT NULL,   -- string[]
  version           VARCHAR(32)  NOT NULL,
  status            ENUM('ACTIVE', 'DEPRECATED', 'RETIRED') NOT NULL DEFAULT 'ACTIVE',
  registered_at     BIGINT       NOT NULL,   -- UTC milliseconds
  registered_by     CHAR(36)     NOT NULL,
  updated_at        BIGINT       NOT NULL,   -- UTC milliseconds
  record_version    INT          NOT NULL DEFAULT 1,
  
  PRIMARY KEY (context_id),
  UNIQUE INDEX idx_context_name (context_name),
  INDEX idx_status (status)
);
```

#### Table: context_maps

```sql
CREATE TABLE context_maps (
  map_id              CHAR(36)     NOT NULL,
  source_context_id   CHAR(36)     NOT NULL,
  target_context_id   CHAR(36)     NOT NULL,
  relationship_type   ENUM('CONFORMIST', 'ACL', 'OPEN_HOST', 'PUBLISHED_LANGUAGE', 
                           'PARTNERSHIP', 'CUSTOMER_SUPPLIER') NOT NULL,
  integration_points  JSON         NOT NULL,   -- IntegrationPoint[]
  status              ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
  declared_at         BIGINT       NOT NULL,
  declared_by         CHAR(36)     NOT NULL,
  
  PRIMARY KEY (map_id),
  INDEX idx_source_context (source_context_id),
  INDEX idx_target_context (target_context_id),
  INDEX idx_status (status),
  UNIQUE INDEX idx_source_target_type (source_context_id, target_context_id, relationship_type)
);
```

#### Table: boundary_violations

```sql
CREATE TABLE boundary_violations (
  violation_id        CHAR(36)     NOT NULL,
  violating_context   CHAR(36)     NOT NULL,
  target_context      CHAR(36)     NOT NULL,
  violation_type      ENUM('DIRECT_MODEL_ACCESS', 'UNDECLARED_EVENT_CONSUMPTION', 
                           'UNDECLARED_COMMAND_INVOCATION') NOT NULL,
  violation_detail    VARCHAR(1024) NOT NULL,
  detected_at         BIGINT       NOT NULL,
  detected_by         VARCHAR(128) NOT NULL,
  
  PRIMARY KEY (violation_id),
  INDEX idx_violating_context (violating_context),
  INDEX idx_target_context (target_context),
  INDEX idx_detected_at (detected_at)
  -- NOTE: No UPDATE or DELETE permissions on this table (INV-BC-08)
);
```

### 3.3. Data Flow: Context Registration

```
Cell Layer Consumer
       │
       │ RegisterContextCommand
       ▼
Command Handler
       │
       ├─► Validate input schema
       │
       ├─► Check: context_name uniqueness (INV-BC-02)
       │
       ├─► Check: owned_aggregates exclusivity (INV-BC-03)
       │
       ├─► Check: owned_events exclusivity (INV-BC-04)
       │
       ├─► Write ContextRecord to context_records table (status=ACTIVE, record_version=1)
       │
       ├─► Publish CONTEXT_REGISTERED event to event stream
       │
       └─► Return RegisterContextResult { success: true, context: ContextRecord }
```

### 3.4. Data Flow: Boundary Violation Detection

```
Enforcement Layer (Cell or above)
       │
       │ ReportBoundaryViolationCommand
       ▼
Command Handler
       │
       ├─► Validate input schema
       │
       ├─► Check: violating_context and target_context exist
       │
       ├─► Check: violation_id not already recorded (idempotency)
       │
       ├─► Write BoundaryViolationRecord to boundary_violations table (append-only)
       │
       ├─► Publish BOUNDARY_VIOLATION_DETECTED event to event stream
       │
       └─► Return ReportBoundaryViolationResult { success: true, violation_id, was_idempotent }
```

---

**Document Version:** 0.1.0  
**Agent:** webwakaagent4  
**Date:** 2026-02-26
