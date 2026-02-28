# PortfolioAnalysis Organ — Structure Blueprint
## Organ ID: ORGX-FIN-PORTFOLIO_ANALYSIS

### Directory Structure
```
src/
├── PortfolioAnalysisOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── PortfolioAnalysisCommandHandler.ts
│   └── PortfolioAnalysisCommandValidator.ts
├── state/
│   ├── PortfolioAnalysisStateStore.ts
│   └── PortfolioAnalysisOfflineStore.ts
├── events/
│   ├── PortfolioAnalysisEventEmitter.ts
│   └── PortfolioAnalysisEventHandler.ts
├── validation/
│   └── PortfolioAnalysisBusinessRules.ts
└── sync/
    ├── PortfolioAnalysisSyncEngine.ts
    └── PortfolioAnalysisConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 352a822f_
