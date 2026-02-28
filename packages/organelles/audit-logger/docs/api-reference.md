# AuditLogger — API Reference

## Types

### AuditLoggerConfig
```typescript
interface AuditLoggerConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### AuditLoggerCommand
```typescript
interface AuditLoggerCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### AuditLoggerResult
```typescript
interface AuditLoggerResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: AuditLoggerError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
