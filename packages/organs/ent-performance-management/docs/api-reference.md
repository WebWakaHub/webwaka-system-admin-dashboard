# PerformanceManagement Organ — API Reference
## Organ ID: ORGX-ENT-PERFORMANCE_MANAGEMENT

### Classes

#### `PerformanceManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PerformanceManagementCommand): Promise<PerformanceManagementEvent>` — Execute a domain command
- `executeOffline(command: PerformanceManagementCommand): PerformanceManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PerformanceManagementHealth` — Get organ health status
- `registerAIProvider(provider: PerformanceManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PerformanceManagementCommand` — Domain command structure
- `PerformanceManagementEvent` — Domain event structure
- `PerformanceManagementQuery` — Domain query structure
- `PerformanceManagementState` — Domain state structure
- `PerformanceManagementHealth` — Organ health status
- `PerformanceManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 550e34ea_
