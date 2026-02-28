# TrainingPipeline Organ — Structure Blueprint
## Organ ID: ORGX-AI-TRAINING_PIPELINE

### Directory Structure
```
src/
├── TrainingPipelineOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── TrainingPipelineCommandHandler.ts
│   └── TrainingPipelineCommandValidator.ts
├── state/
│   ├── TrainingPipelineStateStore.ts
│   └── TrainingPipelineOfflineStore.ts
├── events/
│   ├── TrainingPipelineEventEmitter.ts
│   └── TrainingPipelineEventHandler.ts
├── validation/
│   └── TrainingPipelineBusinessRules.ts
└── sync/
    ├── TrainingPipelineSyncEngine.ts
    └── TrainingPipelineConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 80ffa819_
