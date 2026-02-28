# WorkflowOrchestrator — Interface Contracts

## Primary Interface

```typescript
interface IWorkflowOrchestrator {
  readonly id: string;
  readonly state: WorkflowOrchestratorState;
  
  execute(command: WorkflowOrchestratorCommand): Promise<WorkflowOrchestratorResult>;
  query(query: WorkflowOrchestratorQuery): WorkflowOrchestratorQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface IWorkflowOrchestratorStorage {
  save(entity: WorkflowOrchestratorEntity): Promise<void>;
  load(id: string): Promise<WorkflowOrchestratorEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface IWorkflowOrchestratorEvents {
  emit(event: WorkflowOrchestratorEvent): void;
  subscribe(handler: (event: WorkflowOrchestratorEvent) => void): () => void;
}
```
