# InvestmentSystem — Interface Design
## System ID: SYS-FIN-INVESTMENT

### Public API Surface
- `PortfolioManagerService`: Exposes portfolio manager operations
- `TradingEngineService`: Exposes trading engine operations
- `RiskAnalyzerService`: Exposes risk analyzer operations
- `MarketDataFeedService`: Exposes market data feed operations
- `PerformanceReporterService`: Exposes performance reporter operations

### Event Contracts
- `PortfolioManagerEvent`: Domain events from portfolio manager
- `TradingEngineEvent`: Domain events from trading engine
- `RiskAnalyzerEvent`: Domain events from risk analyzer
- `MarketDataFeedEvent`: Domain events from market data feed
- `PerformanceReporterEvent`: Domain events from performance reporter

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
