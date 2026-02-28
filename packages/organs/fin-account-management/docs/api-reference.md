# AccountManagement Organ — API Reference
## Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT

### Classes

#### `AccountManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AccountManagementCommand): Promise<AccountManagementEvent>` — Execute a domain command
- `executeOffline(command: AccountManagementCommand): AccountManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AccountManagementHealth` — Get organ health status
- `registerAIProvider(provider: AccountManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AccountManagementCommand` — Domain command structure
- `AccountManagementEvent` — Domain event structure
- `AccountManagementQuery` — Domain query structure
- `AccountManagementState` — Domain state structure
- `AccountManagementHealth` — Organ health status
- `AccountManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 8d5f6cbe_
