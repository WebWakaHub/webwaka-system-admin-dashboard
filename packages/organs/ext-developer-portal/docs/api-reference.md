# DeveloperPortal Organ — API Reference
## Organ ID: ORGX-EXT-DEVELOPER_PORTAL

### Classes

#### `DeveloperPortalOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: DeveloperPortalCommand): Promise<DeveloperPortalEvent>` — Execute a domain command
- `executeOffline(command: DeveloperPortalCommand): DeveloperPortalEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): DeveloperPortalHealth` — Get organ health status
- `registerAIProvider(provider: DeveloperPortalAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `DeveloperPortalCommand` — Domain command structure
- `DeveloperPortalEvent` — Domain event structure
- `DeveloperPortalQuery` — Domain query structure
- `DeveloperPortalState` — Domain state structure
- `DeveloperPortalHealth` — Organ health status
- `DeveloperPortalAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: e4735cc9_
