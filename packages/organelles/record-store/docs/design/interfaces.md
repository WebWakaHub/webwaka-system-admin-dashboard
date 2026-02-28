# RecordStore — Interface Contracts

## Primary Interface

```typescript
interface IRecordStore {
  readonly id: string;
  readonly state: RecordStoreState;
  
  execute(command: RecordStoreCommand): Promise<RecordStoreResult>;
  query(query: RecordStoreQuery): RecordStoreQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IRecordStoreStorage {
  save(entity: RecordStoreEntity): Promise<void>;
  load(id: string): Promise<RecordStoreEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IRecordStoreEvents {
  emit(event: RecordStoreEvent): void;
  subscribe(handler: (event: RecordStoreEvent) => void): () => void;
}
```
