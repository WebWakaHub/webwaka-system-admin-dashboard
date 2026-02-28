# ContentManagement Organ — Structure Blueprint
## Organ ID: ORGX-MED-CONTENT_MANAGEMENT

### Directory Structure
```
src/
├── ContentManagementOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ContentManagementCommandHandler.ts
│   └── ContentManagementCommandValidator.ts
├── state/
│   ├── ContentManagementStateStore.ts
│   └── ContentManagementOfflineStore.ts
├── events/
│   ├── ContentManagementEventEmitter.ts
│   └── ContentManagementEventHandler.ts
├── validation/
│   └── ContentManagementBusinessRules.ts
└── sync/
    ├── ContentManagementSyncEngine.ts
    └── ContentManagementConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 2e23bd2b_
