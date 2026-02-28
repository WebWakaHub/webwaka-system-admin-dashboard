# IdentityPlatformSystem — API Reference
## System ID: SYS-IDA-IDENTITYPLATFORM

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Auth ProviderOrgan
- `initialize()`: Initialize auth provider
- `execute(command)`: Execute auth provider command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Permission EngineOrgan
- `initialize()`: Initialize permission engine
- `execute(command)`: Execute permission engine command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Identity StoreOrgan
- `initialize()`: Initialize identity store
- `execute(command)`: Execute identity store command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Session ManagerOrgan
- `initialize()`: Initialize session manager
- `execute(command)`: Execute session manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Audit LoggerOrgan
- `initialize()`: Initialize audit logger
- `execute(command)`: Execute audit logger command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
