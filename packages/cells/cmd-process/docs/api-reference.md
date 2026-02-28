# CommandProcessor — API Reference

**Cell:** CEL-CMDPROCESS-v0.1.0

## Classes

### `CommandProcessor`

The core cell implementation.

#### Constructor

```typescript
new CommandProcessor(config?: Partial<CommandProcessorConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: CommandProcessorCommand, context: ExecutionContext` | `Promise<CommandProcessorResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: CommandProcessorCommand, context: ExecutionContext` | `Promise<CommandProcessorResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `CommandProcessorOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<CommandProcessor>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `CommandProcessor \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
