# Mapping Organ — API Reference
## Organ ID: ORGX-GEO-MAPPING

### Classes

#### `MappingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: MappingCommand): Promise<MappingEvent>` — Execute a domain command
- `executeOffline(command: MappingCommand): MappingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): MappingHealth` — Get organ health status
- `registerAIProvider(provider: MappingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `MappingCommand` — Domain command structure
- `MappingEvent` — Domain event structure
- `MappingQuery` — Domain query structure
- `MappingState` — Domain state structure
- `MappingHealth` — Organ health status
- `MappingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 85c28086_
