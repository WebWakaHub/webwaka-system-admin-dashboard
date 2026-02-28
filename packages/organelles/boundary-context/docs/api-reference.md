# BoundaryContext — API Reference

## Types

### BoundaryContextConfig
```typescript
interface BoundaryContextConfig { id: string; name: string; maxConcurrency: number; timeoutMs: number; retryPolicy: RetryPolicy; }
```

### BoundaryContextCommand
```typescript
interface BoundaryContextCommand { type: string; payload: Record<string, unknown>; correlationId: string; timestamp: number; }
```

### Supported Commands

| Command Type | Description |
|:------------|:------------|
| DEFINE_BOUNDARY | Define a new bounded context |
| VALIDATE_CONTEXT | Validate an existing context |
| MERGE_CONTEXTS | Merge two contexts |
