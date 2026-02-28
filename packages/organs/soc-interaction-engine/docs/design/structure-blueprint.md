# InteractionEngine Organ — Structure Blueprint
## Organ ID: ORGX-SOC-INTERACTION_ENGINE

### Directory Structure
```
src/
├── InteractionEngineOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── InteractionEngineCommandHandler.ts
│   └── InteractionEngineCommandValidator.ts
├── state/
│   ├── InteractionEngineStateStore.ts
│   └── InteractionEngineOfflineStore.ts
├── events/
│   ├── InteractionEngineEventEmitter.ts
│   └── InteractionEngineEventHandler.ts
├── validation/
│   └── InteractionEngineBusinessRules.ts
└── sync/
    ├── InteractionEngineSyncEngine.ts
    └── InteractionEngineConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: cb21a0ec_
