# CompositionModeler — API Reference

## Types

### CompositionModelerConfig
```typescript
interface CompositionModelerConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### CompositionModelerCommand
```typescript
interface CompositionModelerCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### CompositionModelerResult
```typescript
interface CompositionModelerResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: CompositionModelerError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
