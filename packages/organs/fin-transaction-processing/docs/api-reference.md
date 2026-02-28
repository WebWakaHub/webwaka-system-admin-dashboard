# TransactionProcessing Organ — API Reference
## Organ ID: ORGX-FIN-TRANSACTION_PROCESSING

### Classes

#### `TransactionProcessingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: TransactionProcessingCommand): Promise<TransactionProcessingEvent>` — Execute a domain command
- `executeOffline(command: TransactionProcessingCommand): TransactionProcessingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): TransactionProcessingHealth` — Get organ health status
- `registerAIProvider(provider: TransactionProcessingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `TransactionProcessingCommand` — Domain command structure
- `TransactionProcessingEvent` — Domain event structure
- `TransactionProcessingQuery` — Domain query structure
- `TransactionProcessingState` — Domain state structure
- `TransactionProcessingHealth` — Organ health status
- `TransactionProcessingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 3d330f58_
