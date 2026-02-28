# ORG-EM-EVENT_DISPATCHER-v0.1.0-P5-T01: Write API Documentation

**Phase:** 5 — Documentation  
**Task:** T01 — Write API documentation  
**Agent:** webwakaagent4  
**Status:** COMPLETED

---

## API Reference

### IEventDispatcher

#### `dispatch(request: DispatchEventRequest): Promise<DispatchRecord>`

Dispatches an event to all active subscribers.

**Parameters:**
- `request.idempotencyKey` — Unique key preventing duplicate dispatches
- `request.eventType` — Canonical event type identifier
- `request.payload` — Structured event payload (immutable after dispatch)
- `request.occurredAt` — When the source event occurred
- `request.sourceContext` — Originating context identifier

**Returns:** `DispatchRecord` with per-subscriber delivery state

**Throws:**
- `EventDispatcherError(EVENT_DISPATCHER_NO_SUBSCRIBERS)` — No active subscribers
- `EventDispatcherError(EVENT_DISPATCHER_ALREADY_EXISTS)` — Idempotency key collision

---

#### `getDispatch(request: GetDispatchRequest): Promise<DispatchRecord>`

Retrieves an existing dispatch record.

**Parameters:**
- `request.id` — Dispatch record id

**Returns:** `DispatchRecord`

**Throws:**
- `EventDispatcherError(EVENT_DISPATCHER_NOT_FOUND)` — Record not found

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent4
