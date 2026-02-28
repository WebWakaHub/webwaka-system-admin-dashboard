/**
 * Unit Tests for RequestRouter
 * Tests for request routing, load balancing, and fallback handling
 */

import RequestRouter from '../../components/RequestRouter';

describe('RequestRouter', () => {
  let router: RequestRouter;

  beforeEach(() => {
    router = new RequestRouter();
  });

  describe('addRoute', () => {
    it('should add a new route', () => {
      router.addRoute('custom-model', 'custom-provider', 1);

      const route = router.getRoute('custom-model');

      expect(route).toBeDefined();
      expect(route?.provider).toBe('custom-provider');
      expect(route?.priority).toBe(1);
    });

    it('should emit route:added event', (done) => {
      router.on('route:added', (data) => {
        expect(data.model).toBe('custom-model');
        expect(data.provider).toBe('custom-provider');
        done();
      });

      router.addRoute('custom-model', 'custom-provider', 1);
    });

    it('should support fallback routes', () => {
      router.addRoute('primary-model', 'primary-provider', 1, 'fallback-model');

      const route = router.getRoute('primary-model');

      expect(route?.fallback).toBe('fallback-model');
    });

    it('should support rate limiting', () => {
      router.addRoute('limited-model', 'limited-provider', 1, undefined, 100);

      const route = router.getRoute('limited-model');

      expect(route?.rateLimit).toBe(100);
    });

    it('should support timeout configuration', () => {
      router.addRoute('timeout-model', 'timeout-provider', 1, undefined, undefined, 30000);

      const route = router.getRoute('timeout-model');

      expect(route?.timeout).toBe(30000);
    });
  });

  describe('routeRequest', () => {
    it('should route a request to the appropriate provider', () => {
      const route = router.routeRequest('gpt-4');

      expect(route).toBeDefined();
      expect(route.provider).toBe('openai');
    });

    it('should throw error for unknown model with no default route', () => {
      const customRouter = new RequestRouter();
      customRouter.addRoute('known-model', 'known-provider', 1);

      expect(() => {
        customRouter.routeRequest('unknown-model');
      }).toThrow('No route found for model');
    });

    it('should emit request:routed event', (done) => {
      router.on('request:routed', (data) => {
        expect(data.model).toBe('gpt-4');
        expect(data.provider).toBe('openai');
        done();
      });

      router.routeRequest('gpt-4');
    });

    it('should respect rate limits', () => {
      const customRouter = new RequestRouter();
      customRouter.addRoute('limited-model', 'limited-provider', 1, 'fallback-model', 2);

      // First request should succeed
      const route1 = customRouter.routeRequest('limited-model');
      expect(route1.provider).toBe('limited-provider');

      // Second request should succeed
      const route2 = customRouter.routeRequest('limited-model');
      expect(route2.provider).toBe('limited-provider');

      // Third request should fail and use fallback
      const route3 = customRouter.routeRequest('limited-model');
      expect(route3.provider).toBe('openrouter'); // fallback default
    });

    it('should emit route:fallback event when rate limit exceeded', (done) => {
      const customRouter = new RequestRouter();
      customRouter.addRoute('limited-model', 'limited-provider', 1, 'fallback-model', 1);

      customRouter.on('route:fallback', (data) => {
        expect(data.model).toBe('limited-model');
        done();
      });

      customRouter.routeRequest('limited-model');
      customRouter.routeRequest('limited-model');
    });
  });

  describe('getRoute', () => {
    it('should retrieve a route', () => {
      const route = router.getRoute('gpt-4');

      expect(route).toBeDefined();
      expect(route?.model).toBe('gpt-4');
    });

    it('should return undefined for non-existent route', () => {
      const route = router.getRoute('non-existent-model');

      expect(route).toBeUndefined();
    });
  });

  describe('listRoutes', () => {
    it('should list all routes', () => {
      const routes = router.listRoutes();

      expect(routes.length).toBeGreaterThan(0);
      expect(routes.some((r) => r.model === 'gpt-4')).toBe(true);
    });
  });

  describe('setProviderWeight', () => {
    it('should set provider weight', () => {
      router.setProviderWeight('openai', 2);

      const weight = router.getProviderWeight('openai');

      expect(weight).toBe(2);
    });

    it('should emit weight:updated event', (done) => {
      router.on('weight:updated', (data) => {
        expect(data.provider).toBe('openai');
        expect(data.weight).toBe(2);
        done();
      });

      router.setProviderWeight('openai', 2);
    });
  });

  describe('getProviderWeight', () => {
    it('should return default weight if not set', () => {
      const weight = router.getProviderWeight('unknown-provider');

      expect(weight).toBe(1);
    });

    it('should return custom weight if set', () => {
      router.setProviderWeight('openai', 3);

      const weight = router.getProviderWeight('openai');

      expect(weight).toBe(3);
    });
  });

  describe('resetRequestCounts', () => {
    it('should reset request counts', () => {
      router.routeRequest('gpt-4');
      router.routeRequest('gpt-4');

      router.resetRequestCounts();

      const counts = router.getRequestCounts();

      expect(counts['openai']).toBeUndefined();
    });

    it('should emit counts:reset event', (done) => {
      router.on('counts:reset', () => {
        done();
      });

      router.resetRequestCounts();
    });
  });

  describe('getRequestCounts', () => {
    it('should return request counts per provider', () => {
      router.routeRequest('gpt-4');
      router.routeRequest('gpt-4');
      router.routeRequest('claude-3');

      const counts = router.getRequestCounts();

      expect(counts['openai']).toBe(2);
      expect(counts['anthropic']).toBe(1);
    });

    it('should return empty object when no requests made', () => {
      const counts = router.getRequestCounts();

      expect(Object.keys(counts).length).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', () => {
      router.routeRequest('gpt-4');
      router.routeRequest('claude-3');

      const stats = router.getStatistics();

      expect(stats.totalRoutes).toBeGreaterThan(0);
      expect(stats.totalProviders).toBeGreaterThan(0);
      expect(stats.totalRequests).toBe(2);
    });

    it('should track total requests', () => {
      router.routeRequest('gpt-4');
      router.routeRequest('gpt-4');
      router.routeRequest('gpt-4');

      const stats = router.getStatistics();

      expect(stats.totalRequests).toBe(3);
    });
  });
});
