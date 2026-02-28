# ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Integration Guide

**Agent:** webwakaagent4 (Engineering & Delivery)
**Issue:** #517 (P5-T02 Documentation Task 2)

## Quick Start

### 1. Installation

```typescript
import { ExternalAdapter, PaystackAdapter, FlutterwaveAdapter } from '@webwaka/external-adapter';
```

### 2. Configuration

```typescript
const config = {
  defaultTimeout: 5000,
  maxConcurrentRequests: 10,
  offlineQueueMaxSize: 1000,
  queueDrainRate: 10,
  cacheMaxEntries: 100,
  vendors: {
    paystack: {
      baseUrl: 'https://api.paystack.co',
      apiKey: process.env.PAYSTACK_SECRET_KEY!,
      circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxRequests: 2 },
      rateLimitPerSecond: 50,
      burstSize: 10,
      maxRetries: 3,
    },
    flutterwave: {
      baseUrl: 'https://api.flutterwave.com',
      apiKey: process.env.FLUTTERWAVE_SECRET_KEY!,
      circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxRequests: 2 },
      rateLimitPerSecond: 30,
      burstSize: 5,
      maxRetries: 3,
    },
  },
};
```

### 3. Initialize and Register Vendors

```typescript
const adapter = new ExternalAdapter(config);

// Initialize vendor adapters
const paystack = new PaystackAdapter();
await paystack.initialize(config.vendors.paystack);
adapter.registerVendorAdapter(paystack);
adapter.registerServiceMapping('payment', 'paystack');

const flutterwave = new FlutterwaveAdapter();
await flutterwave.initialize(config.vendors.flutterwave);
adapter.registerVendorAdapter(flutterwave);
adapter.registerServiceMapping('transfer', 'flutterwave');
```

### 4. Execute Requests

```typescript
const result = await adapter.execute({
  serviceId: 'payment',
  operation: 'charge',
  payload: {
    amount: 50000, // 500 NGN in kobo
    currency: 'NGN',
    email: 'customer@example.com',
    reference: `TXN_${Date.now()}`,
  },
  tenantId: 'merchant-001',
  correlationId: `corr-${crypto.randomUUID()}`,
  priority: RequestPriority.NORMAL,
  cachePolicy: { enabled: false },
});

if (result.success) {
  console.log('Payment initiated:', result.data);
} else {
  console.error('Payment failed:', result.error);
}
```

## Nigeria-First Integration Patterns

### Paystack Payment Flow

```typescript
// Initiate charge
const charge = await adapter.execute({
  serviceId: 'payment',
  operation: 'transaction/initialize',
  payload: { amount: 100000, email: 'user@ng.com', currency: 'NGN' },
  tenantId: 'merchant-ng',
  correlationId: 'corr-ng-001',
  priority: RequestPriority.HIGH,
});

// Verify transaction
const verify = await adapter.execute({
  serviceId: 'payment',
  operation: 'transaction/verify/REF_123',
  payload: {},
  tenantId: 'merchant-ng',
  correlationId: 'corr-ng-002',
  priority: RequestPriority.NORMAL,
  cachePolicy: { enabled: true, ttlSeconds: 300 },
});
```

### Offline-First Pattern

For environments with unreliable connectivity (common in Nigerian mobile networks):

```typescript
// Monitor connectivity
window.addEventListener('online', () => adapter.setOnlineStatus(true));
window.addEventListener('offline', () => adapter.setOnlineStatus(false));

// Low-priority requests auto-queue when offline
const result = await adapter.execute({
  serviceId: 'analytics',
  operation: 'track',
  payload: { event: 'page_view' },
  tenantId: 'app-001',
  correlationId: 'corr-track-001',
  priority: RequestPriority.LOW, // Will queue instead of failing
});

// Manually drain queue
const { drained, failed } = await adapter.drainQueue();
```

## Creating Custom Vendor Adapters

```typescript
import { IVendorAdapter, VendorConfig, VendorHealthStatus } from '@webwaka/external-adapter';

export class CustomVendorAdapter implements IVendorAdapter {
  readonly vendorId = 'my-vendor';
  readonly category = 'custom';
  private config?: VendorConfig;

  async initialize(config: VendorConfig): Promise<void> {
    this.config = config;
  }

  async execute<T, R>(operation: string, payload: T, timeout: number): Promise<R> {
    // Implement vendor-specific logic
    const response = await fetch(`${this.config!.baseUrl}/${operation}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config!.apiKey}` },
      body: JSON.stringify(payload),
    });
    return response.json() as Promise<R>;
  }

  async healthCheck(): Promise<VendorHealthStatus> {
    // Implement health check
  }

  async shutdown(): Promise<void> {
    // Cleanup resources
  }
}
```

## Monitoring and Observability

### Health Checks

```typescript
const health = await adapter.getVendorHealth('paystack');
console.log(`Paystack: ${health.status}, circuit: ${health.circuitState}`);
```

### Queue Monitoring

```typescript
const queueSize = await adapter.getQueueSize();
if (queueSize > 50) {
  console.warn(`Offline queue growing: ${queueSize} items`);
}
```

## Cell-Level Integration

The External Adapter organelle is composed into cells via the standard organelle port interface:

```typescript
// In a Cell definition
import { ExternalAdapter } from '@webwaka/external-adapter';

class PaymentCell {
  private externalAdapter: ExternalAdapter;

  constructor(config: CellConfig) {
    this.externalAdapter = new ExternalAdapter(config.externalAdapter);
  }
}
```
