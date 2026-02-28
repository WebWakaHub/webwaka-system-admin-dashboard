# WarehouseManagement Organ — API Reference
## Organ ID: ORGX-LOG-WAREHOUSE_MANAGEMENT

### Classes

#### `WarehouseManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: WarehouseManagementCommand): Promise<WarehouseManagementEvent>` — Execute a domain command
- `executeOffline(command: WarehouseManagementCommand): WarehouseManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): WarehouseManagementHealth` — Get organ health status
- `registerAIProvider(provider: WarehouseManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `WarehouseManagementCommand` — Domain command structure
- `WarehouseManagementEvent` — Domain event structure
- `WarehouseManagementQuery` — Domain query structure
- `WarehouseManagementState` — Domain state structure
- `WarehouseManagementHealth` — Organ health status
- `WarehouseManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 8128eb26_
