# MaintenanceManagement Organ — API Reference
## Organ ID: ORGX-RES-MAINTENANCE_MANAGEMENT

### Classes

#### `MaintenanceManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: MaintenanceManagementCommand): Promise<MaintenanceManagementEvent>` — Execute a domain command
- `executeOffline(command: MaintenanceManagementCommand): MaintenanceManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): MaintenanceManagementHealth` — Get organ health status
- `registerAIProvider(provider: MaintenanceManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `MaintenanceManagementCommand` — Domain command structure
- `MaintenanceManagementEvent` — Domain event structure
- `MaintenanceManagementQuery` — Domain query structure
- `MaintenanceManagementState` — Domain state structure
- `MaintenanceManagementHealth` — Organ health status
- `MaintenanceManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 96a49fb2_
