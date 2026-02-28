# ResourceScheduling Organ — API Reference
## Organ ID: ORGX-RES-RESOURCE_SCHEDULING

### Classes

#### `ResourceSchedulingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ResourceSchedulingCommand): Promise<ResourceSchedulingEvent>` — Execute a domain command
- `executeOffline(command: ResourceSchedulingCommand): ResourceSchedulingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ResourceSchedulingHealth` — Get organ health status
- `registerAIProvider(provider: ResourceSchedulingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ResourceSchedulingCommand` — Domain command structure
- `ResourceSchedulingEvent` — Domain event structure
- `ResourceSchedulingQuery` — Domain query structure
- `ResourceSchedulingState` — Domain state structure
- `ResourceSchedulingHealth` — Organ health status
- `ResourceSchedulingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: af78dd73_
