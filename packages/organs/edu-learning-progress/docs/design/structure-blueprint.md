# LearningProgress Organ — Structure Blueprint
## Organ ID: ORGX-EDU-LEARNING_PROGRESS

### Directory Structure
```
src/
├── LearningProgressOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── LearningProgressCommandHandler.ts
│   └── LearningProgressCommandValidator.ts
├── state/
│   ├── LearningProgressStateStore.ts
│   └── LearningProgressOfflineStore.ts
├── events/
│   ├── LearningProgressEventEmitter.ts
│   └── LearningProgressEventHandler.ts
├── validation/
│   └── LearningProgressBusinessRules.ts
└── sync/
    ├── LearningProgressSyncEngine.ts
    └── LearningProgressConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: d5daacc9_
