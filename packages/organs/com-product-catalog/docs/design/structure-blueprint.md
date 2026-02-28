# ProductCatalog Organ — Structure Blueprint
## Organ ID: ORGX-COM-PRODUCT_CATALOG

### Directory Structure
```
src/
├── ProductCatalogOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ProductCatalogCommandHandler.ts
│   └── ProductCatalogCommandValidator.ts
├── state/
│   ├── ProductCatalogStateStore.ts
│   └── ProductCatalogOfflineStore.ts
├── events/
│   ├── ProductCatalogEventEmitter.ts
│   └── ProductCatalogEventHandler.ts
├── validation/
│   └── ProductCatalogBusinessRules.ts
└── sync/
    ├── ProductCatalogSyncEngine.ts
    └── ProductCatalogConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: 336d8838_
