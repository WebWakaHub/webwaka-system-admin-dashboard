# ThreatDetection Organ — Structure Blueprint
## Organ ID: ORGX-SEC-THREAT_DETECTION

### Directory Structure
```
src/
├── ThreatDetectionOrgan.ts          # Main organ coordinator
├── types.ts                       # Domain types and interfaces
├── commands/
│   ├── ThreatDetectionCommandHandler.ts
│   └── ThreatDetectionCommandValidator.ts
├── state/
│   ├── ThreatDetectionStateStore.ts
│   └── ThreatDetectionOfflineStore.ts
├── events/
│   ├── ThreatDetectionEventEmitter.ts
│   └── ThreatDetectionEventHandler.ts
├── validation/
│   └── ThreatDetectionBusinessRules.ts
└── sync/
    ├── ThreatDetectionSyncEngine.ts
    └── ThreatDetectionConflictResolver.ts
```

### Module Boundaries
- Each subdirectory represents one tissue's implementation
- Cross-tissue imports are forbidden (enforced by ESLint rules)
- Shared types are defined in `types.ts` only

_Blueprint Hash: e006e378_
