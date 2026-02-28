# CourseManagement Organ — API Reference
## Organ ID: ORGX-EDU-COURSE_MANAGEMENT

### Classes

#### `CourseManagementOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: CourseManagementCommand): Promise<CourseManagementEvent>` — Execute a domain command
- `executeOffline(command: CourseManagementCommand): CourseManagementEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): CourseManagementHealth` — Get organ health status
- `registerAIProvider(provider: CourseManagementAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `CourseManagementCommand` — Domain command structure
- `CourseManagementEvent` — Domain event structure
- `CourseManagementQuery` — Domain query structure
- `CourseManagementState` — Domain state structure
- `CourseManagementHealth` — Organ health status
- `CourseManagementAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 137510d8_
