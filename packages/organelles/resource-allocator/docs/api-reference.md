# ResourceAllocator — API Reference

## Types

### ResourceAllocatorConfig
```typescript
interface ResourceAllocatorConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### ResourceAllocatorCommand
```typescript
interface ResourceAllocatorCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### ResourceAllocatorResult
```typescript
interface ResourceAllocatorResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: ResourceAllocatorError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
