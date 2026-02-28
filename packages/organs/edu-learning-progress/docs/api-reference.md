# LearningProgress Organ — API Reference
## Organ ID: ORGX-EDU-LEARNING_PROGRESS

### Classes

#### `LearningProgressOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: LearningProgressCommand): Promise<LearningProgressEvent>` — Execute a domain command
- `executeOffline(command: LearningProgressCommand): LearningProgressEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): LearningProgressHealth` — Get organ health status
- `registerAIProvider(provider: LearningProgressAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `LearningProgressCommand` — Domain command structure
- `LearningProgressEvent` — Domain event structure
- `LearningProgressQuery` — Domain query structure
- `LearningProgressState` — Domain state structure
- `LearningProgressHealth` — Organ health status
- `LearningProgressAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: d5daacc9_
