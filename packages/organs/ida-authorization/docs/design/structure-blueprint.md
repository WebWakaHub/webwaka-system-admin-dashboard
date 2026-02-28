# Authorization Organ — Structure Blueprint
## Organ ID: ORGX-IDA-AUTHORIZATION

### Directory Structure
```
src/
├── AuthorizationOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── AuthorizationCommandHandler.ts
│   └── AuthorizationCommandValidator.ts
├── state/
│   ├── AuthorizationStateStore.ts
│   └── AuthorizationOfflineStore.ts
├── events/
│   ├── AuthorizationEventEmitter.ts
│   └── AuthorizationEventHandler.ts
├── validation/
│   └── AuthorizationBusinessRules.ts
└── sync/
    ├── AuthorizationSyncEngine.ts
    └── AuthorizationConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 80dae5e1_
