# ResourceRegistry — Deployment Guide

**Cell:** CEL-RESOURCEREG-v0.1.0

## Prerequisites

- Node.js >= 18
- TypeScript >= 5.0
- IndexedDB-compatible environment (browser or polyfill)

## Installation

```bash
npm install @webwaka/cell-resource-reg
```

## Configuration

```typescript
const config: ResourceRegistryConfig = {
  maxRetries: 3,
  timeoutMs: 30000,       // Nigeria-first: 30s
  offlineStorageKey: 'cel_resourcereg_queue',
  enableTelemetry: true,
  locale: 'en-NG',
  networkConfig: {
    defaultTimeoutMs: 30000,
    maxRetries: 3,
    backoffMultiplier: 2,
    initialBackoffMs: 1000,
    compressionThreshold: 1024,
  },
};
```

## PWA Integration

Register the service worker for offline support:

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## Mobile-First Deployment

- All UI components use responsive breakpoints
- Touch targets minimum 44x44px
- Data payloads compressed for low-bandwidth networks
- Images served as WebP with JPEG fallback

## Monitoring

The cell emits metrics via the `getMetrics()` method:
- `execution_duration_ms` — Command execution time
- `execution_success` — Successful execution count
- `execution_error` — Error count
- `offline_queue_size` — Pending offline operations
- `state_transition` — State machine transitions
