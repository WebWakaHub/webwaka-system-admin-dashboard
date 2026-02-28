# InventoryControl Organ — API Reference
## Organ ID: ORGX-LOG-INVENTORY_CONTROL

### Classes

#### `InventoryControlOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: InventoryControlCommand): Promise<InventoryControlEvent>` — Execute a domain command
- `executeOffline(command: InventoryControlCommand): InventoryControlEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): InventoryControlHealth` — Get organ health status
- `registerAIProvider(provider: InventoryControlAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `InventoryControlCommand` — Domain command structure
- `InventoryControlEvent` — Domain event structure
- `InventoryControlQuery` — Domain query structure
- `InventoryControlState` — Domain state structure
- `InventoryControlHealth` — Organ health status
- `InventoryControlAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 41d4d8b3_
