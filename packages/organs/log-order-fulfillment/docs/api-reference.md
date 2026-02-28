# OrderFulfillment Organ — API Reference
## Organ ID: ORGX-LOG-ORDER_FULFILLMENT

### Classes

#### `OrderFulfillmentOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: OrderFulfillmentCommand): Promise<OrderFulfillmentEvent>` — Execute a domain command
- `executeOffline(command: OrderFulfillmentCommand): OrderFulfillmentEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): OrderFulfillmentHealth` — Get organ health status
- `registerAIProvider(provider: OrderFulfillmentAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `OrderFulfillmentCommand` — Domain command structure
- `OrderFulfillmentEvent` — Domain event structure
- `OrderFulfillmentQuery` — Domain query structure
- `OrderFulfillmentState` — Domain state structure
- `OrderFulfillmentHealth` — Organ health status
- `OrderFulfillmentAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 1fd41521_
