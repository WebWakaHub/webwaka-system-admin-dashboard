# AccessController — API Reference

**Cell:** CEL-ACCESSCTRL-v0.1.0

## Classes

### `AccessController`

The core cell implementation.

#### Constructor

```typescript
new AccessController(config?: Partial<AccessControllerConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: AccessControllerCommand, context: ExecutionContext` | `Promise<AccessControllerResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: AccessControllerCommand, context: ExecutionContext` | `Promise<AccessControllerResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `AccessControllerOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<AccessController>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `AccessController \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
