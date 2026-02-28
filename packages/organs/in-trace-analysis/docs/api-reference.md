# TraceAnalysis Organ — API Reference
## Organ ID: ORGX-IN-TRACE_ANALYSIS

### Classes

#### `TraceAnalysisOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: TraceAnalysisCommand): Promise<TraceAnalysisEvent>` — Execute a domain command
- `executeOffline(command: TraceAnalysisCommand): TraceAnalysisEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): TraceAnalysisHealth` — Get organ health status
- `registerAIProvider(provider: TraceAnalysisAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `TraceAnalysisCommand` — Domain command structure
- `TraceAnalysisEvent` — Domain event structure
- `TraceAnalysisQuery` — Domain query structure
- `TraceAnalysisState` — Domain state structure
- `TraceAnalysisHealth` — Organ health status
- `TraceAnalysisAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: d4bea6ae_
