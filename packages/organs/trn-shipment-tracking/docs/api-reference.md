# ShipmentTracking Organ — API Reference
## Organ ID: ORGX-TRN-SHIPMENT_TRACKING

### Classes

#### `ShipmentTrackingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ShipmentTrackingCommand): Promise<ShipmentTrackingEvent>` — Execute a domain command
- `executeOffline(command: ShipmentTrackingCommand): ShipmentTrackingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ShipmentTrackingHealth` — Get organ health status
- `registerAIProvider(provider: ShipmentTrackingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ShipmentTrackingCommand` — Domain command structure
- `ShipmentTrackingEvent` — Domain event structure
- `ShipmentTrackingQuery` — Domain query structure
- `ShipmentTrackingState` — Domain state structure
- `ShipmentTrackingHealth` — Organ health status
- `ShipmentTrackingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: b75ce27f_
