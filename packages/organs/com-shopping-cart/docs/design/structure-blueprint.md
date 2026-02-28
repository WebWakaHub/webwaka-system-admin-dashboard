# ShoppingCart Organ — Structure Blueprint
## Organ ID: ORGX-COM-SHOPPING_CART

### Directory Structure
```
src/
├── ShoppingCartOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ShoppingCartCommandHandler.ts
│   └── ShoppingCartCommandValidator.ts
├── state/
│   ├── ShoppingCartStateStore.ts
│   └── ShoppingCartOfflineStore.ts
├── events/
│   ├── ShoppingCartEventEmitter.ts
│   └── ShoppingCartEventHandler.ts
├── validation/
│   └── ShoppingCartBusinessRules.ts
└── sync/
    ├── ShoppingCartSyncEngine.ts
    └── ShoppingCartConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: dfe8b03d_
