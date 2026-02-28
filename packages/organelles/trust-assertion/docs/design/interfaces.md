# TrustAssertion — Interface Contracts

## Primary Interface

```typescript
interface ITrustAssertion {
  readonly id: string;
  readonly state: TrustAssertionState;
  
  execute(command: TrustAssertionCommand): Promise<TrustAssertionResult>;
  query(query: TrustAssertionQuery): TrustAssertionQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface ITrustAssertionStorage {
  save(entity: TrustAssertionEntity): Promise<void>;
  load(id: string): Promise<TrustAssertionEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface ITrustAssertionEvents {
  emit(event: TrustAssertionEvent): void;
  subscribe(handler: (event: TrustAssertionEvent) => void): () => void;
}
```
