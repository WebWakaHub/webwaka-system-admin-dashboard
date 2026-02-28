# EventDispatcher — Interface Contracts

## Primary Interface

```typescript
interface IEventDispatcher {
  readonly id: string;
  readonly state: EventDispatcherState;
  
  execute(command: EventDispatcherCommand): Promise<EventDispatcherResult>;
  query(query: EventDispatcherQuery): EventDispatcherQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IEventDispatcherStorage {
  save(entity: EventDispatcherEntity): Promise<void>;
  load(id: string): Promise<EventDispatcherEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IEventDispatcherEvents {
  emit(event: EventDispatcherEvent): void;
  subscribe(handler: (event: EventDispatcherEvent) => void): () => void;
}
```
