# LearningProgress Organ

**Organ ID:** `ORGX-EDU-LEARNING_PROGRESS`  
**Version:** 0.1.0  
**Domain:** Education and Learning  
**Layer:** Organ (Business Capability Domain)

## Overview

The LearningProgress Organ encapsulates the business capability domain for education and learning operations within the WebWaka platform. It coordinates constituent tissues to deliver cohesive learning progress functionality with full offline-first support.

## Doctrine Compliance

| Doctrine | Status | Implementation |
|----------|--------|---------------|
| Build Once Use Infinitely | ✅ | Platform-agnostic organ coordination logic |
| Mobile First | ✅ | Optimized for mobile constraints and bandwidth |
| PWA First | ✅ | Service worker integration points defined |
| Offline First | ✅ | Full offline queue with sync-on-reconnect (NON-NEGOTIABLE) |
| Nigeria First | ✅ | 30s timeout, en-NG locale, NGN currency, NG region |
| Africa First | ✅ | Multi-region support with Africa-optimized CDN |
| Vendor Neutral AI | ✅ | Abstract inference interface, no vendor lock-in |

## Architecture

The organ follows a hexagonal architecture with CQRS and Event Sourcing patterns:

- **Command Coordinator** — Validates and routes domain commands
- **State Store** — Manages domain state with offline persistence
- **Event Mesh** — Internal domain event bus
- **Validation** — Business rule enforcement

## Nigeria-First Configuration

```typescript
const NIGERIA_FIRST_CONFIG = {
  timeout: 30_000,        // 30s for Nigerian network conditions
  locale: 'en-NG',        // Nigerian English
  currency: 'NGN',        // Nigerian Naira
  region: 'NG',           // Nigeria
  maxRetries: 5,          // Retry count for unreliable networks
  retryBackoff: 5_000,    // 5s initial backoff
  maxBackoff: 300_000,    // 5min max backoff
  offlineQueueCapacity: 1_000,  // Queue capacity
};
```

## Usage

```typescript
import { LearningProgressOrgan } from '@webwaka/organ-edu-learning-progress';

const organ = new LearningProgressOrgan();

// Execute command (auto-routes to offline if needed)
const event = await organ.execute({
  id: 'cmd-001',
  type: 'process',
  payload: { data: 'value' },
  timestamp: Date.now(),
  idempotencyKey: 'unique-key',
  source: 'ORGX-EDU-LEARNING_PROGRESS',
});

// Check health
const health = organ.getHealth();
```

## License

Proprietary — WebWaka Platform
