# AccountManagement Organ — Structure Blueprint
## Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT

### Directory Structure
```
src/
├── AccountManagementOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── AccountManagementCommandHandler.ts
│   └── AccountManagementCommandValidator.ts
├── state/
│   ├── AccountManagementStateStore.ts
│   └── AccountManagementOfflineStore.ts
├── events/
│   ├── AccountManagementEventEmitter.ts
│   └── AccountManagementEventHandler.ts
├── validation/
│   └── AccountManagementBusinessRules.ts
└── sync/
    ├── AccountManagementSyncEngine.ts
    └── AccountManagementConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 8d5f6cbe_
