# CustomerAccount Organ — API Reference
## Organ ID: ORGX-COM-CUSTOMER_ACCOUNT

### Classes

#### `CustomerAccountOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: CustomerAccountCommand): Promise<CustomerAccountEvent>` — Execute a domain command
- `executeOffline(command: CustomerAccountCommand): CustomerAccountEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): CustomerAccountHealth` — Get organ health status
- `registerAIProvider(provider: CustomerAccountAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `CustomerAccountCommand` — Domain command structure
- `CustomerAccountEvent` — Domain event structure
- `CustomerAccountQuery` — Domain query structure
- `CustomerAccountState` — Domain state structure
- `CustomerAccountHealth` — Organ health status
- `CustomerAccountAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: f97645b8_
