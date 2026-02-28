# ContentDistribution Organ — API Reference
## Organ ID: ORGX-MED-CONTENT_DISTRIBUTION

### Classes

#### `ContentDistributionOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ContentDistributionCommand): Promise<ContentDistributionEvent>` — Execute a domain command
- `executeOffline(command: ContentDistributionCommand): ContentDistributionEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ContentDistributionHealth` — Get organ health status
- `registerAIProvider(provider: ContentDistributionAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ContentDistributionCommand` — Domain command structure
- `ContentDistributionEvent` — Domain event structure
- `ContentDistributionQuery` — Domain query structure
- `ContentDistributionState` — Domain state structure
- `ContentDistributionHealth` — Organ health status
- `ContentDistributionAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 1a1d71c9_
