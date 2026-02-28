# AssessmentEngine Organ — Structure Blueprint
## Organ ID: ORGX-EDU-ASSESSMENT_ENGINE

### Directory Structure
```
src/
├── AssessmentEngineOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── AssessmentEngineCommandHandler.ts
│   └── AssessmentEngineCommandValidator.ts
├── state/
│   ├── AssessmentEngineStateStore.ts
│   └── AssessmentEngineOfflineStore.ts
├── events/
│   ├── AssessmentEngineEventEmitter.ts
│   └── AssessmentEngineEventHandler.ts
├── validation/
│   └── AssessmentEngineBusinessRules.ts
└── sync/
    ├── AssessmentEngineSyncEngine.ts
    └── AssessmentEngineConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: aec306b0_
