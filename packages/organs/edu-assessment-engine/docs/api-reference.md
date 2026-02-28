# AssessmentEngine Organ — API Reference
## Organ ID: ORGX-EDU-ASSESSMENT_ENGINE

### Classes

#### `AssessmentEngineOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AssessmentEngineCommand): Promise<AssessmentEngineEvent>` — Execute a domain command
- `executeOffline(command: AssessmentEngineCommand): AssessmentEngineEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AssessmentEngineHealth` — Get organ health status
- `registerAIProvider(provider: AssessmentEngineAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AssessmentEngineCommand` — Domain command structure
- `AssessmentEngineEvent` — Domain event structure
- `AssessmentEngineQuery` — Domain query structure
- `AssessmentEngineState` — Domain state structure
- `AssessmentEngineHealth` — Organ health status
- `AssessmentEngineAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: aec306b0_
