# PaymentProcessing Organ — API Reference
## Organ ID: ORGX-FIN-PAYMENT_PROCESSING

### Classes

#### `PaymentProcessingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PaymentProcessingCommand): Promise<PaymentProcessingEvent>` — Execute a domain command
- `executeOffline(command: PaymentProcessingCommand): PaymentProcessingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PaymentProcessingHealth` — Get organ health status
- `registerAIProvider(provider: PaymentProcessingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PaymentProcessingCommand` — Domain command structure
- `PaymentProcessingEvent` — Domain event structure
- `PaymentProcessingQuery` — Domain query structure
- `PaymentProcessingState` — Domain state structure
- `PaymentProcessingHealth` — Organ health status
- `PaymentProcessingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 03af4a2e_
