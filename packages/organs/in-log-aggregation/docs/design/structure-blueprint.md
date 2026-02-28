# LogAggregation Organ — Structure Blueprint
## Organ ID: ORGX-IN-LOG_AGGREGATION

### Directory Structure
```
src/
├── LogAggregationOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── LogAggregationCommandHandler.ts
│   └── LogAggregationCommandValidator.ts
├── state/
│   ├── LogAggregationStateStore.ts
│   └── LogAggregationOfflineStore.ts
├── events/
│   ├── LogAggregationEventEmitter.ts
│   └── LogAggregationEventHandler.ts
├── validation/
│   └── LogAggregationBusinessRules.ts
└── sync/
    ├── LogAggregationSyncEngine.ts
    └── LogAggregationConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 17014125_
