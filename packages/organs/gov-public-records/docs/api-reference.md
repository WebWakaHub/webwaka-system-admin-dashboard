# PublicRecords Organ — API Reference
## Organ ID: ORGX-GOV-PUBLIC_RECORDS

### Classes

#### `PublicRecordsOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PublicRecordsCommand): Promise<PublicRecordsEvent>` — Execute a domain command
- `executeOffline(command: PublicRecordsCommand): PublicRecordsEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PublicRecordsHealth` — Get organ health status
- `registerAIProvider(provider: PublicRecordsAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PublicRecordsCommand` — Domain command structure
- `PublicRecordsEvent` — Domain event structure
- `PublicRecordsQuery` — Domain query structure
- `PublicRecordsState` — Domain state structure
- `PublicRecordsHealth` — Organ health status
- `PublicRecordsAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 30848530_
