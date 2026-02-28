# BankingSystem — API Reference
## System ID: SYS-FIN-BANKING

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Account ManagerOrgan
- `initialize()`: Initialize account manager
- `execute(command)`: Execute account manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Transaction EngineOrgan
- `initialize()`: Initialize transaction engine
- `execute(command)`: Execute transaction engine command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Compliance MonitorOrgan
- `initialize()`: Initialize compliance monitor
- `execute(command)`: Execute compliance monitor command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Statement GeneratorOrgan
- `initialize()`: Initialize statement generator
- `execute(command)`: Execute statement generator command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Interest CalculatorOrgan
- `initialize()`: Initialize interest calculator
- `execute(command)`: Execute interest calculator command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
