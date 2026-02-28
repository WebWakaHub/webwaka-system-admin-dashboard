# ValidationEngine — API Reference

## Types

### ValidationEngineConfig
```typescript
interface ValidationEngineConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### ValidationEngineCommand
```typescript
interface ValidationEngineCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### ValidationEngineResult
```typescript
interface ValidationEngineResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: ValidationEngineError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
