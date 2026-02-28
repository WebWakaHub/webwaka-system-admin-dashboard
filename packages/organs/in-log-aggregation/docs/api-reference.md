# LogAggregation Organ — API Reference
## Organ ID: ORGX-IN-LOG_AGGREGATION

### Classes

#### `LogAggregationOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: LogAggregationCommand): Promise<LogAggregationEvent>` — Execute a domain command
- `executeOffline(command: LogAggregationCommand): LogAggregationEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): LogAggregationHealth` — Get organ health status
- `registerAIProvider(provider: LogAggregationAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `LogAggregationCommand` — Domain command structure
- `LogAggregationEvent` — Domain event structure
- `LogAggregationQuery` — Domain query structure
- `LogAggregationState` — Domain state structure
- `LogAggregationHealth` — Organ health status
- `LogAggregationAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 17014125_
