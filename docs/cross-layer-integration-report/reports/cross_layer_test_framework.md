# Cross-Layer Integration Test Framework

## Test Dimensions

### D1: Structural Integrity (per repo)
- Repository exists and is accessible
- Has commits (not empty)
- Has correct agent identity in commits
- Has required file structure (src/, docs/, tests/, package.json, README.md)
- Source files contain entity/types
- Test files present

### D2: Issue Lifecycle Integrity (per universe repo)
- All issues are in closed state
- No orphaned open issues
- Issue count matches expected

### D3: Doctrine Compliance (per implementation repo)
- Offline-first: offline/queue/sync keywords in source
- Nigeria-first: en-NG, Africa/Lagos, NGN, 30000 in source
- Mobile-first: mobile/responsive keywords in docs
- PWA-first: service worker/pwa keywords in docs
- Vendor Neutral AI: vendor-neutral/pluggable in AI components

### D4: Cross-Layer Composition Verification
- Organelles compose into Cells (cell references organelle types)
- Cells compose into Tissues (tissue references cell types)
- Tissues compose into Organs (organ references tissue types)
- Organs compose into Systems (system references organ types)
- Systems compose into Organism (organism references system types)

### D5: Interface Contract Consistency
- Types.ts exports consistent interfaces across layers
- Entity.ts follows layer-appropriate method naming
- Package.json has correct naming convention

### D6: Deployment Readiness
- All repos have package.json with build scripts
- All repos have TypeScript source
- No deployment-specific logic in organism layer
- Constitutional compliance chain intact

## Repos to Test: 124 implementation + 7 universe = 131 total
