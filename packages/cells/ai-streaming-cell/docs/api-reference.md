# StreamingCell — API Reference

**Cell:** CEL-AI-STREAMING_CELL-v0.1.0

## Classes

### `StreamingCell`

The core cell implementation.

#### Constructor

```typescript
new StreamingCell(config?: Partial<StreamingCellConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: StreamingCellCommand, context: ExecutionContext` | `Promise<StreamingCellResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: StreamingCellCommand, context: ExecutionContext` | `Promise<StreamingCellResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `StreamingCellOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<StreamingCell>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `StreamingCell \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
