# [ORG-EI-EXTERNAL_ADAPTER-v0.1.0-P1-T03] Design Task 3

**Structure:** `ORG-EI-EXTERNAL_ADAPTER-v0.1.0`
**Layer:** Organelle
**Issue:** #502
**Executing Agent:** webwakaagent3 (Architecture & System Design)

---

## 1. Data Flow Design

### 1.1 Request Pipeline

```
Cell.execute(request)
  │
  ├─▶ ComplianceFilter.validate(request)
  │     └─ Reject if PCI/NDPR violation
  ├─▶ ResponseCache.get(cacheKey)
  │     └─ Return cached if hit + valid TTL
  ├─▶ RateLimiter.acquire(vendorId, tenantId)
  │     └─ Reject with RateLimitExceededError if exhausted
  ├─▶ CircuitBreaker.check(vendorId)
  │     └─ Reject with CircuitOpenError if OPEN
  ├─▶ RequestMarshaller.marshal(request)
  ├─▶ VendorAdapter.execute(marshalledRequest)
  │     ├─ Success: ResponseUnmarshaller.unmarshal(response)
  │     └─ Failure: RetryEngine.retry() or CircuitBreaker.recordFailure()
  ├─▶ ResponseCache.set(cacheKey, response) if cacheable
  ├─▶ InstrumentationProbe.recordMetrics()
  └─▶ Return ExternalResponse<T>
```

### 1.2 Offline Flow

```
Cell.execute(request) [OFFLINE mode]
  │
  ├─▶ ResponseCache.get(cacheKey)
  │     └─ Return stale cached if available (with warning)
  ├─▶ OfflineQueue.enqueue(request)
  │     └─ Reject with QueueFullError if at capacity
  └─▶ Return ExternalResponse { success: false, queued: true }
```

### 1.3 Queue Drain Flow

```
Connectivity restored event
  │
  ├─▶ OfflineQueue.peek(batchSize)
  ├─▶ For each entry:
  │     ├─ Check idempotency key in cache (skip if already resolved)
  │     ├─ Execute through normal pipeline
  │     ├─ On success: dequeue + cache response
  │     └─ On failure: increment retryCount, re-enqueue or dead-letter
  └─▶ Rate-limited at 10 req/s to avoid overwhelming vendor
```

## 2. Testing Strategy

### 2.1 Unit Tests

| Component | Test Cases | Strategy |
|:---|:---|:---|
| CircuitBreaker | State transitions, threshold counting | In-memory, deterministic clock |
| RetryEngine | Backoff calculation, jitter bounds | Math verification |
| RateLimiter | Token bucket refill, burst handling | Deterministic clock |
| RequestMarshaller | Schema transformation | Snapshot testing |
| ComplianceFilter | PCI masking, NDPR logging | Pattern matching |
| ResponseCache | TTL expiry, invalidation | In-memory store |

### 2.2 Integration Tests

| Scenario | Setup | Verification |
|:---|:---|:---|
| Happy path | Mock vendor returns 200 | Response unmarshalled correctly |
| Vendor timeout | Mock vendor delays 31s | VendorTimeoutError thrown |
| Circuit opens | Mock vendor fails 5x | 6th call gets CircuitOpenError |
| Offline queue | Disconnect network | Request enqueued, drain on reconnect |
| Rate limit | Exhaust token bucket | RateLimitExceededError with retryAfter |
| Cache hit | Same request twice | Second call returns cached |

### 2.3 Performance Tests

| Metric | Target | Method |
|:---|:---|:---|
| Overhead latency | < 5ms per request | Benchmark without vendor call |
| Cache lookup | < 1ms | Benchmark 10K lookups |
| Queue enqueue | < 2ms | Benchmark 1K enqueues |
| Memory per adapter | < 2MB | Heap snapshot |
| Concurrent requests | 100 simultaneous | Load test |

## 3. Configuration Design

```typescript
interface ExternalAdapterConfig {
  defaultTimeout: number;          // 10000ms
  maxConcurrentRequests: number;   // 50
  offlineQueueMaxSize: number;     // 1000
  offlineQueueMaxBytes: number;    // 5242880 (5MB)
  queueDrainRate: number;          // 10 req/s
  cacheMaxEntries: number;         // 500
  cacheDefaultTtl: number;         // 300s
  enableComplianceLogging: boolean;// true
  enableTelemetry: boolean;        // true
  vendors: Record<string, VendorConfig>;
}
```

---

**Status:** COMPLETE
**Execution Date:** 2026-02-26
