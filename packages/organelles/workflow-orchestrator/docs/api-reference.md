# WorkflowOrchestrator — API Reference

## Types

### WorkflowOrchestratorConfig
```typescript
interface WorkflowOrchestratorConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### WorkflowOrchestratorCommand
```typescript
interface WorkflowOrchestratorCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### WorkflowOrchestratorResult
```typescript
interface WorkflowOrchestratorResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: WorkflowOrchestratorError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
