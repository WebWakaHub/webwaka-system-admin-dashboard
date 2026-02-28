# InteractionEngine Organ — API Reference
## Organ ID: ORGX-SOC-INTERACTION_ENGINE

### Classes

#### `InteractionEngineOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: InteractionEngineCommand): Promise<InteractionEngineEvent>` — Execute a domain command
- `executeOffline(command: InteractionEngineCommand): InteractionEngineEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): InteractionEngineHealth` — Get organ health status
- `registerAIProvider(provider: InteractionEngineAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `InteractionEngineCommand` — Domain command structure
- `InteractionEngineEvent` — Domain event structure
- `InteractionEngineQuery` — Domain query structure
- `InteractionEngineState` — Domain state structure
- `InteractionEngineHealth` — Organ health status
- `InteractionEngineAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: cb21a0ec_
