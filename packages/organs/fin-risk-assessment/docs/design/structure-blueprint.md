# RiskAssessment Organ — Structure Blueprint
## Organ ID: ORGX-FIN-RISK_ASSESSMENT

### Directory Structure
```
src/
├── RiskAssessmentOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── RiskAssessmentCommandHandler.ts
│   └── RiskAssessmentCommandValidator.ts
├── state/
│   ├── RiskAssessmentStateStore.ts
│   └── RiskAssessmentOfflineStore.ts
├── events/
│   ├── RiskAssessmentEventEmitter.ts
│   └── RiskAssessmentEventHandler.ts
├── validation/
│   └── RiskAssessmentBusinessRules.ts
└── sync/
    ├── RiskAssessmentSyncEngine.ts
    └── RiskAssessmentConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 373b2591_
