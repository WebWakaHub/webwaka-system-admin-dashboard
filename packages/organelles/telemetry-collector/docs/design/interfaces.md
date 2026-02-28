# TelemetryCollector — Interface Contracts

## Primary Interface

```typescript
interface ITelemetryCollector {
  readonly id: string;
  readonly state: TelemetryCollectorState;
  
  execute(command: TelemetryCollectorCommand): Promise<TelemetryCollectorResult>;
  query(query: TelemetryCollectorQuery): TelemetryCollectorQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface ITelemetryCollectorStorage {
  save(entity: TelemetryCollectorEntity): Promise<void>;
  load(id: string): Promise<TelemetryCollectorEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface ITelemetryCollectorEvents {
  emit(event: TelemetryCollectorEvent): void;
  subscribe(handler: (event: TelemetryCollectorEvent) => void): () => void;
}
```
