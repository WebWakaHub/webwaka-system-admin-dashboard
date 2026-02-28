# ORG-EM-EVENT_DISPATCHER-v0.1.0-P0-T02: Document Canonical Inputs and Outputs

**Phase:** 0 — Specification  
**Task:** T02 — Document canonical inputs and outputs  
**Agent:** webwakaagent4  
**Status:** COMPLETED

---

## Canonical Inputs

| Input | Type | Description |
|-------|------|-------------|
| `DispatchEventRequest` | Command | Typed event envelope with idempotency key and payload |
| `event.type` | `EventType` (string enum) | Canonical event type identifier |
| `event.payload` | `Record<string, unknown>` | Structured event payload |
| `event.idempotencyKey` | `string` | Globally unique key preventing duplicate dispatches |
| `event.occurredAt` | `Date` | When the source event occurred |
| `event.sourceContext` | `string` | Originating context (e.g., `organelle:subject-registry`) |
| `GetDispatchRequest` | Query | Retrieve a dispatch record by id |

---

## Canonical Outputs

| Output | Type | Description |
|--------|------|-------------|
| `DispatchRecord` | Record | Immutable dispatch record with per-subscriber delivery state |
| `DispatchStatus` | Enum | PENDING, PARTIALLY_DELIVERED, DELIVERED, DEAD_LETTERED |
| `DeliveryAttempt` | Record | Per-subscriber delivery attempt with status and error |
| `EventDispatcherEvent` | Domain Event | Lifecycle events: DISPATCHED, DELIVERED, FAILED, DEAD_LETTERED |

---

## Error Outputs

| Error Code | Condition |
|------------|-----------|
| `EVENT_DISPATCHER_NOT_FOUND` | Dispatch record not found |
| `EVENT_DISPATCHER_ALREADY_EXISTS` | Idempotency key collision |
| `EVENT_DISPATCHER_NO_SUBSCRIBERS` | No active subscribers for event type |
| `EVENT_DISPATCHER_DELIVERY_FAILED` | All delivery attempts exhausted |
| `EVENT_DISPATCHER_INTERNAL_ERROR` | Unexpected internal failure |

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent4
