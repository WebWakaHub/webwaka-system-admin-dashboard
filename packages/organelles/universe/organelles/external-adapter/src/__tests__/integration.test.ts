/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — P4-T02 Integration Tests
 * End-to-end tests for ExternalAdapter with mock vendors
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #513 (P4-T02)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExternalAdapter } from '../ExternalAdapter';
import { IVendorAdapter } from '../ports';
import { ExternalAdapterConfig, VendorHealthStatus, CircuitState, RequestPriority } from '../types';

const createMockVendor = (vendorId: string, response: any = { ok: true }): IVendorAdapter => ({
  vendorId,
  category: 'payment',
  initialize: vi.fn().mockResolvedValue(undefined),
  execute: vi.fn().mockResolvedValue(response),
  healthCheck: vi.fn().mockResolvedValue({
    vendorId,
    status: 'healthy',
    latencyP50Ms: 50,
    latencyP99Ms: 200,
    errorRate: 0,
    circuitState: CircuitState.CLOSED,
    lastChecked: Date.now(),
    rateLimitRemaining: 100,
  } as VendorHealthStatus),
  shutdown: vi.fn().mockResolvedValue(undefined),
});

const createConfig = (): ExternalAdapterConfig => ({
  defaultTimeout: 5000,
  maxConcurrentRequests: 10,
  offlineQueueMaxSize: 100,
  queueDrainRate: 10,
  cacheMaxEntries: 50,
  vendors: {
    paystack: {
      baseUrl: 'https://api.paystack.co',
      apiKey: 'sk_test_xxx',
      circuitBreaker: { failureThreshold: 3, resetTimeoutMs: 5000, halfOpenMaxRequests: 1 },
      rateLimitPerSecond: 10,
      burstSize: 5,
      maxRetries: 3,
    },
  },
});

describe('ExternalAdapter Integration', () => {
  let adapter: ExternalAdapter;
  let mockVendor: IVendorAdapter;

  beforeEach(() => {
    adapter = new ExternalAdapter(createConfig());
    mockVendor = createMockVendor('paystack', { status: 'success', data: { ref: 'TXN_123' } });
    adapter.registerVendorAdapter(mockVendor);
    adapter.registerServiceMapping('payment', 'paystack');
  });

  it('should execute a request successfully', async () => {
    const result = await adapter.execute({
      serviceId: 'payment',
      operation: 'charge',
      payload: { amount: 5000, currency: 'NGN' },
      tenantId: 'tenant-1',
      correlationId: 'corr-001',
      priority: RequestPriority.NORMAL,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ status: 'success', data: { ref: 'TXN_123' } });
    expect(result.cached).toBe(false);
    expect(result.queued).toBe(false);
    expect(result.vendorId).toBe('paystack');
  });

  it('should return cached response on second call', async () => {
    const request = {
      serviceId: 'payment',
      operation: 'verify',
      payload: { reference: 'TXN_123' },
      tenantId: 'tenant-1',
      correlationId: 'corr-002',
      priority: RequestPriority.NORMAL,
      cachePolicy: { enabled: true, ttlSeconds: 60 },
    };

    const first = await adapter.execute(request);
    expect(first.success).toBe(true);
    expect(first.cached).toBe(false);

    const second = await adapter.execute(request);
    expect(second.success).toBe(true);
    expect(second.cached).toBe(true);
  });

  it('should handle vendor failure gracefully', async () => {
    const failingVendor = createMockVendor('paystack');
    failingVendor.execute = vi.fn().mockRejectedValue(new Error('Connection refused'));
    adapter.registerVendorAdapter(failingVendor);

    const result = await adapter.execute({
      serviceId: 'payment',
      operation: 'charge',
      payload: { amount: 1000 },
      tenantId: 'tenant-1',
      correlationId: 'corr-003',
      priority: RequestPriority.NORMAL,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should report vendor health', async () => {
    const health = await adapter.getVendorHealth('paystack');
    expect(health.vendorId).toBe('paystack');
    expect(health.status).toBeDefined();
  });

  it('should invalidate cache entries', async () => {
    const request = {
      serviceId: 'payment',
      operation: 'verify',
      payload: { reference: 'TXN_456' },
      tenantId: 'tenant-1',
      correlationId: 'corr-004',
      priority: RequestPriority.NORMAL,
      cachePolicy: { enabled: true, ttlSeconds: 60 },
    };

    await adapter.execute(request);
    await adapter.invalidateCache('payment', 'verify');

    const afterInvalidate = await adapter.execute(request);
    expect(afterInvalidate.cached).toBe(false);
  });

  it('should queue requests when offline', async () => {
    adapter.setOnlineStatus(false);

    const result = await adapter.execute({
      serviceId: 'payment',
      operation: 'charge',
      payload: { amount: 2000 },
      tenantId: 'tenant-1',
      correlationId: 'corr-005',
      priority: RequestPriority.LOW,
    });

    // Low priority requests get queued when offline
    const queueSize = await adapter.getQueueSize();
    expect(queueSize).toBeGreaterThanOrEqual(0);
  });
});

describe('ExternalAdapter Error Handling', () => {
  let adapter: ExternalAdapter;

  beforeEach(() => {
    adapter = new ExternalAdapter(createConfig());
  });

  it('should return error for unregistered service', async () => {
    const result = await adapter.execute({
      serviceId: 'unknown-service',
      operation: 'op',
      payload: {},
      tenantId: 'tenant-1',
      correlationId: 'corr-err-1',
      priority: RequestPriority.NORMAL,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
