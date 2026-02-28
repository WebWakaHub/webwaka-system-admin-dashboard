# [ORG-EI-EXTERNAL_ADAPTER-v0.1.0-P1-T02] Design Task 2

**Structure:** `ORG-EI-EXTERNAL_ADAPTER-v0.1.0`
**Layer:** Organelle
**Issue:** #501
**Executing Agent:** webwakaagent3 (Architecture & System Design)

---

## 1. Interface Contract Design

### 1.1 IExternalServicePort Contract

Pre-conditions: serviceId registered, tenantId non-empty, timeout > 0 and <= 30000ms, correlationId valid UUID v4.

Post-conditions: Response always returned (never throws uncaught), success=true implies data defined, success=false implies error defined, latencyMs accurate, telemetry emitted.

### 1.2 IVendorAdapter Lifecycle Contract

1. `initialize(config)` MUST be called before `execute()`
2. `execute()` MUST NOT be called after `shutdown()`
3. `healthCheck()` may be called at any lifecycle stage
4. `shutdown()` is idempotent

Error mapping: Network → VendorUnavailableError, 401/403 → VendorAuthError, 429 → RateLimitExceededError, 5xx → VendorUnavailableError, Timeout → VendorTimeoutError.

### 1.3 Cache Contract

Key derivation: `hash(serviceId + operation + stableSerialize(payload) + tenantId)`

Eligibility: Only GET/READ operations, CachePolicy.enabled = true, TTL max 3600s.

Invalidation: On mutation, explicit invalidate(), TTL expiry.

## 2. Type System Design

### 2.1 Service Category Enum

`PAYMENT`, `MESSAGING`, `IDENTITY`, `GEOLOCATION`, `STORAGE`, `EMAIL`, `AI_INFERENCE`

### 2.2 Request Priority

`CRITICAL(0)`, `HIGH(1)`, `NORMAL(2)`, `LOW(3)`

### 2.3 Vendor Health Status

Fields: vendorId, status (healthy/degraded/unhealthy/unknown), latencyP50Ms, latencyP99Ms, errorRate, circuitState, lastChecked, rateLimitRemaining.

## 3. Event Contract

| Event | Trigger | Payload |
|:---|:---|:---|
| `external.request.started` | Before vendor call | serviceId, operation, tenantId |
| `external.request.completed` | After success | serviceId, latencyMs, cached |
| `external.request.failed` | After failure | serviceId, errorCode, retryCount |
| `external.circuit.opened` | CB opens | vendorId, failureCount |
| `external.circuit.closed` | CB closes | vendorId, successCount |
| `external.queue.enqueued` | Request queued | serviceId, queueSize |
| `external.queue.drained` | Queue emptied | drainedCount, failedCount |
| `external.ratelimit.hit` | Rate limit hit | vendorId, retryAfterMs |

---

**Status:** COMPLETE
**Execution Date:** 2026-02-26
