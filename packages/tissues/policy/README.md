# PolicyTissue

> **Tissue ID:** `TIS-POLICY-v0.1.0`  
> **Classification:** Structural Boundary  
> **Package:** `@webwaka/tissue-policy`

## Overview

Policy enforcement tissue that coordinates policy evaluation across cells, ensuring constitutional compliance with offline-first policy caching for Nigeria-first operation.

## Composed Cells

- `CEL-POLICYEVAL`
- `CEL-POLICYSTORE`
- `CEL-AUDITLOG`

## Doctrine Compliance

| Doctrine | Status |
|----------|--------|
| Build Once Use Infinitely | Enforced |
| Mobile First | Enforced |
| PWA First | Enforced |
| Offline First (NON-NEGOTIABLE) | Enforced |
| Nigeria First | Enforced — 30s timeout, en-NG locale, 2G-aware |
| Africa First | Enforced — Lagos-primary datacenter |
| Vendor Neutral AI | Enforced — No vendor lock-in |

## Architecture

The PolicyTissue tissue coordinates 3 cells through an event-driven coordination engine with:

- **Offline-First Queue**: All requests persisted to IndexedDB before execution
- **Nigeria-First Network Awareness**: Adaptive timeouts based on connection quality
- **Graceful Degradation**: Partial results when some cells are unavailable
- **Vector Clock Sync**: Conflict resolution for offline-to-online transitions

## API

```typescript
import { PolicyTissue } from '@webwaka/tissue-policy';

const tissue = new PolicyTissue();

// Coordinate across cells
const result = await tissue.coordinate({
  requestId: 'unique-id',
  sourceCell: 'CEL-POLICYEVAL',
  targetCells: ['CEL-POLICYEVAL', 'CEL-POLICYSTORE', 'CEL-AUDITLOG'],
  payload: { action: 'example' },
  timeout: 30000,  // Nigeria-first default
  locale: 'en-NG',
  offlineCapable: true,
});

// Sync offline queue
const syncResult = await tissue.sync({
  syncId: 'sync-id',
  lastSyncTimestamp: Date.now() - 60000,
  vectorClock: new Map(),
  conflictStrategy: 'last-write-wins',
});
```

## Constitutional Compliance

This tissue complies with the Tissue Layer Constitution:
- Composed exclusively of Cells
- No raw organelles
- No business-domain semantics
- No UI implementation
- Classification: Structural Boundary
