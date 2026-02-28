# TrustAssertion — API Reference

## Types

### TrustAssertionConfig
```typescript
interface TrustAssertionConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### TrustAssertionCommand
```typescript
interface TrustAssertionCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### TrustAssertionResult
```typescript
interface TrustAssertionResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: TrustAssertionError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
