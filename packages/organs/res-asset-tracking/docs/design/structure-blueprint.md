# AssetTracking Organ — Structure Blueprint
## Organ ID: ORGX-RES-ASSET_TRACKING

### Directory Structure
```
src/
├── AssetTrackingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── AssetTrackingCommandHandler.ts
│   └── AssetTrackingCommandValidator.ts
├── state/
│   ├── AssetTrackingStateStore.ts
│   └── AssetTrackingOfflineStore.ts
├── events/
│   ├── AssetTrackingEventEmitter.ts
│   └── AssetTrackingEventHandler.ts
├── validation/
│   └── AssetTrackingBusinessRules.ts
└── sync/
    ├── AssetTrackingSyncEngine.ts
    └── AssetTrackingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 07f38e68_
