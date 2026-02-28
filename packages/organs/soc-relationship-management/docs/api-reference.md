# RelationshipManagement Organ — API Reference
## Organ ID: ORGX-SOC-RELATIONSHIP_MANAGEMENT

### Classes

#### `RelationshipManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: RelationshipManagementCommand): Promise<RelationshipManagementEvent>` — Execute a domain command
- `executeOffline(command: RelationshipManagementCommand): RelationshipManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): RelationshipManagementHealth` — Get organ health status
- `registerAIProvider(provider: RelationshipManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `RelationshipManagementCommand` — Domain command structure
- `RelationshipManagementEvent` — Domain event structure
- `RelationshipManagementQuery` — Domain query structure
- `RelationshipManagementState` — Domain state structure
- `RelationshipManagementHealth` — Organ health status
- `RelationshipManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 1e0d160f_
