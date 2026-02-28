# EnterprisePlanning Organ — API Reference
## Organ ID: ORGX-ENT-ENTERPRISE_PLANNING

### Classes

#### `EnterprisePlanningOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: EnterprisePlanningCommand): Promise<EnterprisePlanningEvent>` — Execute a domain command
- `executeOffline(command: EnterprisePlanningCommand): EnterprisePlanningEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): EnterprisePlanningHealth` — Get organ health status
- `registerAIProvider(provider: EnterprisePlanningAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `EnterprisePlanningCommand` — Domain command structure
- `EnterprisePlanningEvent` — Domain event structure
- `EnterprisePlanningQuery` — Domain query structure
- `EnterprisePlanningState` — Domain state structure
- `EnterprisePlanningHealth` — Organ health status
- `EnterprisePlanningAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 0d1722ab_
