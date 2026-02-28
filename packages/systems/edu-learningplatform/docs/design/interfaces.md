# LearningPlatformSystem — Interface Design
## System ID: SYS-EDU-LEARNINGPLATFORM

### Public API Surface
- `CourseManagerService`: Exposes course manager operations
- `AssessmentEngineService`: Exposes assessment engine operations
- `LearnerProfileService`: Exposes learner profile operations
- `ContentDeliveryService`: Exposes content delivery operations
- `ProgressTrackerService`: Exposes progress tracker operations

### Event Contracts
- `CourseManagerEvent`: Domain events from course manager
- `AssessmentEngineEvent`: Domain events from assessment engine
- `LearnerProfileEvent`: Domain events from learner profile
- `ContentDeliveryEvent`: Domain events from content delivery
- `ProgressTrackerEvent`: Domain events from progress tracker

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
