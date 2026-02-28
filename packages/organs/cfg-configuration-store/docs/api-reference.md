# ConfigurationStore Organ — API Reference
## Organ ID: ORGX-CFG-CONFIGURATION_STORE

### Classes

#### `ConfigurationStoreOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ConfigurationStoreCommand): Promise<ConfigurationStoreEvent>` — Execute a domain command
- `executeOffline(command: ConfigurationStoreCommand): ConfigurationStoreEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ConfigurationStoreHealth` — Get organ health status
- `registerAIProvider(provider: ConfigurationStoreAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ConfigurationStoreCommand` — Domain command structure
- `ConfigurationStoreEvent` — Domain event structure
- `ConfigurationStoreQuery` — Domain query structure
- `ConfigurationStoreState` — Domain state structure
- `ConfigurationStoreHealth` — Organ health status
- `ConfigurationStoreAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 599299a2_
