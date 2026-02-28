# ContentDistribution Organ — Structure Blueprint
## Organ ID: ORGX-MED-CONTENT_DISTRIBUTION

### Directory Structure
```
src/
├── ContentDistributionOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ContentDistributionCommandHandler.ts
│   └── ContentDistributionCommandValidator.ts
├── state/
│   ├── ContentDistributionStateStore.ts
│   └── ContentDistributionOfflineStore.ts
├── events/
│   ├── ContentDistributionEventEmitter.ts
│   └── ContentDistributionEventHandler.ts
├── validation/
│   └── ContentDistributionBusinessRules.ts
└── sync/
    ├── ContentDistributionSyncEngine.ts
    └── ContentDistributionConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 1a1d71c9_
