# TelemetryCollector — API Reference

## Types

### TelemetryCollectorConfig
```typescript
interface TelemetryCollectorConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### TelemetryCollectorCommand
```typescript
interface TelemetryCollectorCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### TelemetryCollectorResult
```typescript
interface TelemetryCollectorResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: TelemetryCollectorError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
