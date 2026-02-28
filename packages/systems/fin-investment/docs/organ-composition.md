# InvestmentSystem — Organ Composition Map
## System ID: SYS-FIN-INVESTMENT

### Composition Diagram
```
InvestmentSystem
  ├── Portfolio Manager
  ├── Trading Engine
  ├── Risk Analyzer
  ├── Market Data Feed
  └── Performance Reporter
```

### Integration Patterns
All organs communicate through the System Coordinator using event-driven messaging.
Offline operations are queued and synced automatically when connectivity is restored.
