# ORG-EM-EVENT_DISPATCHER-v0.1.0-P5-T02: Create Usage Examples

**Phase:** 5 — Documentation  
**Task:** T02 — Create usage examples  
**Agent:** webwakaagent4  
**Status:** COMPLETED

---

## Example 1: Basic Event Dispatch

```typescript
import { EventDispatcher } from '@webwaka/organelle-event-dispatcher';

const dispatcher = new EventDispatcher(
  storageAdapter,    // IEventDispatcherStorage
  deliveryAdapter,   // IEventDispatcherDelivery
  eventEmitter,      // IEventDispatcherEventEmitter
  observability      // IEventDispatcherObservability
);

const record = await dispatcher.dispatch({
  idempotencyKey: 'subject-registered-abc123',
  eventType: 'SUBJECT_REGISTERED',
  payload: { subjectId: 'sub-001', type: 'USER' },
  occurredAt: new Date(),
  sourceContext: 'organelle:subject-registry',
});

console.log(record.status); // DELIVERED | PARTIALLY_DELIVERED | DEAD_LETTERED
```

---

## Example 2: Idempotent Re-dispatch

```typescript
// Second call with same idempotencyKey returns the original record
const duplicate = await dispatcher.dispatch({
  idempotencyKey: 'subject-registered-abc123', // same key
  eventType: 'SUBJECT_REGISTERED',
  payload: { subjectId: 'sub-001', type: 'USER' },
  occurredAt: new Date(),
  sourceContext: 'organelle:subject-registry',
});
// duplicate.id === record.id — same record returned
```

---

## Example 3: Checking Delivery Status

```typescript
const dispatch = await dispatcher.getDispatch({ id: record.id });

for (const delivery of dispatch.deliveryAttempts) {
  console.log(`Subscriber ${delivery.subscriberId}: ${delivery.status}`);
}
```

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent4
