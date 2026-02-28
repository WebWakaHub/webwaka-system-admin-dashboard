# ValidationExecutor — API Reference

**Cell:** CEL-VALIDATEEXEC-v0.1.0

## Classes

### `ValidationExecutor`

The core cell implementation.

#### Constructor

```typescript
new ValidationExecutor(config?: Partial<ValidationExecutorConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: ValidationExecutorCommand, context: ExecutionContext` | `Promise<ValidationExecutorResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: ValidationExecutorCommand, context: ExecutionContext` | `Promise<ValidationExecutorResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `ValidationExecutorOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<ValidationExecutor>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `ValidationExecutor \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
