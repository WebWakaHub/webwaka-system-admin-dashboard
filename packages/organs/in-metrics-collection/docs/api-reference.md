# MetricsCollection Organ — API Reference
## Organ ID: ORGX-IN-METRICS_COLLECTION

### Classes

#### `MetricsCollectionOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: MetricsCollectionCommand): Promise<MetricsCollectionEvent>` — Execute a domain command
- `executeOffline(command: MetricsCollectionCommand): MetricsCollectionEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): MetricsCollectionHealth` — Get organ health status
- `registerAIProvider(provider: MetricsCollectionAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `MetricsCollectionCommand` — Domain command structure
- `MetricsCollectionEvent` — Domain event structure
- `MetricsCollectionQuery` — Domain query structure
- `MetricsCollectionState` — Domain state structure
- `MetricsCollectionHealth` — Organ health status
- `MetricsCollectionAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 4eed02be_
