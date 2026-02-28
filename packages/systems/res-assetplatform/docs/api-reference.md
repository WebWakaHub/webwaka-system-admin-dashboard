# AssetPlatformSystem — API Reference
## System ID: SYS-RES-ASSETPLATFORM

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Asset RegistryOrgan
- `initialize()`: Initialize asset registry
- `execute(command)`: Execute asset registry command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Lifecycle ManagerOrgan
- `initialize()`: Initialize lifecycle manager
- `execute(command)`: Execute lifecycle manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Maintenance SchedulerOrgan
- `initialize()`: Initialize maintenance scheduler
- `execute(command)`: Execute maintenance scheduler command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Depreciation CalculatorOrgan
- `initialize()`: Initialize depreciation calculator
- `execute(command)`: Execute depreciation calculator command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Audit TrailOrgan
- `initialize()`: Initialize audit trail
- `execute(command)`: Execute audit trail command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
