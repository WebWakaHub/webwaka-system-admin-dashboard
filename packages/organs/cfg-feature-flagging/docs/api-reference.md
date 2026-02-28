# FeatureFlagging Organ — API Reference
## Organ ID: ORGX-CFG-FEATURE_FLAGGING

### Classes

#### `FeatureFlaggingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: FeatureFlaggingCommand): Promise<FeatureFlaggingEvent>` — Execute a domain command
- `executeOffline(command: FeatureFlaggingCommand): FeatureFlaggingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): FeatureFlaggingHealth` — Get organ health status
- `registerAIProvider(provider: FeatureFlaggingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `FeatureFlaggingCommand` — Domain command structure
- `FeatureFlaggingEvent` — Domain event structure
- `FeatureFlaggingQuery` — Domain query structure
- `FeatureFlaggingState` — Domain state structure
- `FeatureFlaggingHealth` — Organ health status
- `FeatureFlaggingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 10199205_
