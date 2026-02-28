# BankingSystem — Interface Design
## System ID: SYS-FIN-BANKING

### Public API Surface
- `AccountManagerService`: Exposes account manager operations
- `TransactionEngineService`: Exposes transaction engine operations
- `ComplianceMonitorService`: Exposes compliance monitor operations
- `StatementGeneratorService`: Exposes statement generator operations
- `InterestCalculatorService`: Exposes interest calculator operations

### Event Contracts
- `AccountManagerEvent`: Domain events from account manager
- `TransactionEngineEvent`: Domain events from transaction engine
- `ComplianceMonitorEvent`: Domain events from compliance monitor
- `StatementGeneratorEvent`: Domain events from statement generator
- `InterestCalculatorEvent`: Domain events from interest calculator

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
