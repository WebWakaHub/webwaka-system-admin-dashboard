# SchedulerExecutor — API Reference

## Types

### SchedulerExecutorConfig
```typescript
interface SchedulerExecutorConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### SchedulerExecutorCommand
```typescript
interface SchedulerExecutorCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### SchedulerExecutorResult
```typescript
interface SchedulerExecutorResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: SchedulerExecutorError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
