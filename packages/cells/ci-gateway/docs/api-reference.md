# CIGateway — API Reference

**Cell:** CEL-CIGATEWAY-v0.1.0

## Classes

### `CIGateway`

The core cell implementation.

#### Constructor

```typescript
new CIGateway(config?: Partial<CIGatewayConfig>)
```

#### Methods

| Method | Parameters | Returns | Description |
|:-------|:-----------|:--------|:------------|
| `execute` | `command: CIGatewayCommand, context: ExecutionContext` | `Promise<CIGatewayResult>` | Execute a command through the cell pipeline |
| `executeOffline` | `command: CIGatewayCommand, context: ExecutionContext` | `Promise<CIGatewayResult>` | Queue a command for offline execution |
| `sync` | none | `Promise<SyncResult>` | Sync offline queue |
| `getState` | none | `CellState` | Get current cell state |
| `getMetrics` | none | `CellMetric[]` | Get collected metrics |
| `onStateChange` | `handler: (state: CellState) => void` | `Unsubscribe` | Subscribe to state changes |
| `onError` | `handler: (error: Error) => void` | `Unsubscribe` | Subscribe to errors |
| `dispose` | none | `Promise<void>` | Clean up resources |

### `CIGatewayOrchestrator`

Manages the cell lifecycle.

#### Methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `initialize` | `Promise<CIGateway>` | Create and initialize the cell |
| `shutdown` | `Promise<void>` | Gracefully shut down the cell |
| `getCell` | `CIGateway \| null` | Get the managed cell instance |

## Types

See `src/types.ts` for complete type definitions.
