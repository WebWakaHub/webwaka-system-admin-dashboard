# MessageGateway — API Reference

## Types

### MessageGatewayConfig
```typescript
interface MessageGatewayConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### MessageGatewayCommand
```typescript
interface MessageGatewayCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### MessageGatewayResult
```typescript
interface MessageGatewayResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: MessageGatewayError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
