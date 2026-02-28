# IdentityResolver — API Reference

**Cell:** CEL-IDRESOLVE-v0.1.0

## Classes

### `IdentityResolver`

The core cell implementation.

#### Constructor

```typescript
new IdentityResolver(config?: Partial<IdentityResolverConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: IdentityResolverCommand, context: ExecutionContext` | `Promise<IdentityResolverResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: IdentityResolverCommand, context: ExecutionContext` | `Promise<IdentityResolverResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `IdentityResolverOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<IdentityResolver>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `IdentityResolver \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
