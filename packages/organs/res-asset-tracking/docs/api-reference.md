# AssetTracking Organ — API Reference
## Organ ID: ORGX-RES-ASSET_TRACKING

### Classes

#### `AssetTrackingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AssetTrackingCommand): Promise<AssetTrackingEvent>` — Execute a domain command
- `executeOffline(command: AssetTrackingCommand): AssetTrackingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AssetTrackingHealth` — Get organ health status
- `registerAIProvider(provider: AssetTrackingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AssetTrackingCommand` — Domain command structure
- `AssetTrackingEvent` — Domain event structure
- `AssetTrackingQuery` — Domain query structure
- `AssetTrackingState` — Domain state structure
- `AssetTrackingHealth` — Organ health status
- `AssetTrackingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 07f38e68_
