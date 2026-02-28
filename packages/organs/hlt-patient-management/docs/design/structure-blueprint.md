# PatientManagement Organ — Structure Blueprint
## Organ ID: ORGX-HLT-PATIENT_MANAGEMENT

### Directory Structure
```
src/
├── PatientManagementOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── PatientManagementCommandHandler.ts
│   └── PatientManagementCommandValidator.ts
├── state/
│   ├── PatientManagementStateStore.ts
│   └── PatientManagementOfflineStore.ts
├── events/
│   ├── PatientManagementEventEmitter.ts
│   └── PatientManagementEventHandler.ts
├── validation/
│   └── PatientManagementBusinessRules.ts
└── sync/
    ├── PatientManagementSyncEngine.ts
    └── PatientManagementConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: d94d097d_
