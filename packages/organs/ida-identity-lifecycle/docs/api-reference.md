# IdentityLifecycle Organ — API Reference
## Organ ID: ORGX-IDA-IDENTITY_LIFECYCLE

### Classes

#### `IdentityLifecycleOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: IdentityLifecycleCommand): Promise<IdentityLifecycleEvent>` — Execute a domain command
- `executeOffline(command: IdentityLifecycleCommand): IdentityLifecycleEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): IdentityLifecycleHealth` — Get organ health status
- `registerAIProvider(provider: IdentityLifecycleAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `IdentityLifecycleCommand` — Domain command structure
- `IdentityLifecycleEvent` — Domain event structure
- `IdentityLifecycleQuery` — Domain query structure
- `IdentityLifecycleState` — Domain state structure
- `IdentityLifecycleHealth` — Organ health status
- `IdentityLifecycleAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 10ad8302_
