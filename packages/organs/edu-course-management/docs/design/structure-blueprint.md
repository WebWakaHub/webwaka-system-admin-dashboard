# CourseManagement Organ — Structure Blueprint
## Organ ID: ORGX-EDU-COURSE_MANAGEMENT

### Directory Structure
```
src/
├── CourseManagementOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── CourseManagementCommandHandler.ts
│   └── CourseManagementCommandValidator.ts
├── state/
│   ├── CourseManagementStateStore.ts
│   └── CourseManagementOfflineStore.ts
├── events/
│   ├── CourseManagementEventEmitter.ts
│   └── CourseManagementEventHandler.ts
├── validation/
│   └── CourseManagementBusinessRules.ts
└── sync/
    ├── CourseManagementSyncEngine.ts
    └── CourseManagementConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 137510d8_
