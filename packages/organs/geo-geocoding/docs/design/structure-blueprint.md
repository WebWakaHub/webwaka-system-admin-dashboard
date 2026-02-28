# Geocoding Organ — Structure Blueprint
## Organ ID: ORGX-GEO-GEOCODING

### Directory Structure
```
src/
├── GeocodingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── GeocodingCommandHandler.ts
│   └── GeocodingCommandValidator.ts
├── state/
│   ├── GeocodingStateStore.ts
│   └── GeocodingOfflineStore.ts
├── events/
│   ├── GeocodingEventEmitter.ts
│   └── GeocodingEventHandler.ts
├── validation/
│   └── GeocodingBusinessRules.ts
└── sync/
    ├── GeocodingSyncEngine.ts
    └── GeocodingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: af2fffae_
