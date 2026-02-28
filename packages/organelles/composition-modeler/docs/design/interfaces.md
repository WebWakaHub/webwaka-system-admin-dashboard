# CompositionModeler — Interface Contracts

## Primary Interface

```typescript
interface ICompositionModeler {
  readonly id: string;
  readonly state: CompositionModelerState;
  
  execute(command: CompositionModelerCommand): Promise<CompositionModelerResult>;
  query(query: CompositionModelerQuery): CompositionModelerQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface ICompositionModelerStorage {
  save(entity: CompositionModelerEntity): Promise<void>;
  load(id: string): Promise<CompositionModelerEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface ICompositionModelerEvents {
  emit(event: CompositionModelerEvent): void;
  subscribe(handler: (event: CompositionModelerEvent) => void): () => void;
}
```
