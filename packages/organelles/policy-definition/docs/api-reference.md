# PolicyDefinition — API Reference

## Types

### PolicyDefinitionConfig
```typescript
interface PolicyDefinitionConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### PolicyDefinitionCommand
```typescript
interface PolicyDefinitionCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### PolicyDefinitionResult
```typescript
interface PolicyDefinitionResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: PolicyDefinitionError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
