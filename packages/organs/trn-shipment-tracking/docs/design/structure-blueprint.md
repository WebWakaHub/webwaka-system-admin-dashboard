# ShipmentTracking Organ — Structure Blueprint
## Organ ID: ORGX-TRN-SHIPMENT_TRACKING

### Directory Structure
```
src/
├── ShipmentTrackingOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ShipmentTrackingCommandHandler.ts
│   └── ShipmentTrackingCommandValidator.ts
├── state/
│   ├── ShipmentTrackingStateStore.ts
│   └── ShipmentTrackingOfflineStore.ts
├── events/
│   ├── ShipmentTrackingEventEmitter.ts
│   └── ShipmentTrackingEventHandler.ts
├── validation/
│   └── ShipmentTrackingBusinessRules.ts
└── sync/
    ├── ShipmentTrackingSyncEngine.ts
    └── ShipmentTrackingConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: b75ce27f_
