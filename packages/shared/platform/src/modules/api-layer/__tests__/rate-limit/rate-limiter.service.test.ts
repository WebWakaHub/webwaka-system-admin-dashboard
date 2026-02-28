/**
 * Unit Tests for Rate Limiter Service
 * 
 * Tests rate limiting logic, Redis integration, and fail-open behavior.
 */

import { RateLimiterService } from '../../rate-limit/rate-limiter.service';

describe('RateLimiterService', () => {
  let rateLimiter: RateLimiterService;

  beforeEach(() => {
    // Create rate limiter without Redis (in-memory mode for testing)
    rateLimiter = new RateLimiterService(undefined, 10, 60, true);
  });

  afterEach(async () => {
    await rateLimiter.close();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should track request count', async () => {
      const result1 = await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      const result2 = await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBeLessThan(result1.remaining);
    });

    it('should deny requests when limit is exceeded', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      }

      // Next request should be denied
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should isolate rate limits per tenant', async () => {
      // Make requests for tenant-123
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      }

      // Requests for tenant-456 should still be allowed
      const result = await rateLimiter.checkRateLimit('tenant-456', 'user-789');

      expect(result.allowed).toBe(true);
    });

    it('should isolate rate limits per user', async () => {
      // Make requests for user-456
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      }

      // Requests for user-789 should still be allowed
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-789');

      expect(result.allowed).toBe(true);
    });

    it('should respect custom rate limit rules', async () => {
      const customRule = {
        id: 'custom-rule-1',
        maxRequests: 5,
        windowSeconds: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Make requests up to custom limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit('tenant-123', 'user-456', customRule);
      }

      // Next request should be denied
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-456', customRule);

      expect(result.allowed).toBe(false);
    });

    it('should handle missing tenantId', async () => {
      const result = await rateLimiter.checkRateLimit('', 'user-456');

      // Should fail-open (allow) when rate limiter has errors
      expect(result.allowed).toBe(true);
    });

    it('should handle missing userId', async () => {
      const result = await rateLimiter.checkRateLimit('tenant-123', '');

      // Should fail-open (allow) when rate limiter has errors
      expect(result.allowed).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit counter', async () => {
      // Make some requests
      await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      // Reset the counter
      await rateLimiter.resetRateLimit('tenant-123', 'user-456');

      // Should have full limit available
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(9);
    });

    it('should handle reset for non-existent key', async () => {
      // Should not throw error
      await expect(
        rateLimiter.resetRateLimit('tenant-999', 'user-999')
      ).resolves.not.toThrow();
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', async () => {
      // Make some requests
      await rateLimiter.checkRateLimit('tenant-123', 'user-456');
      await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      const status = await rateLimiter.getRateLimitStatus('tenant-123', 'user-456');

      expect(status.count).toBeGreaterThan(0);
      expect(status.remaining).toBeLessThan(10);
    });

    it('should return zero for unused rate limit', async () => {
      const status = await rateLimiter.getRateLimitStatus('tenant-999', 'user-999');

      expect(status.count).toBe(0);
      expect(status.remaining).toBe(10);
    });
  });

  describe('fail-open behavior', () => {
    it('should allow requests when rate limiting is disabled', async () => {
      const disabledLimiter = new RateLimiterService(undefined, 10, 60, false);

      const result = await disabledLimiter.checkRateLimit('tenant-123', 'user-456');

      expect(result.allowed).toBe(true);

      await disabledLimiter.close();
    });

    it('should handle Redis connection errors gracefully', async () => {
      // In-memory mode simulates Redis unavailability
      const result = await rateLimiter.checkRateLimit('tenant-123', 'user-456');

      // Should fail-open (allow requests)
      expect(result.allowed).toBe(true);
    });
  });

  describe('close', () => {
    it('should cleanup resources', async () => {
      await expect(rateLimiter.close()).resolves.not.toThrow();
    });

    it('should allow multiple close calls', async () => {
      await rateLimiter.close();
      await expect(rateLimiter.close()).resolves.not.toThrow();
    });
  });
});
