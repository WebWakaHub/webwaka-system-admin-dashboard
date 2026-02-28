# Geocoding Organ — API Reference
## Organ ID: ORGX-GEO-GEOCODING

### Classes

#### `GeocodingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: GeocodingCommand): Promise<GeocodingEvent>` — Execute a domain command
- `executeOffline(command: GeocodingCommand): GeocodingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): GeocodingHealth` — Get organ health status
- `registerAIProvider(provider: GeocodingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `GeocodingCommand` — Domain command structure
- `GeocodingEvent` — Domain event structure
- `GeocodingQuery` — Domain query structure
- `GeocodingState` — Domain state structure
- `GeocodingHealth` — Organ health status
- `GeocodingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: af2fffae_
