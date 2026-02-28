# SUBJECT REGISTRY ORGANELLE — DESIGN

**Design Version:** 0.1.0  
**Layer:** Organelle  
**Category:** Identity & Access  
**Phase:** 1 — Design  
**State:** Proposed  
**Specification Reference:** SUBJECT_REGISTRY_ORGANELLE.md v0.1.0

---

## 1. Data Model Structure

The Subject Registry Organelle maintains a structural data model for subject records. This model is abstract and technology-agnostic.

### 1.1. Subject Record

The core entity is the **Subject Record**, which contains the following structural fields:

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `subject_id` | Identifier (UUID) | Immutable, Unique, Non-null | Globally unique identifier for the subject |
| `subject_type` | Enumeration | Non-null, One of: `USER`, `SERVICE_ACCOUNT`, `API_CLIENT`, `SYSTEM_PROCESS` | Type classification of the subject |
| `status` | Enumeration | Non-null, One of: `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `DELETED` | Current lifecycle status |
| `attributes` | Key-Value Map | Optional | Structural identity attributes (e.g., `display_name`, `email`, `external_id`) |
| `created_at` | Timestamp | Immutable, Non-null | Timestamp of subject creation (UTC) |
| `updated_at` | Timestamp | Non-null | Timestamp of last update (UTC) |
| `version` | Integer | Non-null, Monotonically increasing | Record version for optimistic concurrency control |

### 1.2. Subject Type Enumeration

The `subject_type` field is constrained to one of the following values:

- **USER:** Represents a human user
- **SERVICE_ACCOUNT:** Represents a non-human service identity
- **API_CLIENT:** Represents an external API consumer
- **SYSTEM_PROCESS:** Represents an internal system process or daemon

### 1.3. Status Enumeration

The `status` field is constrained to one of the following values:

- **ACTIVE:** Subject is active and operational
- **SUSPENDED:** Subject is temporarily suspended (may be reactivated)
- **ARCHIVED:** Subject is archived (read-only, no longer operational)
- **DELETED:** Subject is marked for deletion (soft delete)

### 1.4. Attributes Structure

The `attributes` field is a flexible key-value map that stores structural identity attributes. Attributes are optional and extensible. Common attributes include:

- `display_name` (string): Human-readable display name
- `email` (string): Email address (if applicable)
- `external_id` (string): External system identifier (if federated)

**Constraints:**
- Attribute keys must be strings
- Attribute values must be primitive types (string, number, boolean)
- No nested objects or arrays
- No sensitive data (e.g., passwords, tokens) allowed in attributes

---

## 2. Subject ID Format Constraints

The `subject_id` is the canonical, immutable identifier for a subject. It must adhere to the following constraints:

### 2.1. Format

- **Type:** UUID (Universally Unique Identifier)
- **Version:** UUID v4 (random) or UUID v7 (time-ordered)
- **Representation:** Canonical string format (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### 2.2. Immutability

Once assigned, the `subject_id` **MUST NOT** be changed. It is the stable reference for the subject across its entire lifecycle.

### 2.3. Uniqueness

The `subject_id` **MUST** be globally unique within the WebWaka platform. No two subjects may share the same `subject_id`.

### 2.4. Public Identifier

The `subject_id` is considered a **public identifier** and may be exposed in logs, APIs, and events. It **MUST NOT** contain sensitive information.

### 2.5. Generation

`subject_id` generation is performed by the Subject Registry Organelle at the time of subject registration. The generation mechanism must guarantee uniqueness and randomness (or time-ordering, if UUID v7 is used).

---

## 3. State Machine Diagram (Textual)

The Subject Registry Organelle enforces a state machine for subject lifecycle status transitions.

### 3.1. States

- **ACTIVE**
- **SUSPENDED**
- **ARCHIVED**
- **DELETED**

### 3.2. Valid Transitions

```
ACTIVE → SUSPENDED
ACTIVE → ARCHIVED
ACTIVE → DELETED

SUSPENDED → ACTIVE
SUSPENDED → ARCHIVED
SUSPENDED → DELETED

ARCHIVED → (terminal state, no transitions allowed)

