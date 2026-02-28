# InstrumentationProbe — API Reference

## Types

### InstrumentationProbeConfig
```typescript
interface InstrumentationProbeConfig { id: string; name: string; maxConcurrency: number; timeoutMs: number; retryPolicy: RetryPolicy; }
```

### InstrumentationProbeCommand
```typescript
interface InstrumentationProbeCommand { type: string; payload: Record<string, unknown>; correlationId: string; timestamp: number; }
```
