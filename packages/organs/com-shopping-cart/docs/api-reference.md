# ShoppingCart Organ — API Reference
## Organ ID: ORGX-COM-SHOPPING_CART

### Classes

#### `ShoppingCartOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ShoppingCartCommand): Promise<ShoppingCartEvent>` — Execute a domain command
- `executeOffline(command: ShoppingCartCommand): ShoppingCartEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ShoppingCartHealth` — Get organ health status
- `registerAIProvider(provider: ShoppingCartAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ShoppingCartCommand` — Domain command structure
- `ShoppingCartEvent` — Domain event structure
- `ShoppingCartQuery` — Domain query structure
- `ShoppingCartState` — Domain state structure
- `ShoppingCartHealth` — Organ health status
- `ShoppingCartAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: dfe8b03d_
