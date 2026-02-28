# AuditEmitter — API Reference

## Types

### AuditEmitterConfig
```typescript
interface AuditEmitterConfig { id: string; name: string; maxConcurrency: number; timeoutMs: number; retryPolicy: RetryPolicy; }
```

### AuditEmitterCommand
```typescript
interface AuditEmitterCommand { type: string; payload: Record<string, unknown>; correlationId: string; timestamp: number; }
```
