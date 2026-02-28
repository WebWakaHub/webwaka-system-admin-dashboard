# InvestmentSystem — API Reference
## System ID: SYS-FIN-INVESTMENT

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Portfolio ManagerOrgan
- `initialize()`: Initialize portfolio manager
- `execute(command)`: Execute portfolio manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Trading EngineOrgan
- `initialize()`: Initialize trading engine
- `execute(command)`: Execute trading engine command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Risk AnalyzerOrgan
- `initialize()`: Initialize risk analyzer
- `execute(command)`: Execute risk analyzer command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Market Data FeedOrgan
- `initialize()`: Initialize market data feed
- `execute(command)`: Execute market data feed command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Performance ReporterOrgan
- `initialize()`: Initialize performance reporter
- `execute(command)`: Execute performance reporter command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
