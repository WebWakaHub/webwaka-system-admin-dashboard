# ResultValidator — API Reference

## Types

### ResultValidatorConfig
```typescript
interface ResultValidatorConfig { id: string; name: string; maxConcurrency: number; timeoutMs: number; retryPolicy: RetryPolicy; }
```

### ResultValidatorCommand
```typescript
interface ResultValidatorCommand { type: string; payload: Record<string, unknown>; correlationId: string; timestamp: number; }
```
