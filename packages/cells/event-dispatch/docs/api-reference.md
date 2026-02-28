# EventDispatcher — API Reference

**Cell:** CEL-EVENTDISPATCH-v0.1.0

## Classes

### `EventDispatcher`

The core cell implementation.

#### Constructor

```typescript
new EventDispatcher(config?: Partial<EventDispatcherConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: EventDispatcherCommand, context: ExecutionContext` | `Promise<EventDispatcherResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: EventDispatcherCommand, context: ExecutionContext` | `Promise<EventDispatcherResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `EventDispatcherOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<EventDispatcher>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `EventDispatcher \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
