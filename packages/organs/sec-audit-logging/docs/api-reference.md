# AuditLogging Organ — API Reference
## Organ ID: ORGX-SEC-AUDIT_LOGGING

### Classes

#### `AuditLoggingOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: AuditLoggingCommand): Promise<AuditLoggingEvent>` — Execute a domain command
- `executeOffline(command: AuditLoggingCommand): AuditLoggingEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): AuditLoggingHealth` — Get organ health status
- `registerAIProvider(provider: AuditLoggingAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `AuditLoggingCommand` — Domain command structure
- `AuditLoggingEvent` — Domain event structure
- `AuditLoggingQuery` — Domain query structure
- `AuditLoggingState` — Domain state structure
- `AuditLoggingHealth` — Organ health status
- `AuditLoggingAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 16b1116b_
