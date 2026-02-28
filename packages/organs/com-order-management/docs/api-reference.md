# OrderManagement Organ — API Reference
## Organ ID: ORGX-COM-ORDER_MANAGEMENT

### Classes

#### `OrderManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: OrderManagementCommand): Promise<OrderManagementEvent>` — Execute a domain command
- `executeOffline(command: OrderManagementCommand): OrderManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): OrderManagementHealth` — Get organ health status
- `registerAIProvider(provider: OrderManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `OrderManagementCommand` — Domain command structure
- `OrderManagementEvent` — Domain event structure
- `OrderManagementQuery` — Domain query structure
- `OrderManagementState` — Domain state structure
- `OrderManagementHealth` — Organ health status
- `OrderManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: fff5cc6c_
