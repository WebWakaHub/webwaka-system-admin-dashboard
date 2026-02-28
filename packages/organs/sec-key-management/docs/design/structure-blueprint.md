# KeyManagement Organ — Structure Blueprint
## Organ ID: ORGX-SEC-KEY_MANAGEMENT

### Directory Structure
```
src/
├── KeyManagementOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── KeyManagementCommandHandler.ts
│   └── KeyManagementCommandValidator.ts
├── state/
│   ├── KeyManagementStateStore.ts
│   └── KeyManagementOfflineStore.ts
├── events/
│   ├── KeyManagementEventEmitter.ts
│   └── KeyManagementEventHandler.ts
├── validation/
│   └── KeyManagementBusinessRules.ts
└── sync/
    ├── KeyManagementSyncEngine.ts
    └── KeyManagementConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 2f005031_
