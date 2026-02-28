# HealthRecords Organ — Structure Blueprint
## Organ ID: ORGX-HLT-HEALTH_RECORDS

### Directory Structure
```
src/
├── HealthRecordsOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── HealthRecordsCommandHandler.ts
│   └── HealthRecordsCommandValidator.ts
├── state/
│   ├── HealthRecordsStateStore.ts
│   └── HealthRecordsOfflineStore.ts
├── events/
│   ├── HealthRecordsEventEmitter.ts
│   └── HealthRecordsEventHandler.ts
├── validation/
│   └── HealthRecordsBusinessRules.ts
└── sync/
    ├── HealthRecordsSyncEngine.ts
    └── HealthRecordsConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 612de931_
