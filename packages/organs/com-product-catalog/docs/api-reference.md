# ProductCatalog Organ — API Reference
## Organ ID: ORGX-COM-PRODUCT_CATALOG

### Classes

#### `ProductCatalogOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ProductCatalogCommand): Promise<ProductCatalogEvent>` — Execute a domain command
- `executeOffline(command: ProductCatalogCommand): ProductCatalogEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ProductCatalogHealth` — Get organ health status
- `registerAIProvider(provider: ProductCatalogAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ProductCatalogCommand` — Domain command structure
- `ProductCatalogEvent` — Domain event structure
- `ProductCatalogQuery` — Domain query structure
- `ProductCatalogState` — Domain state structure
- `ProductCatalogHealth` — Organ health status
- `ProductCatalogAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 336d8838_
