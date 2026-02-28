# Mapping Organ — Structure Blueprint
## Organ ID: ORGX-GEO-MAPPING

### Directory Structure
```
src/
├── MappingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── MappingCommandHandler.ts
│   └── MappingCommandValidator.ts
├── state/
│   ├── MappingStateStore.ts
│   └── MappingOfflineStore.ts
├── events/
│   ├── MappingEventEmitter.ts
│   └── MappingEventHandler.ts
├── validation/
│   └── MappingBusinessRules.ts
└── sync/
    ├── MappingSyncEngine.ts
    └── MappingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 85c28086_
