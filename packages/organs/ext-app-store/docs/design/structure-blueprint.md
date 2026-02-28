# AppStore Organ — Structure Blueprint
## Organ ID: ORGX-EXT-APP_STORE

### Directory Structure
```
src/
├── AppStoreOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── AppStoreCommandHandler.ts
│   └── AppStoreCommandValidator.ts
├── state/
│   ├── AppStoreStateStore.ts
│   └── AppStoreOfflineStore.ts
├── events/
│   ├── AppStoreEventEmitter.ts
│   └── AppStoreEventHandler.ts
├── validation/
│   └── AppStoreBusinessRules.ts
└── sync/
    ├── AppStoreSyncEngine.ts
    └── AppStoreConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 7c7e5e6e_
