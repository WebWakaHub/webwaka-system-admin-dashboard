# RecordStore — API Reference

## Types

### RecordStoreConfig
```typescript
interface RecordStoreConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### RecordStoreCommand
```typescript
interface RecordStoreCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### RecordStoreResult
```typescript
interface RecordStoreResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: RecordStoreError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
