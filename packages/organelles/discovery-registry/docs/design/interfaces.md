# DiscoveryRegistry — Interface Contracts

## Primary Interface

```typescript
interface IDiscoveryRegistry {
  readonly id: string;
  readonly state: DiscoveryRegistryState;
  
  execute(command: DiscoveryRegistryCommand): Promise<DiscoveryRegistryResult>;
  query(query: DiscoveryRegistryQuery): DiscoveryRegistryQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IDiscoveryRegistryStorage {
  save(entity: DiscoveryRegistryEntity): Promise<void>;
  load(id: string): Promise<DiscoveryRegistryEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IDiscoveryRegistryEvents {
  emit(event: DiscoveryRegistryEvent): void;
  subscribe(handler: (event: DiscoveryRegistryEvent) => void): () => void;
}
```
