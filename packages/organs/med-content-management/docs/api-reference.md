# ContentManagement Organ — API Reference
## Organ ID: ORGX-MED-CONTENT_MANAGEMENT

### Classes

#### `ContentManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ContentManagementCommand): Promise<ContentManagementEvent>` — Execute a domain command
- `executeOffline(command: ContentManagementCommand): ContentManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ContentManagementHealth` — Get organ health status
- `registerAIProvider(provider: ContentManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ContentManagementCommand` — Domain command structure
- `ContentManagementEvent` — Domain event structure
- `ContentManagementQuery` — Domain query structure
- `ContentManagementState` — Domain state structure
- `ContentManagementHealth` — Organ health status
- `ContentManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 2e23bd2b_
