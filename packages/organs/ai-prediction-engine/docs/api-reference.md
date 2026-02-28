# PredictionEngine Organ — API Reference
## Organ ID: ORGX-AI-PREDICTION_ENGINE

### Classes

#### `PredictionEngineOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PredictionEngineCommand): Promise<PredictionEngineEvent>` — Execute a domain command
- `executeOffline(command: PredictionEngineCommand): PredictionEngineEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PredictionEngineHealth` — Get organ health status
- `registerAIProvider(provider: PredictionEngineAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PredictionEngineCommand` — Domain command structure
- `PredictionEngineEvent` — Domain event structure
- `PredictionEngineQuery` — Domain query structure
- `PredictionEngineState` — Domain state structure
- `PredictionEngineHealth` — Organ health status
- `PredictionEngineAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: cd81f58e_
