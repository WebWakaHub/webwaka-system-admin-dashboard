# ResourceAllocator — Interface Contracts

## Primary Interface

```typescript
interface IResourceAllocator {
  readonly id: string;
  readonly state: ResourceAllocatorState;
  
  execute(command: ResourceAllocatorCommand): Promise<ResourceAllocatorResult>;
  query(query: ResourceAllocatorQuery): ResourceAllocatorQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IResourceAllocatorStorage {
  save(entity: ResourceAllocatorEntity): Promise<void>;
  load(id: string): Promise<ResourceAllocatorEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IResourceAllocatorEvents {
  emit(event: ResourceAllocatorEvent): void;
  subscribe(handler: (event: ResourceAllocatorEvent) => void): () => void;
}
```
