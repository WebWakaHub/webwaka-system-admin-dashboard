# ResourceScheduling Organ — Structure Blueprint
## Organ ID: ORGX-RES-RESOURCE_SCHEDULING

### Directory Structure
```
src/
├── ResourceSchedulingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ResourceSchedulingCommandHandler.ts
│   └── ResourceSchedulingCommandValidator.ts
├── state/
│   ├── ResourceSchedulingStateStore.ts
│   └── ResourceSchedulingOfflineStore.ts
├── events/
│   ├── ResourceSchedulingEventEmitter.ts
│   └── ResourceSchedulingEventHandler.ts
├── validation/
│   └── ResourceSchedulingBusinessRules.ts
└── sync/
    ├── ResourceSchedulingSyncEngine.ts
    └── ResourceSchedulingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: af78dd73_