DELETED → (terminal state, no transitions allowed)
```

### 3.3. Transition Rules

| From State | To State | Allowed | Notes |
|------------|----------|---------|-------|
| ACTIVE | SUSPENDED | ✅ Yes | Temporary suspension |
| ACTIVE | ARCHIVED | ✅ Yes | Permanent archival |
| ACTIVE | DELETED | ✅ Yes | Soft deletion |
| SUSPENDED | ACTIVE | ✅ Yes | Reactivation |
| SUSPENDED | ARCHIVED | ✅ Yes | Permanent archival from suspended state |
| SUSPENDED | DELETED | ✅ Yes | Soft deletion from suspended state |
| ARCHIVED | ACTIVE | ❌ No | Terminal state |
| ARCHIVED | SUSPENDED | ❌ No | Terminal state |
| ARCHIVED | DELETED | ❌ No | Terminal state |
| DELETED | ACTIVE | ❌ No | Terminal state |
| DELETED | SUSPENDED | ❌ No | Terminal state |
| DELETED | ARCHIVED | ❌ No | Terminal state |

### 3.4. Initial State

All subjects begin in the **ACTIVE** state upon registration.

---

## 4. API Surface (Structural Operations)

The Subject Registry Organelle exposes the following structural operations. These are abstract operations, not implementation-specific APIs.

### 4.1. Register Subject

**Operation:** `RegisterSubject`

**Input:**
- `subject_type` (Enumeration): Type of subject to register
- `attributes` (Key-Value Map): Optional identity attributes

**Output:**
- `subject_record` (Subject Record): Newly created subject record

**Behavior:**
- Generate a unique `subject_id`
- Set `status` to `ACTIVE`
- Set `created_at` and `updated_at` to current timestamp
- Set `version` to 1
- Store subject record
- Emit `SubjectCreated` event

**Failure Modes:**
- Invalid `subject_type` → Error: `INVALID_SUBJECT_TYPE`
- Subject ID collision (extremely rare) → Error: `SUBJECT_ID_COLLISION`

---

### 4.2. Get Subject

**Operation:** `GetSubject`

**Input:**
- `subject_id` (Identifier): Subject ID to retrieve

**Output:**
- `subject_record` (Subject Record): Subject record if found
- `not_found` (Boolean): True if subject does not exist

**Behavior:**
- Lookup subject record by `subject_id`
- Return subject record if found
- Return `not_found` if subject does not exist

**Failure Modes:**
- Subject not found → Return `not_found = true`

---

### 4.3. Update Subject Status

**Operation:** `UpdateSubjectStatus`

**Input:**
- `subject_id` (Identifier): Subject ID to update
- `new_status` (Enumeration): New status to transition to
- `reason` (String, optional): Reason for status change
- `expected_version` (Integer): Expected current version (for optimistic concurrency control)

**Output:**
- `subject_record` (Subject Record): Updated subject record

**Behavior:**
- Lookup subject record by `subject_id`
- Validate status transition against state machine rules
- Check `expected_version` matches current `version`
- Update `status` to `new_status`
- Increment `version`
- Update `updated_at` to current timestamp
- Store updated subject record
- Emit `SubjectStatusChanged` event

**Failure Modes:**
- Subject not found → Error: `SUBJECT_NOT_FOUND`
- Invalid status transition → Error: `INVALID_STATUS_TRANSITION`
- Version mismatch → Error: `CONCURRENT_MODIFICATION_CONFLICT`

---

### 4.4. Update Subject Attributes

**Operation:** `UpdateSubjectAttributes`

**Input:**
- `subject_id` (Identifier): Subject ID to update
- `attributes` (Key-Value Map): New or updated attributes
- `expected_version` (Integer): Expected current version (for optimistic concurrency control)

**Output:**
- `subject_record` (Subject Record): Updated subject record

**Behavior:**
- Lookup subject record by `subject_id`
- Check `expected_version` matches current `version`
- Merge `attributes` with existing attributes (new keys added, existing keys updated)
- Increment `version`
- Update `updated_at` to current timestamp
- Store updated subject record
- Emit `SubjectAttributesUpdated` event

**Failure Modes:**
- Subject not found → Error: `SUBJECT_NOT_FOUND`
- Version mismatch → Error: `CONCURRENT_MODIFICATION_CONFLICT`

---

## 5. Internal Consistency Rules

The Subject Registry Organelle enforces the following internal consistency rules:

### 5.1. Subject ID Uniqueness

Every `subject_id` must be globally unique. The organelle must prevent duplicate `subject_id` values.

### 5.2. Subject Type Validity

The `subject_type` field must always be one of the defined enumeration values. Invalid types are rejected.

### 5.3. Status Validity

The `status` field must always be one of the defined enumeration values. Invalid statuses are rejected.

### 5.4. Status Transition Validity

Status transitions must follow the state machine rules defined in Section 3. Invalid transitions are rejected.

### 5.5. Immutability of Subject ID

Once assigned, the `subject_id` field must never be modified. Any attempt to change `subject_id` is rejected.

### 5.6. Immutability of Created At

The `created_at` field must never be modified after subject registration.

### 5.7. Version Monotonicity

The `version` field must monotonically increase with each update. Version decrements or resets are prohibited.

### 5.8. Updated At Freshness

The `updated_at` field must be updated to the current timestamp on every modification.

---

## 6. Concurrency Model (Primitive-Level)

The Subject Registry Organelle uses **optimistic concurrency control** to handle concurrent modifications.

### 6.1. Optimistic Concurrency Control

Each subject record includes a `version` field that is incremented on every update. When updating a subject, the caller must provide the `expected_version`. If the `expected_version` does not match the current `version`, the update is rejected with a `CONCURRENT_MODIFICATION_CONFLICT` error.

### 6.2. Conflict Resolution

Conflicts are **not** automatically resolved by the organelle. The caller is responsible for:
1. Detecting the conflict (via `CONCURRENT_MODIFICATION_CONFLICT` error)
2. Re-reading the subject record
3. Re-applying the desired changes
4. Retrying the update with the new `expected_version`

### 6.3. Read Consistency

Subject record reads are **eventually consistent**. There is no guarantee that a read immediately reflects the most recent write. However, the organelle guarantees that:
- Reads of the same subject from the same client will be monotonically consistent
- Writes are durably stored before acknowledgment

### 6.4. Write Atomicity

Each write operation (register, update status, update attributes) is **atomic**. Either the entire operation succeeds, or it fails with no partial state changes.

---

## 7. Event Emission Structure

The Subject Registry Organelle emits events for all significant lifecycle changes. Events are structural and domain-agnostic.

### 7.1. Event Schema

All events share a common structure:

| Field Name | Type | Description |
|------------|------|-------------|
| `event_id` | Identifier (UUID) | Unique identifier for the event |
| `event_type` | String | Type of event (e.g., `SubjectCreated`) |
| `subject_id` | Identifier (UUID) | Subject ID associated with the event |
| `timestamp` | Timestamp (UTC) | When the event occurred |
| `payload` | Object | Event-specific payload |

### 7.2. Event Types

#### 7.2.1. SubjectCreated

Emitted when a new subject is registered.

**Payload:**
```
{
  "subject_id": "<UUID>",
  "subject_type": "<ENUM>",
  "status": "ACTIVE",
  "attributes": { ... },
  "created_at": "<ISO8601 timestamp>"
}
```

#### 7.2.2. SubjectStatusChanged

Emitted when a subject's status changes.

**Payload:**
```
{
  "subject_id": "<UUID>",
  "old_status": "<ENUM>",
  "new_status": "<ENUM>",
  "reason": "<string>",
  "changed_at": "<ISO8601 timestamp>"
}
```

#### 7.2.3. SubjectAttributesUpdated

Emitted when a subject's attributes are updated.

**Payload:**
```
{
  "subject_id": "<UUID>",
  "updated_attributes": { ... },
  "updated_at": "<ISO8601 timestamp>"
}
```

#### 7.2.4. SubjectArchived

Emitted when a subject is archived.

**Payload:**
```
{
  "subject_id": "<UUID>",
  "archived_at": "<ISO8601 timestamp>"
}
```

#### 7.2.5. SubjectDeleted

Emitted when a subject is deleted.

**Payload:**
```
{
  "subject_id": "<UUID>",
  "deleted_at": "<ISO8601 timestamp>"
}
```

### 7.3. Event Delivery Guarantees

- **At-least-once delivery:** Events may be delivered more than once. Consumers must be idempotent.
- **Ordering:** Events for the same `subject_id` are delivered in the order they were emitted.
- **Durability:** Events are durably stored before acknowledgment of the triggering operation.

---

## 8. Observability Mapping

The Subject Registry Organelle provides observability hooks for metrics, logs, and traces.

### 8.1. Metrics

The following metrics are exposed:

| Metric Name | Type | Description |
|-------------|------|-------------|
| `subject_registry.registrations.total` | Counter | Total number of subjects registered |
| `subject_registry.registrations.rate` | Gauge | Subjects registered per second |
| `subject_registry.lookups.total` | Counter | Total number of subject lookups |
| `subject_registry.lookups.rate` | Gauge | Subject lookups per second |
| `subject_registry.status_changes.total` | Counter | Total number of status changes |
| `subject_registry.status_changes.rate` | Gauge | Status changes per second |
| `subject_registry.subjects.active` | Gauge | Number of subjects in ACTIVE status |
| `subject_registry.subjects.suspended` | Gauge | Number of subjects in SUSPENDED status |
| `subject_registry.subjects.archived` | Gauge | Number of subjects in ARCHIVED status |
| `subject_registry.subjects.deleted` | Gauge | Number of subjects in DELETED status |
| `subject_registry.errors.total` | Counter | Total number of errors (by error code) |

### 8.2. Logs

The following log entries are emitted:

| Log Entry | Level | When | Fields |
|-----------|-------|------|--------|
| Subject Registered | INFO | Subject is registered | `subject_id`, `subject_type`, `timestamp` |
| Subject Status Changed | INFO | Status changes | `subject_id`, `old_status`, `new_status`, `reason`, `timestamp` |
| Subject Attributes Updated | INFO | Attributes updated | `subject_id`, `updated_keys`, `timestamp` |
| Subject Lookup | DEBUG | Subject is looked up | `subject_id`, `timestamp`, `found` |
| Error Occurred | ERROR | Any error occurs | `error_code`, `subject_id`, `message`, `timestamp` |

### 8.3. Traces

The following operations are traced:

- `RegisterSubject`
- `GetSubject`
- `UpdateSubjectStatus`
- `UpdateSubjectAttributes`

Each trace includes:
- Operation name
- `subject_id` (if applicable)
- Duration
- Success/failure status
- Error code (if failure)

---

## 9. Storage Abstraction Interface

The Subject Registry Organelle defines an abstract storage interface. This interface is technology-agnostic and does not specify a database engine.

### 9.1. Storage Operations

The storage abstraction must support the following operations:

#### 9.1.1. Store Subject

**Operation:** `StoreSubject`

**Input:**
- `subject_record` (Subject Record)

**Output:**
- Success/failure indicator

**Behavior:**
- Persist the subject record
- Ensure `subject_id` uniqueness
- Return success if stored, failure if `subject_id` collision

---

#### 9.1.2. Retrieve Subject

**Operation:** `RetrieveSubject`

**Input:**
- `subject_id` (Identifier)

**Output:**
- `subject_record` (Subject Record) if found
- `not_found` (Boolean) if not found

**Behavior:**
- Lookup subject record by `subject_id`
- Return subject record if found
- Return `not_found` if not found

---

#### 9.1.3. Update Subject

**Operation:** `UpdateSubject`

**Input:**
- `subject_id` (Identifier)
- `expected_version` (Integer)
- `updated_record` (Subject Record)

**Output:**
- Success/failure indicator
- `version_mismatch` (Boolean) if version conflict

**Behavior:**
- Lookup subject record by `subject_id`
- Check if current `version` matches `expected_version`
- If match, update record and return success
- If mismatch, return `version_mismatch = true`

---

#### 9.1.4. Query Subjects by Status

**Operation:** `QuerySubjectsByStatus`

**Input:**
- `status` (Enumeration)

**Output:**
- List of `subject_id` values matching the status

**Behavior:**
- Return all subjects with the specified status
- Used for metrics and observability

---

### 9.2. Storage Constraints

- **Durability:** All writes must be durable before acknowledgment
- **Consistency:** Reads must be monotonically consistent per client
- **Isolation:** Concurrent updates must be serializable (via optimistic concurrency control)
- **Availability:** Storage must be highly available (implementation-specific)

### 9.3. No Database-Specific Logic

The organelle **MUST NOT** specify:
- SQL vs NoSQL
- Relational vs document-oriented
- Specific database engines (e.g., PostgreSQL, MongoDB, DynamoDB)
- Indexing strategies
- Partitioning strategies
- Replication strategies

These are implementation details outside the organelle design.

---

## 10. Zero Cross-Category Dependencies Confirmation

The Subject Registry Organelle has **zero cross-category dependencies**.

### 10.1. No Dependencies on Security & Trust

The organelle does **NOT** depend on:
- Credential Vault Organelle
- Token Issuance Organelle
- Risk Scoring Organelle
- Encryption Organelle

### 10.2. No Dependencies on Tenancy & Boundary

The organelle does **NOT** depend on:
- Tenant Registry Organelle
- Workspace Boundary Organelle

### 10.3. No Dependencies on Relationship & Graph

The organelle does **NOT** depend on:
- Relationship Modeling Organelle
- Graph Traversal Organelle

### 10.4. No Dependencies on Configuration & Policy

The organelle does **NOT** depend on:
- Policy Engine Organelle
- Configuration Registry Organelle

### 10.5. No Dependencies on Other Categories

The organelle does **NOT** depend on any organelle outside the **Identity & Access** category.

### 10.6. Potential Intra-Category Dependencies

Within the **Identity & Access** category, the organelle may depend on:
- **None declared at this time**

If future dependencies are required (e.g., Subject Type Registry Organelle), they must be explicitly declared and audited.

---

## Status

**Current State:** Proposed  
**Phase:** 1 — Design  
**Next Phase:** Phase 2 — Architecture (pending approval)  
**Specification Reference:** SUBJECT_REGISTRY_ORGANELLE.md v0.1.0

---

## Ratification

**Status:** Pending  
**Authority:** Founder (webwaka007)  
**Date:** TBD

---
