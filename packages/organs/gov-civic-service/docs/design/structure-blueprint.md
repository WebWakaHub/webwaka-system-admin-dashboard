# CivicService Organ — Structure Blueprint
## Organ ID: ORGX-GOV-CIVIC_SERVICE

### Directory Structure
```
src/
├── CivicServiceOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── CivicServiceCommandHandler.ts
│   └── CivicServiceCommandValidator.ts
├── state/
│   ├── CivicServiceStateStore.ts
│   └── CivicServiceOfflineStore.ts
├── events/
│   ├── CivicServiceEventEmitter.ts
│   └── CivicServiceEventHandler.ts
├── validation/
│   └── CivicServiceBusinessRules.ts
└── sync/
    ├── CivicServiceSyncEngine.ts
    └── CivicServiceConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: b85d3fd7_
