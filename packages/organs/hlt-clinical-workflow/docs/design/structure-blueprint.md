# ClinicalWorkflow Organ — Structure Blueprint
## Organ ID: ORGX-HLT-CLINICAL_WORKFLOW

### Directory Structure
```
src/
├── ClinicalWorkflowOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ClinicalWorkflowCommandHandler.ts
│   └── ClinicalWorkflowCommandValidator.ts
├── state/
│   ├── ClinicalWorkflowStateStore.ts
│   └── ClinicalWorkflowOfflineStore.ts
├── events/
│   ├── ClinicalWorkflowEventEmitter.ts
│   └── ClinicalWorkflowEventHandler.ts
├── validation/
│   └── ClinicalWorkflowBusinessRules.ts
└── sync/
    ├── ClinicalWorkflowSyncEngine.ts
    └── ClinicalWorkflowConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 79667bcf_
