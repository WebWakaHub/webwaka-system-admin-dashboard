# ComponentLibrary Organ — API Reference
## Organ ID: ORGX-UI-COMPONENT_LIBRARY

### Classes

#### `ComponentLibraryOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ComponentLibraryCommand): Promise<ComponentLibraryEvent>` — Execute a domain command
- `executeOffline(command: ComponentLibraryCommand): ComponentLibraryEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ComponentLibraryHealth` — Get organ health status
- `registerAIProvider(provider: ComponentLibraryAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ComponentLibraryCommand` — Domain command structure
- `ComponentLibraryEvent` — Domain event structure
- `ComponentLibraryQuery` — Domain query structure
- `ComponentLibraryState` — Domain state structure
- `ComponentLibraryHealth` — Organ health status
- `ComponentLibraryAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 4448b0d8_
