# EcommerceSystem — API Reference
## System ID: SYS-COM-ECOMMERCE

### System Coordinator
- `initialize()`: Initialize all organs
- `execute(organName, command)`: Execute command with offline fallback
- `executeOffline(organName, command)`: Queue command for offline execution
- `sync()`: Synchronize offline queue
- `getHealth()`: Get health status of all organs
- `getCapabilities()`: List system capabilities
- `getOfflineQueueStatus()`: Get offline queue metrics

### Organ Interfaces
#### Product CatalogOrgan
- `initialize()`: Initialize product catalog
- `execute(command)`: Execute product catalog command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Shopping CartOrgan
- `initialize()`: Initialize shopping cart
- `execute(command)`: Execute shopping cart command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Checkout EngineOrgan
- `initialize()`: Initialize checkout engine
- `execute(command)`: Execute checkout engine command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Order ManagerOrgan
- `initialize()`: Initialize order manager
- `execute(command)`: Execute order manager command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
#### Payment GatewayOrgan
- `initialize()`: Initialize payment gateway
- `execute(command)`: Execute payment gateway command
- `executeOffline(command)`: Offline execution
- `getHealth()`: Health check
