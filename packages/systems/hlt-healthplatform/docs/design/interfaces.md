# HealthPlatformSystem — Interface Design
## System ID: SYS-HLT-HEALTHPLATFORM

### Public API Surface
- `PatientRegistryService`: Exposes patient registry operations
- `ClinicalRecordService`: Exposes clinical record operations
- `AppointmentSchedulerService`: Exposes appointment scheduler operations
- `PrescriptionManagerService`: Exposes prescription manager operations
- `HealthAnalyticsService`: Exposes health analytics operations

### Event Contracts
- `PatientRegistryEvent`: Domain events from patient registry
- `ClinicalRecordEvent`: Domain events from clinical record
- `AppointmentSchedulerEvent`: Domain events from appointment scheduler
- `PrescriptionManagerEvent`: Domain events from prescription manager
- `HealthAnalyticsEvent`: Domain events from health analytics

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
