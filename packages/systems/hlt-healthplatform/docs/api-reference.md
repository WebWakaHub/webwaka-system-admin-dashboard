# HealthPlatformSystem — API Reference
## System ID: SYS-HLT-HEALTHPLATFORM

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Patient RegistryOrgan
- `initialize()`: Initialize patient registry
- `execute(command)`: Execute patient registry command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Clinical RecordOrgan
- `initialize()`: Initialize clinical record
- `execute(command)`: Execute clinical record command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Appointment SchedulerOrgan
- `initialize()`: Initialize appointment scheduler
- `execute(command)`: Execute appointment scheduler command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Prescription ManagerOrgan
- `initialize()`: Initialize prescription manager
- `execute(command)`: Execute prescription manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Health AnalyticsOrgan
- `initialize()`: Initialize health analytics
- `execute(command)`: Execute health analytics command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
