# [ORG-DP-RECORD_STORE-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #62
**Phase:** 0 — Specification
**Agent:** webwakaagent4 (Engineering & Delivery)
**Execution Date:** 2026-02-26

---

## 1. Canonical Inputs

### 1.1. CreateRecordRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | YES | Named collection to store the record in |
| `record_id` | `string` | NO | Client-provided unique ID; auto-generated UUID if omitted |
| `data` | `Record<string, unknown>` | YES | Structured record payload (JSON-serializable) |
| `schema_version` | `string` | NO | Schema version to validate against (if collection has schema) |
| `requesting_context` | `RequestingContext` | YES | Audit trail: source_system, timestamp |
| `idempotency_key` | `string` | NO | Idempotent retry key |

### 1.2. GetRecordRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | YES | Collection name |
| `record_id` | `string` | YES | Unique record identifier |

### 1.3. UpdateRecordRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | YES | Collection name |
| `record_id` | `string` | YES | Unique record identifier |
| `data` | `Record<string, unknown>` | YES | Updated record payload (full replacement) |
| `expected_version` | `number` | YES | Optimistic concurrency version |
| `requesting_context` | `RequestingContext` | YES | Audit trail |

### 1.4. DeleteRecordRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | YES | Collection name |
| `record_id` | `string` | YES | Unique record identifier |
| `expected_version` | `number` | YES | Optimistic concurrency version |
| `soft_delete` | `boolean` | NO | If true (default), mark as deleted; if false, permanently remove |
| `requesting_context` | `RequestingContext` | YES | Audit trail |

### 1.5. ListRecordsRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection` | `string` | YES | Collection name |
| `cursor` | `string` | NO | Pagination cursor for next page |
| `limit` | `number` | NO | Max records per page (default: 50, max: 200) |

### 1.6. CreateCollectionRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `collection_name` | `string` | YES | Unique collection name (alphanumeric + underscores) |
| `schema` | `RecordSchema` | NO | Optional JSON Schema for record validation |
| `requesting_context` | `RequestingContext` | YES | Audit trail |

### 1.7. RequestingContext (shared)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source_system` | `string` | YES | Identifier of the calling system |
| `timestamp` | `string (ISO 8601)` | YES | Request timestamp |

---

## 2. Canonical Outputs

### 2.1. RecordEntry

| Field | Type | Description |
|-------|------|-------------|
| `collection` | `string` | Collection the record belongs to |
| `record_id` | `string` | Unique record identifier (UUID) |
| `data` | `Record<string, unknown>` | Record payload |
| `version` | `number` | Monotonically increasing version (starts at 1) |
| `created_at` | `string (ISO 8601)` | Creation timestamp |
| `updated_at` | `string (ISO 8601)` | Last modification timestamp |
| `deleted` | `boolean` | Soft-delete flag |
| `schema_version` | `string | null` | Schema version used for validation |

### 2.2. RecordPage

| Field | Type | Description |
|-------|------|-------------|
| `collection` | `string` | Collection name |
| `records` | `RecordEntry[]` | Array of record entries |
| `next_cursor` | `string | null` | Cursor for next page (null if last page) |
| `total_count` | `number` | Total records in collection (approximate) |

### 2.3. CollectionInfo

| Field | Type | Description |
|-------|------|-------------|
| `collection_name` | `string` | Collection name |
| `schema` | `RecordSchema | null` | Schema definition if declared |
| `record_count` | `number` | Approximate number of records |
| `created_at` | `string (ISO 8601)` | Collection creation timestamp |

---

## 3. Lifecycle Events (Outputs)

| Event | Emitted When | Payload |
|-------|-------------|---------|
| `RecordCreatedEvent` | After successful record creation | collection, record_id, version, requesting_context |
| `RecordUpdatedEvent` | After successful record update | collection, record_id, old_version, new_version, requesting_context |
| `RecordDeletedEvent` | After successful record deletion | collection, record_id, version, soft_delete, requesting_context |
| `CollectionCreatedEvent` | After successful collection creation | collection_name, has_schema, requesting_context |

---

## 4. Error Codes (Outputs)

| Error Code | Condition |
|-----------|-----------|
| `COLLECTION_NOT_FOUND` | Named collection does not exist |
| `COLLECTION_ALREADY_EXISTS` | Collection name already taken |
| `RECORD_NOT_FOUND` | No record with given collection + record_id |
| `RECORD_ALREADY_EXISTS` | Record ID collision within collection |
| `CONCURRENT_MODIFICATION_CONFLICT` | expected_version does not match current version |
| `SCHEMA_VALIDATION_FAILED` | Record data does not conform to collection schema |
| `INVALID_COLLECTION_NAME` | Collection name contains invalid characters |
| `INVALID_RECORD_DATA` | Record data is null, not serializable, or exceeds size limit |
| `RECORD_DELETED` | Attempted operation on a soft-deleted record |

**Unblocks:** #63

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
