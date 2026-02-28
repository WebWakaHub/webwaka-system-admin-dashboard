# ExternalAdapter — API Reference

## Types

### ExternalAdapterConfig
```typescript
interface ExternalAdapterConfig { id: string; name: string; maxConcurrency: number; timeoutMs: number; retryPolicy: RetryPolicy; }
```

### ExternalAdapterCommand
```typescript
interface ExternalAdapterCommand { type: string; payload: Record<string, unknown>; correlationId: string; timestamp: number; }
```
