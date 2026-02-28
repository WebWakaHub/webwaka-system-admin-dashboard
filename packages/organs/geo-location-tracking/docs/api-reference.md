# LocationTracking Organ — API Reference
## Organ ID: ORGX-GEO-LOCATION_TRACKING

### Classes

#### `LocationTrackingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: LocationTrackingCommand): Promise<LocationTrackingEvent>` — Execute a domain command
- `executeOffline(command: LocationTrackingCommand): LocationTrackingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): LocationTrackingHealth` — Get organ health status
- `registerAIProvider(provider: LocationTrackingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `LocationTrackingCommand` — Domain command structure
- `LocationTrackingEvent` — Domain event structure
- `LocationTrackingQuery` — Domain query structure
- `LocationTrackingState` — Domain state structure
- `LocationTrackingHealth` — Organ health status
- `LocationTrackingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: a71b5b26_
