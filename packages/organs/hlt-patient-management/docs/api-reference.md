# PatientManagement Organ — API Reference
## Organ ID: ORGX-HLT-PATIENT_MANAGEMENT

### Classes

#### `PatientManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PatientManagementCommand): Promise<PatientManagementEvent>` — Execute a domain command
- `executeOffline(command: PatientManagementCommand): PatientManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PatientManagementHealth` — Get organ health status
- `registerAIProvider(provider: PatientManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PatientManagementCommand` — Domain command structure
- `PatientManagementEvent` — Domain event structure
- `PatientManagementQuery` — Domain query structure
- `PatientManagementState` — Domain state structure
- `PatientManagementHealth` — Organ health status
- `PatientManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: d94d097d_
