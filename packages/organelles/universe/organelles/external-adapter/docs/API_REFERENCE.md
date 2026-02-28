# ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — API Reference

**Agent:** webwakaagent4 (Engineering & Delivery)
**Issue:** #516 (P5-T01 Documentation Task 1)

## Overview

The External Adapter organelle provides a unified interface for all external service integrations. It manages vendor lifecycle, request routing, circuit breaking, rate limiting, caching, compliance filtering, and offline queuing.

## Core Class: `ExternalAdapter`

### Constructor

```typescript
new ExternalAdapter(config: ExternalAdapterConfig, instrumentation?: IInstrumentationPort)
```

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `config` | `ExternalAdapterConfig` | Yes | Adapter configuration including vendor configs, timeouts, queue limits |
| `instrumentation` | `IInstrumentationPort` | No | Optional instrumentation port for metrics and tracing |

### Methods

#### `registerVendorAdapter(adapter: IVendorAdapter): void`

Registers a vendor adapter instance for request routing.

| Parameter | Type | Description |
|:---|:---|:---|
| `adapter` | `IVendorAdapter` | Vendor adapter implementing the standard interface |

#### `registerServiceMapping(serviceId: string, vendorId: string): void`

Maps a logical service identifier to a registered vendor.

| Parameter | Type | Description |
|:---|:---|:---|
| `serviceId` | `string` | Logical service name (e.g., `"payment"`, `"sms"`) |
| `vendorId` | `string` | Registered vendor identifier (e.g., `"paystack"`) |

#### `execute<T, R>(request: ExternalRequest<T>): Promise<ExternalResponse<R>>`

Executes an external service request through the full pipeline: compliance → cache → routing → circuit breaker → rate limiter → retry → vendor.

**Request Fields:**

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `serviceId` | `string` | Yes | Logical service to invoke |
| `operation` | `string` | Yes | Operation name (e.g., `"charge"`, `"verify"`) |
| `payload` | `T` | Yes | Request payload |
| `tenantId` | `string` | Yes | Tenant identifier for isolation |
| `correlationId` | `string` | Yes | Request correlation ID for tracing |
| `priority` | `RequestPriority` | Yes | `HIGH`, `NORMAL`, or `LOW` |
| `timeout` | `number` | No | Request timeout in ms (overrides default) |
| `cachePolicy` | `CachePolicy` | No | Cache configuration for this request |

**Response Fields:**

| Field | Type | Description |
|:---|:---|:---|
| `success` | `boolean` | Whether the request succeeded |
| `data` | `R` | Response data (present on success) |
| `error` | `ErrorInfo` | Error details (present on failure) |
| `latencyMs` | `number` | Total request latency |
| `cached` | `boolean` | Whether response was served from cache |
| `queued` | `boolean` | Whether request was queued for later |
| `vendorId` | `string` | Vendor that handled the request |
| `correlationId` | `string` | Request correlation ID |
| `timestamp` | `number` | Response timestamp |

#### `getVendorHealth(vendorId: string): Promise<VendorHealthStatus>`

Returns health status for a specific vendor including circuit state, latency percentiles, and rate limit remaining.

#### `invalidateCache(serviceId: string, operation: string): Promise<void>`

Invalidates all cached responses for a service/operation combination.

#### `getQueueSize(): Promise<number>`

Returns the current number of queued offline requests.

#### `drainQueue(): Promise<{ drained: number; failed: number }>`

Attempts to process queued requests. Returns count of successfully drained and failed entries.

#### `setOnlineStatus(online: boolean): void`

Sets the adapter's online/offline status. When transitioning to online, automatically triggers queue drain.

## Port Interfaces

### `IExternalServicePort`

Primary port for external service execution. Implemented by `ExternalAdapter`.

### `IVendorAdapter`

Interface for vendor-specific adapters.

```typescript
interface IVendorAdapter {
  readonly vendorId: string;
  readonly category: string;
  initialize(config: VendorConfig): Promise<void>;
  execute<T, R>(operation: string, payload: T, timeout: number): Promise<R>;
  healthCheck(): Promise<VendorHealthStatus>;
  shutdown(): Promise<void>;
}
```

### `IInstrumentationPort`

Optional instrumentation integration.

```typescript
interface IInstrumentationPort {
  startSpan(name: string, correlationId: string): { end(): void };
  recordMetric(name: string, value: number, tags: Record<string, string>): void;
}
```

## Configuration

### `ExternalAdapterConfig`

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `defaultTimeout` | `number` | 5000 | Default request timeout in ms |
| `maxConcurrentRequests` | `number` | 10 | Maximum concurrent vendor requests |
| `offlineQueueMaxSize` | `number` | 1000 | Maximum queued requests |
| `queueDrainRate` | `number` | 10 | Requests per drain cycle |
| `cacheMaxEntries` | `number` | 100 | Maximum cache entries |
| `vendors` | `Record<string, VendorConfig>` | — | Per-vendor configuration |

### `VendorConfig`

| Field | Type | Description |
|:---|:---|:---|
| `baseUrl` | `string` | Vendor API base URL |
| `apiKey` | `string` | Authentication key |
| `circuitBreaker` | `CircuitBreakerConfig` | Circuit breaker thresholds |
| `rateLimitPerSecond` | `number` | Requests per second limit |
| `burstSize` | `number` | Burst capacity above rate limit |
| `maxRetries` | `number` | Maximum retry attempts |

## Error Types

| Error | Code | Retryable | Description |
|:---|:---|:---|:---|
| `CircuitOpenError` | `CIRCUIT_OPEN` | No | Vendor circuit breaker is open |
| `RateLimitExceededError` | `RATE_LIMIT_EXCEEDED` | Yes | Vendor rate limit exhausted |
| `VendorTimeoutError` | `VENDOR_TIMEOUT` | Yes | Request exceeded timeout |
| `VendorUnavailableError` | `VENDOR_UNAVAILABLE` | Yes | Vendor returned error |
| `VendorAuthError` | `VENDOR_AUTH_ERROR` | No | Authentication failure |
| `ComplianceViolationError` | `COMPLIANCE_VIOLATION` | No | Request failed compliance check |
| `QueueFullError` | `QUEUE_FULL` | No | Offline queue at capacity |
| `ServiceNotFoundError` | `SERVICE_NOT_FOUND` | No | No vendor mapped to service |
