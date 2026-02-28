# ValidationEngine — Interface Contracts

## Primary Interface

```typescript
interface IValidationEngine {
  readonly id: string;
  readonly state: ValidationEngineState;
  
  execute(command: ValidationEngineCommand): Promise<ValidationEngineResult>;
  query(query: ValidationEngineQuery): ValidationEngineQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IValidationEngineStorage {
  save(entity: ValidationEngineEntity): Promise<void>;
  load(id: string): Promise<ValidationEngineEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IValidationEngineEvents {
  emit(event: ValidationEngineEvent): void;
  subscribe(handler: (event: ValidationEngineEvent) => void): () => void;
}
```
