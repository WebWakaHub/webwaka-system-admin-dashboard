# AssetPlatformSystem — Interface Design
## System ID: SYS-RES-ASSETPLATFORM

### Public API Surface
- `AssetRegistryService`: Exposes asset registry operations
- `LifecycleManagerService`: Exposes lifecycle manager operations
- `MaintenanceSchedulerService`: Exposes maintenance scheduler operations
- `DepreciationCalculatorService`: Exposes depreciation calculator operations
- `AuditTrailService`: Exposes audit trail operations

### Event Contracts
- `AssetRegistryEvent`: Domain events from asset registry
- `LifecycleManagerEvent`: Domain events from lifecycle manager
- `MaintenanceSchedulerEvent`: Domain events from maintenance scheduler
- `DepreciationCalculatorEvent`: Domain events from depreciation calculator
- `AuditTrailEvent`: Domain events from audit trail

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
