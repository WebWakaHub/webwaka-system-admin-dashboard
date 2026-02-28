# KeyManagement Organ — API Reference
## Organ ID: ORGX-SEC-KEY_MANAGEMENT

### Classes

#### `KeyManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: KeyManagementCommand): Promise<KeyManagementEvent>` — Execute a domain command
- `executeOffline(command: KeyManagementCommand): KeyManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): KeyManagementHealth` — Get organ health status
- `registerAIProvider(provider: KeyManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `KeyManagementCommand` — Domain command structure
- `KeyManagementEvent` — Domain event structure
- `KeyManagementQuery` — Domain query structure
- `KeyManagementState` — Domain state structure
- `KeyManagementHealth` — Organ health status
- `KeyManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 2f005031_
