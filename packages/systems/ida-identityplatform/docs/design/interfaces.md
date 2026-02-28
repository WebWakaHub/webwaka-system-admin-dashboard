# IdentityPlatformSystem — Interface Design
## System ID: SYS-IDA-IDENTITYPLATFORM

### Public API Surface
- `AuthProviderService`: Exposes auth provider operations
- `PermissionEngineService`: Exposes permission engine operations
- `IdentityStoreService`: Exposes identity store operations
- `SessionManagerService`: Exposes session manager operations
- `AuditLoggerService`: Exposes audit logger operations

### Event Contracts
- `AuthProviderEvent`: Domain events from auth provider
- `PermissionEngineEvent`: Domain events from permission engine
- `IdentityStoreEvent`: Domain events from identity store
- `SessionManagerEvent`: Domain events from session manager
- `AuditLoggerEvent`: Domain events from audit logger

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
