# PolicyDefinition — Interface Contracts

## Primary Interface

```typescript
interface IPolicyDefinition {
  readonly id: string;
  readonly state: PolicyDefinitionState;
  
  execute(command: PolicyDefinitionCommand): Promise<PolicyDefinitionResult>;
  query(query: PolicyDefinitionQuery): PolicyDefinitionQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IPolicyDefinitionStorage {
  save(entity: PolicyDefinitionEntity): Promise<void>;
  load(id: string): Promise<PolicyDefinitionEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IPolicyDefinitionEvents {
  emit(event: PolicyDefinitionEvent): void;
  subscribe(handler: (event: PolicyDefinitionEvent) => void): () => void;
}
```
