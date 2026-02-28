# Monitor — API Reference

**Cell:** CEL-MONITOR-v0.1.0

## Classes

### `Monitor`

The core cell implementation.

#### Constructor

```typescript
new Monitor(config?: Partial<MonitorConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: MonitorCommand, context: ExecutionContext` | `Promise<MonitorResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: MonitorCommand, context: ExecutionContext` | `Promise<MonitorResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `MonitorOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<Monitor>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `Monitor \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
