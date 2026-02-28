# Authorization Organ — API Reference
## Organ ID: ORGX-IDA-AUTHORIZATION

### Classes

#### `AuthorizationOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AuthorizationCommand): Promise<AuthorizationEvent>` — Execute a domain command
- `executeOffline(command: AuthorizationCommand): AuthorizationEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AuthorizationHealth` — Get organ health status
- `registerAIProvider(provider: AuthorizationAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AuthorizationCommand` — Domain command structure
- `AuthorizationEvent` — Domain event structure
- `AuthorizationQuery` — Domain query structure
- `AuthorizationState` — Domain state structure
- `AuthorizationHealth` — Organ health status
- `AuthorizationAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 80dae5e1_
