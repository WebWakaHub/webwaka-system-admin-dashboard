# ResourceRegistry — API Reference

**Cell:** CEL-RESOURCEREG-v0.1.0

## Classes

### `ResourceRegistry`

The core cell implementation.

#### Constructor

```typescript
new ResourceRegistry(config?: Partial<ResourceRegistryConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: ResourceRegistryCommand, context: ExecutionContext` | `Promise<ResourceRegistryResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: ResourceRegistryCommand, context: ExecutionContext` | `Promise<ResourceRegistryResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `ResourceRegistryOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<ResourceRegistry>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `ResourceRegistry \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
