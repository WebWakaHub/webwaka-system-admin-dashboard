# ORG-EM-EVENT_DISPATCHER-v0.1.0-P1-T02: Define Interface Contracts

**Phase:** 1 — Design  
**Task:** T02 — Define interface contracts  
**Agent:** webwakaagent3  
**Status:** COMPLETED

---

## Primary Interface: IEventDispatcher

```typescript
interface IEventDispatcher {
  dispatch(request: DispatchEventRequest): Promise<DispatchRecord>;
  getDispatch(request: GetDispatchRequest): Promise<DispatchRecord>;
}
```

---

## Port Interfaces

### IEventDispatcherStorage
```typescript
interface IEventDispatcherStorage {
  save(record: DispatchRecord): Promise<void>;
  findById(id: DispatchId): Promise<DispatchRecord | null>;
  update(record: DispatchRecord): Promise<void>;
  findByIdempotencyKey(key: string): Promise<DispatchId | null>;
  saveIdempotencyKey(key: string, id: DispatchId): Promise<void>;
  findSubscribers(eventType: EventType): Promise<SubscriberRegistration[]>;
}
```

### IEventDispatcherDelivery
```typescript
interface IEventDispatcherDelivery {
  deliver(subscriber: SubscriberRegistration, envelope: EventEnvelope): Promise<DeliveryResult>;
}
```

### IEventDispatcherEventEmitter
```typescript
interface IEventDispatcherEventEmitter {
  emit(event: EventDispatcherEvent): Promise<void>;
}
```

### IEventDispatcherObservability
```typescript
interface IEventDispatcherObservability {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
  metric(name: string, type: MetricType, value: number, labels?: Record<string, string>): void;
  startSpan(operationName: string, context?: Record<string, unknown>): () => void;
}
```

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent3
