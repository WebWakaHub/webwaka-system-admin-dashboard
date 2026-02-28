# ModelServing Organ — API Reference
## Organ ID: ORGX-AI-MODEL_SERVING

### Classes

#### `ModelServingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ModelServingCommand): Promise<ModelServingEvent>` — Execute a domain command
- `executeOffline(command: ModelServingCommand): ModelServingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ModelServingHealth` — Get organ health status
- `registerAIProvider(provider: ModelServingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ModelServingCommand` — Domain command structure
- `ModelServingEvent` — Domain event structure
- `ModelServingQuery` — Domain query structure
- `ModelServingState` — Domain state structure
- `ModelServingHealth` — Organ health status
- `ModelServingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: d971d254_
