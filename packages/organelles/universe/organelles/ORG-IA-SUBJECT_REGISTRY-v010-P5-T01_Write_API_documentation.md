# [ORG-IA-SUBJECT_REGISTRY-v0.1.0-P5-T01] Write API Documentation

**Issue:** #23
**Phase:** 5 — Documentation
**Agent:** webwakaagent4 (Engineering & Delivery)
**Execution Date:** 2026-02-26

---

## 1. Subject Registry Organelle — API Reference

### 1.1. Package

```
@webwaka/organelle-subject-registry v0.1.0
```

### 1.2. Import

```typescript
import {
  SubjectRegistry,
  ISubjectRegistry,
  SubjectType,
  SubjectStatus,
  SubjectRecord,
  RegisterSubjectRequest,
  UpdateSubjectStatusRequest,
  UpdateSubjectAttributesRequest,
  GetSubjectRequest,
  SubjectRegistryError,
  SubjectRegistryErrorCode,
  ISubjectStorage,
  ISubjectEventEmitter,
  ISubjectObservability,
} from '@webwaka/organelle-subject-registry';
```

---

## 2. ISubjectRegistry Interface

### 2.1. registerSubject

```typescript
registerSubject(request: RegisterSubjectRequest): Promise<SubjectRecord>
```

Register a new subject in the platform. Creates a SubjectRecord with a unique UUID, ACTIVE status, and version 1.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject_type` | `SubjectType` | YES | Structural classification (USER, SERVICE_ACCOUNT, API_CLIENT, SYSTEM_PROCESS) |
| `attributes` | `SubjectAttributes` | NO | Key-value map of structural identity attributes |
| `requesting_context` | `RequestingContext` | YES | Audit trail: source_system and timestamp |
| `idempotency_key` | `string` | NO | Optional key for safe retry |

**Returns:** `SubjectRecord` — The newly created subject record.

**Errors:**

| Error Code | Condition |
|-----------|-----------|
| `SUBJECT_ID_COLLISION` | Generated UUID collides with existing subject |
| `INVALID_SUBJECT_TYPE` | subject_type is null, undefined, or not a valid enum value |
| `INVALID_ATTRIBUTES` | Attributes contain prohibited keys or non-primitive values |

**Events Emitted:** `SubjectCreatedEvent`

---

### 2.2. updateSubjectStatus

```typescript
updateSubjectStatus(request: UpdateSubjectStatusRequest): Promise<SubjectRecord>
```

Update the lifecycle status of an existing subject. Enforces the state machine transition rules.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject_id` | `string` | YES | UUID of the subject to update |
| `new_status` | `SubjectStatus` | YES | Target status |
| `reason` | `string` | NO | Human-readable reason for the transition |
| `requesting_context` | `RequestingContext` | YES | Audit trail |
| `expected_version` | `number` | YES | Must match current record version |

**Returns:** `SubjectRecord` — The updated subject record with incremented version.

**Errors:**

| Error Code | Condition |
|-----------|-----------|
| `SUBJECT_NOT_FOUND` | No subject exists with the given subject_id |
| `TERMINAL_STATE_MUTATION` | Subject is in ARCHIVED or DELETED state |
| `INVALID_STATUS_TRANSITION` | Transition not permitted by state machine |
| `CONCURRENT_MODIFICATION_CONFLICT` | expected_version does not match current version |

**Events Emitted:** `SubjectStatusChangedEvent`, plus `SubjectArchivedEvent` or `SubjectDeletedEvent` for terminal transitions.

---

### 2.3. updateSubjectAttributes

```typescript
updateSubjectAttributes(request: UpdateSubjectAttributesRequest): Promise<SubjectRecord>
```

Update the structural identity attributes of an existing subject.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject_id` | `string` | YES | UUID of the subject to update |
| `attributes` | `SubjectAttributes` | YES | New attribute key-value map (replaces existing) |
| `requesting_context` | `RequestingContext` | YES | Audit trail |
| `expected_version` | `number` | YES | Must match current record version |

**Returns:** `SubjectRecord` — The updated subject record.

**Errors:**

| Error Code | Condition |
|-----------|-----------|
| `SUBJECT_NOT_FOUND` | No subject exists with the given subject_id |
| `TERMINAL_STATE_MUTATION` | Subject is in ARCHIVED or DELETED state |
| `INVALID_ATTRIBUTES` | Attributes contain prohibited keys or non-primitive values |
| `CONCURRENT_MODIFICATION_CONFLICT` | expected_version does not match current version |

**Events Emitted:** `SubjectAttributesUpdatedEvent`

---

### 2.4. getSubject

```typescript
getSubject(request: GetSubjectRequest): Promise<SubjectRecord>
```

Retrieve a subject record by its unique identifier.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject_id` | `string` | YES | UUID of the subject to retrieve |

**Returns:** `SubjectRecord` — The subject record.

**Errors:**

| Error Code | Condition |
|-----------|-----------|
| `SUBJECT_NOT_FOUND` | No subject exists with the given subject_id |

---

## 3. State Machine

### Valid Transitions

| From | To | Terminal |
|------|----|---------|
| ACTIVE | SUSPENDED | No |
| ACTIVE | ARCHIVED | Yes |
| ACTIVE | DELETED | Yes |
| SUSPENDED | ACTIVE | No |
| SUSPENDED | ARCHIVED | Yes |
| SUSPENDED | DELETED | Yes |

### Terminal States

ARCHIVED and DELETED are permanent and irreversible. No mutations (status or attribute) are permitted on subjects in terminal states.

---

## 4. Error Codes Reference

| Code | Description |
|------|-------------|
| `SUBJECT_ID_COLLISION` | UUID collision during registration |
| `INVALID_SUBJECT_TYPE` | Invalid subject type value |
| `SUBJECT_NOT_FOUND` | Subject does not exist |
| `INVALID_STATUS_TRANSITION` | State machine rejects the transition |
| `CONCURRENT_MODIFICATION_CONFLICT` | Optimistic concurrency version mismatch |
| `INVALID_ATTRIBUTES` | Prohibited keys or invalid value types |
| `TERMINAL_STATE_MUTATION` | Mutation on terminal state subject |
| `IMMUTABLE_FIELD_VIOLATION` | Attempt to modify immutable field |

---

## 5. Dependency Injection

The `SubjectRegistry` class requires three injected dependencies:

```typescript
const registry = new SubjectRegistry(
  storage,        // ISubjectStorage — persistence layer
  eventEmitter,   // ISubjectEventEmitter — event bus
  observability   // ISubjectObservability — metrics/logs/traces
);
```

All three interfaces are technology-agnostic and must be implemented by the Cell layer.

**Unblocks:** #24

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
