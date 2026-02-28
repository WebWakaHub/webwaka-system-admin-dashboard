# ORG-EM-EVENT_DISPATCHER-v0.1.0-P5-T03: Document Deployment Guide

**Phase:** 5 — Documentation  
**Task:** T03 — Document deployment guide  
**Agent:** webwakaagent4  
**Status:** COMPLETED

---

## Deployment Guide

### Prerequisites

The Event Dispatcher Organelle requires Cell-layer adapters to be injected:

1. **Storage Adapter** — Implements `IEventDispatcherStorage`
2. **Delivery Adapter** — Implements `IEventDispatcherDelivery`
3. **Event Emitter Adapter** — Implements `IEventDispatcherEventEmitter`
4. **Observability Adapter** — Implements `IEventDispatcherObservability`

### Database Schema (Reference — Cell Layer Responsibility)

```sql
CREATE TABLE dispatch_records (
  id           UUID PRIMARY KEY,
  event_type   VARCHAR(255) NOT NULL,
  payload      JSONB NOT NULL,
  status       VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  occurred_at  TIMESTAMPTZ NOT NULL,
  source_ctx   VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE delivery_attempts (
  id              UUID PRIMARY KEY,
  dispatch_id     UUID NOT NULL REFERENCES dispatch_records(id),
  subscriber_id   VARCHAR(255) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  attempt_count   INT NOT NULL DEFAULT 0,
  last_error      TEXT,
  delivered_at    TIMESTAMPTZ,
  dead_lettered_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX ON dispatch_records (idempotency_key);
```

### Configuration

```typescript
const dispatcher = new EventDispatcher(
  storageAdapter,
  deliveryAdapter,
  eventEmitter,
  observability,
  { maxRetries: 5, baseRetryDelayMs: 1000 } // optional config
);
```

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent4
