# ClinicalWorkflow Organ — API Reference
## Organ ID: ORGX-HLT-CLINICAL_WORKFLOW

### Classes

#### `ClinicalWorkflowOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ClinicalWorkflowCommand): Promise<ClinicalWorkflowEvent>` — Execute a domain command
- `executeOffline(command: ClinicalWorkflowCommand): ClinicalWorkflowEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ClinicalWorkflowHealth` — Get organ health status
- `registerAIProvider(provider: ClinicalWorkflowAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ClinicalWorkflowCommand` — Domain command structure
- `ClinicalWorkflowEvent` — Domain event structure
- `ClinicalWorkflowQuery` — Domain query structure
- `ClinicalWorkflowState` — Domain state structure
- `ClinicalWorkflowHealth` — Organ health status
- `ClinicalWorkflowAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 79667bcf_
