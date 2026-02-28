# EventDispatcher — API Reference

## Types

### EventDispatcherConfig
```typescript
interface EventDispatcherConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### EventDispatcherCommand
```typescript
interface EventDispatcherCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### EventDispatcherResult
```typescript
interface EventDispatcherResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: EventDispatcherError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
