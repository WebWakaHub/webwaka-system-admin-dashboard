# MetricsCollection Organ — Structure Blueprint
## Organ ID: ORGX-IN-METRICS_COLLECTION

### Directory Structure
```
src/
├── MetricsCollectionOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── MetricsCollectionCommandHandler.ts
│   └── MetricsCollectionCommandValidator.ts
├── state/
│   ├── MetricsCollectionStateStore.ts
│   └── MetricsCollectionOfflineStore.ts
├── events/
│   ├── MetricsCollectionEventEmitter.ts
│   └── MetricsCollectionEventHandler.ts
├── validation/
│   └── MetricsCollectionBusinessRules.ts
└── sync/
    ├── MetricsCollectionSyncEngine.ts
    └── MetricsCollectionConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 4eed02be_
