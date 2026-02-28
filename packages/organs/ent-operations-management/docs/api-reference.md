# OperationsManagement Organ — API Reference
## Organ ID: ORGX-ENT-OPERATIONS_MANAGEMENT

### Classes

#### `OperationsManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: OperationsManagementCommand): Promise<OperationsManagementEvent>` — Execute a domain command
- `executeOffline(command: OperationsManagementCommand): OperationsManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): OperationsManagementHealth` — Get organ health status
- `registerAIProvider(provider: OperationsManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `OperationsManagementCommand` — Domain command structure
- `OperationsManagementEvent` — Domain event structure
- `OperationsManagementQuery` — Domain query structure
- `OperationsManagementState` — Domain state structure
- `OperationsManagementHealth` — Organ health status
- `OperationsManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 2c6d418d_
