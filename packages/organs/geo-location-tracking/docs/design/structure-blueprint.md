# LocationTracking Organ — Structure Blueprint
## Organ ID: ORGX-GEO-LOCATION_TRACKING

### Directory Structure
```
src/
├── LocationTrackingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── LocationTrackingCommandHandler.ts
│   └── LocationTrackingCommandValidator.ts
├── state/
│   ├── LocationTrackingStateStore.ts
│   └── LocationTrackingOfflineStore.ts
├── events/
│   ├── LocationTrackingEventEmitter.ts
│   └── LocationTrackingEventHandler.ts
├── validation/
│   └── LocationTrackingBusinessRules.ts
└── sync/
    ├── LocationTrackingSyncEngine.ts
    └── LocationTrackingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: a71b5b26_
