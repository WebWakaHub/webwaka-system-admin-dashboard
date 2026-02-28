# MediaProcessing Organ — API Reference
## Organ ID: ORGX-MED-MEDIA_PROCESSING

### Classes

#### `MediaProcessingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: MediaProcessingCommand): Promise<MediaProcessingEvent>` — Execute a domain command
- `executeOffline(command: MediaProcessingCommand): MediaProcessingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): MediaProcessingHealth` — Get organ health status
- `registerAIProvider(provider: MediaProcessingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `MediaProcessingCommand` — Domain command structure
- `MediaProcessingEvent` — Domain event structure
- `MediaProcessingQuery` — Domain query structure
- `MediaProcessingState` — Domain state structure
- `MediaProcessingHealth` — Organ health status
- `MediaProcessingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 1858fcbb_
