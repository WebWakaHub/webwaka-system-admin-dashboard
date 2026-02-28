# CivicService Organ — API Reference
## Organ ID: ORGX-GOV-CIVIC_SERVICE

### Classes

#### `CivicServiceOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: CivicServiceCommand): Promise<CivicServiceEvent>` — Execute a domain command
- `executeOffline(command: CivicServiceCommand): CivicServiceEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): CivicServiceHealth` — Get organ health status
- `registerAIProvider(provider: CivicServiceAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `CivicServiceCommand` — Domain command structure
- `CivicServiceEvent` — Domain event structure
- `CivicServiceQuery` — Domain query structure
- `CivicServiceState` — Domain state structure
- `CivicServiceHealth` — Organ health status
- `CivicServiceAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: b85d3fd7_
