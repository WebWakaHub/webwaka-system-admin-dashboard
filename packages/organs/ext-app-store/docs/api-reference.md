# AppStore Organ — API Reference
## Organ ID: ORGX-EXT-APP_STORE

### Classes

#### `AppStoreOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AppStoreCommand): Promise<AppStoreEvent>` — Execute a domain command
- `executeOffline(command: AppStoreCommand): AppStoreEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AppStoreHealth` — Get organ health status
- `registerAIProvider(provider: AppStoreAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AppStoreCommand` — Domain command structure
- `AppStoreEvent` — Domain event structure
- `AppStoreQuery` — Domain query structure
- `AppStoreState` — Domain state structure
- `AppStoreHealth` — Organ health status
- `AppStoreAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 7c7e5e6e_
