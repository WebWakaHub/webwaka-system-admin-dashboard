# RegulatoryCompliance Organ — API Reference
## Organ ID: ORGX-GOV-REGULATORY_COMPLIANCE

### Classes

#### `RegulatoryComplianceOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: RegulatoryComplianceCommand): Promise<RegulatoryComplianceEvent>` — Execute a domain command
- `executeOffline(command: RegulatoryComplianceCommand): RegulatoryComplianceEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): RegulatoryComplianceHealth` — Get organ health status
- `registerAIProvider(provider: RegulatoryComplianceAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `RegulatoryComplianceCommand` — Domain command structure
- `RegulatoryComplianceEvent` — Domain event structure
- `RegulatoryComplianceQuery` — Domain query structure
- `RegulatoryComplianceState` — Domain state structure
- `RegulatoryComplianceHealth` — Organ health status
- `RegulatoryComplianceAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: bb2e2e3c_
