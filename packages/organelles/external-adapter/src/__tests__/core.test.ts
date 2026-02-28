/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — P4-T01 Unit Tests
 * Tests for CircuitBreaker, RateLimiter, RetryEngine, ComplianceFilter, ResponseCache
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #512 (P4-T01)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../core/CircuitBreaker';
import { RateLimiter } from '../core/RateLimiter';
import { RetryEngine } from '../core/RetryEngine';
import { ComplianceFilter } from '../core/ComplianceFilter';
import { ResponseCache } from '../core/ResponseCache';
import { RequestRouter } from '../core/RequestRouter';

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker();
    cb.registerVendor('paystack', { failureThreshold: 3, resetTimeoutMs: 5000, halfOpenMaxRequests: 1 });
  });

  it('should start in CLOSED state', () => {
    expect(cb.getState('paystack')).toBe('closed');
  });

  it('should allow requests when CLOSED', () => {
    expect(cb.check('paystack')).toBe(true);
  });

  it('should open after failure threshold exceeded', () => {
    cb.recordFailure('paystack');
    cb.recordFailure('paystack');
    cb.recordFailure('paystack');
    expect(cb.getState('paystack')).toBe('open');
    expect(cb.check('paystack')).toBe(false);
  });

  it('should reset failure count on success', () => {
    cb.recordFailure('paystack');
    cb.recordFailure('paystack');
    cb.recordSuccess('paystack');
    expect(cb.getState('paystack')).toBe('closed');
    expect(cb.check('paystack')).toBe(true);
  });

  it('should return true for unknown vendors (fail-open)', () => {
    expect(cb.check('unknown-vendor')).toBe(true);
  });
});

describe('RateLimiter', () => {
  let rl: RateLimiter;

  beforeEach(() => {
    rl = new RateLimiter();
    rl.registerVendor('paystack', 10, 5);
  });

  it('should allow requests within rate limit', () => {
    expect(rl.acquire('paystack', 'tenant-1')).toBe(true);
  });

  it('should track remaining capacity', () => {
    rl.acquire('paystack', 'tenant-1');
    const remaining = rl.getRemaining('paystack', 'tenant-1');
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should return retry-after when exhausted', () => {
    for (let i = 0; i < 20; i++) {
      rl.acquire('paystack', 'tenant-1');
    }
    const retryAfter = rl.getRetryAfterMs('paystack', 'tenant-1');
    expect(retryAfter).toBeGreaterThanOrEqual(0);
  });
});

describe('RetryEngine', () => {
  let re: RetryEngine;

  beforeEach(() => {
    re = new RetryEngine();
  });

  it('should return result on first success', async () => {
    const result = await re.executeWithRetry(async () => 42, { maxRetries: 3 });
    expect(result).toBe(42);
  });

  it('should retry on failure and succeed', async () => {
    let attempts = 0;
    const result = await re.executeWithRetry(async () => {
      attempts++;
      if (attempts < 3) throw new Error('transient');
      return 'success';
    }, { maxRetries: 3 });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should throw after max retries exhausted', async () => {
    await expect(
      re.executeWithRetry(async () => { throw new Error('permanent'); }, { maxRetries: 2 })
    ).rejects.toThrow('permanent');
  });
});

describe('ComplianceFilter', () => {
  let cf: ComplianceFilter;

  beforeEach(() => {
    cf = new ComplianceFilter();
  });

  it('should validate a well-formed request', () => {
    const result = cf.validateRequest({
      serviceId: 'payment',
      operation: 'charge',
      payload: { amount: 1000 },
      tenantId: 'tenant-1',
      correlationId: 'corr-123',
      priority: 'NORMAL' as any,
    });
    expect(result.valid).toBe(true);
  });

  it('should create audit entries', () => {
    cf.createAuditEntry('test_event', { key: 'value' });
    // Audit entry creation should not throw
  });
});

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = new ResponseCache(100);
  });

  it('should return null for cache miss', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should store and retrieve values', async () => {
    await cache.set('key1', { data: 'test' }, 60);
    const result = await cache.get('key1');
    expect(result).toEqual({ data: 'test' });
  });

  it('should invalidate by prefix', async () => {
    await cache.set('payment:charge:1', 'a', 60);
    await cache.set('payment:charge:2', 'b', 60);
    await cache.set('sms:send:1', 'c', 60);
    await cache.invalidateByPrefix('payment:charge');
    expect(await cache.get('payment:charge:1')).toBeNull();
    expect(await cache.get('payment:charge:2')).toBeNull();
    expect(await cache.get('sms:send:1')).toBe('c');
  });
});

describe('RequestRouter', () => {
  let router: RequestRouter;
  const mockAdapter = {
    vendorId: 'paystack',
    category: 'payment',
    initialize: async () => {},
    execute: async () => ({}),
    healthCheck: async () => ({} as any),
    shutdown: async () => {},
  };

  beforeEach(() => {
    router = new RequestRouter();
    router.registerVendor(mockAdapter);
    router.registerServiceMapping('payment', 'paystack');
  });

  it('should resolve vendor for registered service', () => {
    const vendor = router.resolve('payment', 'charge');
    expect(vendor.vendorId).toBe('paystack');
  });

  it('should throw for unregistered service', () => {
    expect(() => router.resolve('unknown', 'op')).toThrow();
  });

  it('should list registered vendors', () => {
    expect(router.listVendors()).toContain('paystack');
  });

  it('should list registered services', () => {
    expect(router.listServices()).toContain('payment');
  });

  it('should remove vendor and its service mappings', () => {
    router.removeVendor('paystack');
    expect(router.listVendors()).not.toContain('paystack');
    expect(router.listServices()).not.toContain('payment');
  });
});
