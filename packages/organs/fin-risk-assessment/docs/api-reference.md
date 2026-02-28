# RiskAssessment Organ — API Reference
## Organ ID: ORGX-FIN-RISK_ASSESSMENT

### Classes

#### `RiskAssessmentOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: RiskAssessmentCommand): Promise<RiskAssessmentEvent>` — Execute a domain command
- `executeOffline(command: RiskAssessmentCommand): RiskAssessmentEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): RiskAssessmentHealth` — Get organ health status
- `registerAIProvider(provider: RiskAssessmentAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `RiskAssessmentCommand` — Domain command structure
- `RiskAssessmentEvent` — Domain event structure
- `RiskAssessmentQuery` — Domain query structure
- `RiskAssessmentState` — Domain state structure
- `RiskAssessmentHealth` — Organ health status
- `RiskAssessmentAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 373b2591_
