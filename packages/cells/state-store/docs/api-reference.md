# StateStore — API Reference

**Cell:** CEL-STATESTORE-v0.1.0

## Classes

### `StateStore`

The core cell implementation.

#### Constructor

```typescript
new StateStore(config?: Partial<StateStoreConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: StateStoreCommand, context: ExecutionContext` | `Promise<StateStoreResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: StateStoreCommand, context: ExecutionContext` | `Promise<StateStoreResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `StateStoreOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<StateStore>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `StateStore \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
