# [ORG-EI-EXTERNAL_ADAPTER-v0.1.0-P1-T01] Design Task 1

**Structure:** `ORG-EI-EXTERNAL_ADAPTER-v0.1.0`
**Layer:** Organelle
**Issue:** #500
**Executing Agent:** webwakaagent3 (Architecture & System Design)

---

## 1. Architecture Overview

The External Adapter follows a Hexagonal Architecture (Ports & Adapters) pattern where the core domain logic is isolated from vendor-specific implementations through well-defined port interfaces.

```
┌──────────────────────────────────────────────────┐
│              Cell Layer (Consumer)                │
│                    │                               │
│           IExternalServicePort                     │
├────────────────────┤                               │
│  ExternalAdapter Core                              │
│  ┌───────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Circuit   │ │  Request   │ │  Response   │  │
│  │ Breaker   │ │  Router    │ │  Cache      │  │
│  └───────────┘ └────────────┘ └────────────┘  │
│  ┌───────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Rate      │ │  Retry     │ │  Offline    │  │
│  │ Limiter   │ │  Engine    │ │  Queue      │  │
│  └───────────┘ └────────────┘ └────────────┘  │
│  ┌───────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Marshaller│ │  Unmarshall│ │  Compliance │  │
│  └───────────┘ └────────────┘ └────────────┘  │
├────────────────────┤                               │
│           IVendorAdapter                           │
│  ┌────────┐ ┌─────────┐ ┌────────┐            │
│  │Paystack│ │Flutterw.│ │ Termii │  ...       │
│  └────────┘ └─────────┘ └────────┘            │
└──────────────────────────────────────────────────┘
```

## 2. Component Responsibilities

### 2.1 ExternalAdapter (Facade)

Orchestrates the request pipeline:
1. Validate request against compliance rules
2. Check response cache for idempotent operations
3. Check rate limiter for vendor quota
4. Check circuit breaker state
5. If ONLINE: marshal → invoke vendor → unmarshal
6. If OFFLINE: enqueue to offline queue
7. Record telemetry via Instrumentation Probe
8. Cache response if cacheable

### 2.2 RequestRouter

Routes requests to correct vendor adapter based on serviceId. Supports primary/fallback chains, load balancing, and capability matching.

### 2.3 CircuitBreaker

Per-vendor circuit breaker (CLOSED → OPEN → HALF_OPEN).

| Parameter | Default |
|:---|:---|
| failureThreshold | 5 |
| successThreshold | 3 |
| timeout | 30000ms |
| halfOpenMaxCalls | 1 |

### 2.4 RetryEngine

Exponential backoff with jitter: `delay = min(base * (mult ^ attempt) + jitter, max)`

### 2.5 RateLimiter

Token bucket algorithm per vendor per tenant.

### 2.6 OfflineQueue

FIFO queue backed by IndexedDB (browser) or filesystem (Node.js). Max 1000 entries or 5MB.

### 2.7 ComplianceFilter

Masks PCI-sensitive fields, adds NDPR audit trail, validates TLS ≥ 1.2.

## 3. Concurrency Model

- All vendor calls async (Promise-based)
- No shared mutable state between concurrent requests
- Circuit breaker uses atomic compare-and-swap
- Rate limiter uses monotonic clock
- Offline queue uses transactional writes

## 4. Deployment Topology

| Environment | Offline Queue | Cache |
|:---|:---|:---|
| Browser (PWA) | IndexedDB | Memory + IndexedDB |
| Node.js (Server) | Filesystem | Memory (LRU) |
| Edge (Cloudflare) | KV Store | KV Store |

---

**Status:** COMPLETE
**Execution Date:** 2026-02-26
