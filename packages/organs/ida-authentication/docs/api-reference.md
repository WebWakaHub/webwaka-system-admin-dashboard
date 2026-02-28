# Authentication Organ — API Reference
## Organ ID: ORGX-IDA-AUTHENTICATION

### Classes

#### `AuthenticationOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AuthenticationCommand): Promise<AuthenticationEvent>` — Execute a domain command
- `executeOffline(command: AuthenticationCommand): AuthenticationEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AuthenticationHealth` — Get organ health status
- `registerAIProvider(provider: AuthenticationAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AuthenticationCommand` — Domain command structure
- `AuthenticationEvent` — Domain event structure
- `AuthenticationQuery` — Domain query structure
- `AuthenticationState` — Domain state structure
- `AuthenticationHealth` — Organ health status
- `AuthenticationAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: c314b632_
