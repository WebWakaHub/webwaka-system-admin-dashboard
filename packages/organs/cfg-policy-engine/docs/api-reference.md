# PolicyEngine Organ — API Reference
## Organ ID: ORGX-CFG-POLICY_ENGINE

### Classes

#### `PolicyEngineOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PolicyEngineCommand): Promise<PolicyEngineEvent>` — Execute a domain command
- `executeOffline(command: PolicyEngineCommand): PolicyEngineEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PolicyEngineHealth` — Get organ health status
- `registerAIProvider(provider: PolicyEngineAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PolicyEngineCommand` — Domain command structure
- `PolicyEngineEvent` — Domain event structure
- `PolicyEngineQuery` — Domain query structure
- `PolicyEngineState` — Domain state structure
- `PolicyEngineHealth` — Organ health status
- `PolicyEngineAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 2fe54c92_
