# InferenceCell — API Reference

**Cell:** CEL-AI-INFERENCE_CELL-v0.1.0

## Classes

### `InferenceCell`

The core cell implementation.

#### Constructor

```typescript
new InferenceCell(config?: Partial<InferenceCellConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: InferenceCellCommand, context: ExecutionContext` | `Promise<InferenceCellResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: InferenceCellCommand, context: ExecutionContext` | `Promise<InferenceCellResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `InferenceCellOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<InferenceCell>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `InferenceCell \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
