# PortfolioAnalysis Organ — API Reference
## Organ ID: ORGX-FIN-PORTFOLIO_ANALYSIS

### Classes

#### `PortfolioAnalysisOrgan`
Main organ coordinator class.

**Methods:**
- `execute(command: PortfolioAnalysisCommand): Promise<PortfolioAnalysisEvent>` — Execute a domain command
- `executeOffline(command: PortfolioAnalysisCommand): PortfolioAnalysisEvent` — Queue command for offline execution
- `sync(): Promise<void>` — Sync offline queue when network is restored
- `getHealth(): PortfolioAnalysisHealth` — Get organ health status
- `registerAIProvider(provider: PortfolioAnalysisAIInference): void` — Register vendor-neutral AI provider
- `on(eventType: string, handler: Function): void` — Subscribe to domain events

### Interfaces
- `PortfolioAnalysisCommand` — Domain command structure
- `PortfolioAnalysisEvent` — Domain event structure
- `PortfolioAnalysisQuery` — Domain query structure
- `PortfolioAnalysisState` — Domain state structure
- `PortfolioAnalysisHealth` — Organ health status
- `PortfolioAnalysisAIInference` — Vendor-neutral AI interface
- `OfflineQueueEntry` — Offline queue entry structure
- `NetworkConfig` — Network configuration

_API Reference Hash: 352a822f_
