# SchedulerExecutor — Interface Contracts

## Primary Interface

```typescript
interface ISchedulerExecutor {
  readonly id: string;
  readonly state: SchedulerExecutorState;
  
  execute(command: SchedulerExecutorCommand): Promise<SchedulerExecutorResult>;
  query(query: SchedulerExecutorQuery): SchedulerExecutorQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface ISchedulerExecutorStorage {
  save(entity: SchedulerExecutorEntity): Promise<void>;
  load(id: string): Promise<SchedulerExecutorEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface ISchedulerExecutorEvents {
  emit(event: SchedulerExecutorEvent): void;
  subscribe(handler: (event: SchedulerExecutorEvent) => void): () => void;
}
```
