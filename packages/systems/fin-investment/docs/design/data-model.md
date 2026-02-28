# InvestmentSystem — Data Model Design
## System ID: SYS-FIN-INVESTMENT

### Core Entities
- `PortfolioManagerEntity`: Primary entity for portfolio manager organ
- `TradingEngineEntity`: Primary entity for trading engine organ
- `RiskAnalyzerEntity`: Primary entity for risk analyzer organ
- `MarketDataFeedEntity`: Primary entity for market data feed organ
- `PerformanceReporterEntity`: Primary entity for performance reporter organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
