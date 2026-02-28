# TrainingPipeline Organ — API Reference
## Organ ID: ORGX-AI-TRAINING_PIPELINE

### Classes

#### `TrainingPipelineOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: TrainingPipelineCommand): Promise<TrainingPipelineEvent>` — Execute a domain command
- `executeOffline(command: TrainingPipelineCommand): TrainingPipelineEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): TrainingPipelineHealth` — Get organ health status
- `registerAIProvider(provider: TrainingPipelineAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `TrainingPipelineCommand` — Domain command structure
- `TrainingPipelineEvent` — Domain event structure
- `TrainingPipelineQuery` — Domain query structure
- `TrainingPipelineState` — Domain state structure
- `TrainingPipelineHealth` — Organ health status
- `TrainingPipelineAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 80ffa819_
