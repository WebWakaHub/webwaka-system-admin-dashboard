# LedgerManagement Organ — API Reference
## Organ ID: ORGX-FIN-LEDGER_MANAGEMENT

### Classes

#### `LedgerManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: LedgerManagementCommand): Promise<LedgerManagementEvent>` — Execute a domain command
- `executeOffline(command: LedgerManagementCommand): LedgerManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): LedgerManagementHealth` — Get organ health status
- `registerAIProvider(provider: LedgerManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `LedgerManagementCommand` — Domain command structure
- `LedgerManagementEvent` — Domain event structure
- `LedgerManagementQuery` — Domain query structure
- `LedgerManagementState` — Domain state structure
- `LedgerManagementHealth` — Organ health status
- `LedgerManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 971fcdbf_
