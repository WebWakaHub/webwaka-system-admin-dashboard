# Aggregator — API Reference

**Cell:** CEL-AGGREGATE-v0.1.0

## Classes

### `Aggregator`

The core cell implementation.

#### Constructor

```typescript
new Aggregator(config?: Partial<AggregatorConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: AggregatorCommand, context: ExecutionContext` | `Promise<AggregatorResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: AggregatorCommand, context: ExecutionContext` | `Promise<AggregatorResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `AggregatorOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<Aggregator>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `Aggregator \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
