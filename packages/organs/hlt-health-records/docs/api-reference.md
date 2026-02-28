# HealthRecords Organ — API Reference
## Organ ID: ORGX-HLT-HEALTH_RECORDS

### Classes

#### `HealthRecordsOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: HealthRecordsCommand): Promise<HealthRecordsEvent>` — Execute a domain command
- `executeOffline(command: HealthRecordsCommand): HealthRecordsEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): HealthRecordsHealth` — Get organ health status
- `registerAIProvider(provider: HealthRecordsAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `HealthRecordsCommand` — Domain command structure
- `HealthRecordsEvent` — Domain event structure
- `HealthRecordsQuery` — Domain query structure
- `HealthRecordsState` — Domain state structure
- `HealthRecordsHealth` — Organ health status
- `HealthRecordsAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 612de931_
