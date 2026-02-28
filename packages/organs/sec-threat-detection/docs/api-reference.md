# ThreatDetection Organ — API Reference
## Organ ID: ORGX-SEC-THREAT_DETECTION

### Classes

#### `ThreatDetectionOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: ThreatDetectionCommand): Promise<ThreatDetectionEvent>` — Execute a domain command
- `executeOffline(command: ThreatDetectionCommand): ThreatDetectionEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): ThreatDetectionHealth` — Get organ health status
- `registerAIProvider(provider: ThreatDetectionAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `ThreatDetectionCommand` — Domain command structure
- `ThreatDetectionEvent` — Domain event structure
- `ThreatDetectionQuery` — Domain query structure
- `ThreatDetectionState` — Domain state structure
- `ThreatDetectionHealth` — Organ health status
- `ThreatDetectionAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: e006e378_
