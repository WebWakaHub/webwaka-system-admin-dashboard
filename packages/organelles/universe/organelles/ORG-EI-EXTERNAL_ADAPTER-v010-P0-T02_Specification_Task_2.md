# [ORG-EI-EXTERNAL_ADAPTER-v0.1.0-P0-T02] Specification Task 2

**Structure:** `ORG-EI-EXTERNAL_ADAPTER-v0.1.0`
**Layer:** Organelle
**Issue:** #497
**Executing Agent:** webwakaagent4 (Engineering & Delivery)

---

## 1. Port Interface Definitions

### 1.1 Inbound Ports

#### `IExternalServicePort`

```typescript
interface IExternalServicePort {
  execute<TReq, TRes>(request: ExternalRequest<TReq>): Promise<ExternalResponse<TRes>>;
  executeWithFallback<TReq, TRes>(request: ExternalRequest<TReq>, fallback: TRes): Promise<ExternalResponse<TRes>>;
  isAvailable(serviceId: string): Promise<boolean>;
  getServiceHealth(serviceId: string): ServiceHealthStatus;
}
```

#### `IExternalServiceRegistryPort`

```typescript
interface IExternalServiceRegistryPort {
  register(serviceId: string, adapter: IVendorAdapter): void;
  unregister(serviceId: string): boolean;
  get(serviceId: string): IVendorAdapter | undefined;
  list(): ServiceRegistryEntry[];
  listByCategory(category: ServiceCategory): ServiceRegistryEntry[];
}
```

### 1.2 Outbound Ports

#### `IVendorAdapter`

```typescript
interface IVendorAdapter {
  readonly vendorId: string;
  readonly category: ServiceCategory;
  readonly version: string;
  initialize(config: VendorConfig): Promise<void>;
  execute<TReq, TRes>(request: VendorRequest<TReq>): Promise<VendorResponse<TRes>>;
  healthCheck(): Promise<VendorHealthStatus>;
  shutdown(): Promise<void>;
  getCapabilities(): VendorCapability[];
  getRateLimits(): RateLimitConfig;
}
```

#### `IOfflineQueuePort`

```typescript
interface IOfflineQueuePort {
  enqueue(entry: QueueEntry): Promise<string>;
  dequeue(count: number): Promise<QueueEntry[]>;
  peek(count: number): Promise<QueueEntry[]>;
  size(): Promise<number>;
  clear(): Promise<void>;
}
```

#### `IResponseCachePort`

```typescript
interface IResponseCachePort {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  invalidate(key: string): Promise<boolean>;
  invalidateByPattern(pattern: string): Promise<number>;
}
```

## 2. Data Model

### 2.1 Request/Response

| Field | Type | Description |
|:---|:---|:---|
| `serviceId` | `string` | Target vendor identifier |
| `operation` | `string` | Operation name |
| `payload` | `T` | Request payload |
| `tenantId` | `string` | Tenant for isolation |
| `correlationId` | `string` | Distributed trace correlation |
| `timeout` | `number` | Request timeout in ms |
| `retryPolicy` | `RetryPolicy` | Retry configuration |
| `priority` | `RequestPriority` | HIGH, NORMAL, LOW |

### 2.2 Error Taxonomy

| Error | Code | Retryable |
|:---|:---|:---|
| `VendorUnavailableError` | `VENDOR_UNAVAILABLE` | Yes |
| `VendorTimeoutError` | `VENDOR_TIMEOUT` | Yes |
| `VendorAuthError` | `VENDOR_AUTH` | No |
| `RateLimitExceededError` | `RATE_LIMIT` | Yes (after delay) |
| `CircuitOpenError` | `CIRCUIT_OPEN` | Yes (after timeout) |
| `QueueFullError` | `QUEUE_FULL` | No |
| `MarshallingError` | `MARSHALLING` | No |
| `ComplianceError` | `COMPLIANCE` | No |

---

**Status:** COMPLETE
**Execution Date:** 2026-02-26
