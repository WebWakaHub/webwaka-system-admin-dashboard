# GovernanceRegistry — API Reference

## Types

### GovernanceRegistryConfig
```typescript
interface GovernanceRegistryConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### GovernanceRegistryCommand
```typescript
interface GovernanceRegistryCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### GovernanceRegistryResult
```typescript
interface GovernanceRegistryResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: GovernanceRegistryError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
