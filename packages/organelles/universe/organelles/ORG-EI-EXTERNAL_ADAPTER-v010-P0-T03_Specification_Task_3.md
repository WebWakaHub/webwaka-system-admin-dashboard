# [ORG-EI-EXTERNAL_ADAPTER-v0.1.0-P0-T03] Specification Task 3

**Structure:** `ORG-EI-EXTERNAL_ADAPTER-v0.1.0`
**Layer:** Organelle
**Issue:** #498
**Executing Agent:** webwakaagent4 (Engineering & Delivery)

---

## 1. Constitutional Invariants

| ID | Invariant | Enforcement |
|:---|:---|:---|
| INV-EI-P01 | All vendor calls go through `IExternalServicePort` | Compile-time port injection |
| INV-EI-P02 | Request timeout ≤ 30s | `ExternalAdapter.execute()` enforces max |
| INV-EI-P03 | Circuit breaker opens after 5 consecutive failures | `CircuitBreaker` state machine |
| INV-EI-P04 | Offline queue bounded at 1000 entries or 5MB | `IOfflineQueuePort` capacity check |
| INV-EI-P05 | Response cache TTL ≤ 3600s (1 hour) | `IResponseCachePort.set()` validates |
| INV-EI-P06 | Tenant isolation for all API credentials | `ITenantContextPort` per-request |
| INV-EI-P07 | Retry backoff max 3 attempts, max delay 10s | `RetryPolicy` validation |
| INV-EI-P08 | PCI-sensitive data never logged | `ComplianceFilter` on all logs |
| INV-EI-P09 | Rate limits enforced per-vendor per-tenant | `RateLimiter` token bucket |
| INV-EI-P10 | All external calls instrumented via Instrumentation Probe | `IInstrumentationPort` integration |

## 2. State Machine

### 2.1 Circuit Breaker States

```
CLOSED ──(failure threshold)──▶ OPEN
  ▲                                │
  │                          (timeout)
  │                                ▼
  └──(success threshold)──── HALF_OPEN
```

| State | Behavior | Transition |
|:---|:---|:---|
| `CLOSED` | All requests pass through | → `OPEN` after 5 consecutive failures |
| `OPEN` | All requests rejected immediately | → `HALF_OPEN` after 30s timeout |
| `HALF_OPEN` | Allow 1 probe request | → `CLOSED` on success, → `OPEN` on failure |

### 2.2 Adapter Lifecycle States

| State | Description | Transitions |
|:---|:---|:---|
| `UNREGISTERED` | Not in registry | → `INITIALIZING` via `register()` |
| `INITIALIZING` | Loading config, testing connectivity | → `READY` or `FAILED` |
| `READY` | Accepting requests | → `DEGRADED`, `DRAINING`, `SHUTDOWN` |
| `DEGRADED` | Offline or rate-limited | → `READY`, `SHUTDOWN` |
| `DRAINING` | Flushing offline queue | → `SHUTDOWN` |
| `SHUTDOWN` | Terminated | Terminal |
| `FAILED` | Initialization failed | → `INITIALIZING` via retry |

## 3. Performance Constraints

| Metric | Threshold | Action on Breach |
|:---|:---|:---|
| Request latency (P99) | ≤ 5s | Log warning, increment degraded counter |
| Request latency (P99.9) | ≤ 15s | Trigger circuit breaker evaluation |
| Error rate (5min window) | ≤ 10% | Normal operation |
| Error rate (5min window) | > 30% | Open circuit breaker |
| Queue drain rate | ≥ 10 req/s | Normal replay |
| Cache hit ratio | ≥ 60% | Healthy caching |

## 4. Security Constraints

| Constraint | Enforcement |
|:---|:---|
| API keys encrypted at rest | AES-256 via platform secret store |
| API keys never in logs | `ComplianceFilter` strips sensitive fields |
| OAuth tokens auto-rotated | Token refresh 5 min before expiry |
| PCI data (card numbers) masked | Regex masking in request/response logging |
| NDPR compliance | Audit trail for all external data transfers |
| TLS 1.2+ required | `VendorConfig.tlsMinVersion` enforced |

## 5. Offline Behavior (Nigeria First)

| Scenario | Behavior |
|:---|:---|
| Network unavailable | Queue request, return `QUEUED` status |
| Network restored | Drain queue in FIFO order with rate limiting |
| Queue full | Reject with `QueueFullError`, log warning |
| Cached response available | Return cached data with `fromCache: true` |
| Cached response expired | Queue refresh request, return stale with warning |
| Partial connectivity | Route to available vendors only |

## 6. Dependency on Instrumentation Probe

The External Adapter integrates with `ORG-IN-INSTRUMENTATION_PROBE-v0.1.0` for:

- Request/response latency metrics (`webwaka.organelle.external_adapter.latency`)
- Error rate metrics (`webwaka.organelle.external_adapter.errors`)
- Circuit breaker state changes (`webwaka.organelle.external_adapter.circuit_state`)
- Distributed trace propagation to vendor APIs
- Structured logging of all external interactions

---

**Status:** COMPLETE
**Execution Date:** 2026-02-26
