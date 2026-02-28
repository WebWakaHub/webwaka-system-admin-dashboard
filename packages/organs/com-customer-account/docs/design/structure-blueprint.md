# CustomerAccount Organ — Structure Blueprint
## Organ ID: ORGX-COM-CUSTOMER_ACCOUNT

### Directory Structure
```
src/
├── CustomerAccountOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── CustomerAccountCommandHandler.ts
│   └── CustomerAccountCommandValidator.ts
├── state/
│   ├── CustomerAccountStateStore.ts
│   └── CustomerAccountOfflineStore.ts
├── events/
│   ├── CustomerAccountEventEmitter.ts
│   └── CustomerAccountEventHandler.ts
├── validation/
│   └── CustomerAccountBusinessRules.ts
└── sync/
    ├── CustomerAccountSyncEngine.ts
    └── CustomerAccountConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: f97645b8_
