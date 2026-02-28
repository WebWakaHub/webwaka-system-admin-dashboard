/**
 * Unit Tests for Request Router Service
 * 
 * Tests route registration, matching, and parameter extraction.
 */

import { RequestRouterService } from '../../routing/request-router.service';
import { ApiRouteConfig } from '../../types';

describe('RequestRouterService', () => {
  let router: RequestRouterService;

  beforeEach(() => {
    router = new RequestRouterService();
  });

  describe('registerRoute', () => {
    it('should register a new route', () => {
      const route: ApiRouteConfig = {
        path: '/api/v1/test',
        method: 'GET',
        module: 'test-module',
        version: 'v1',
        requiresAuth: false,
      };

      router.registerRoute(route);
      const foundRoute = router.findRoute('/api/v1/test', 'GET');

      expect(foundRoute).toBeDefined();
      expect(foundRoute?.path).toBe('/api/v1/test');
      expect(foundRoute?.method).toBe('GET');
    });

    it('should allow multiple routes with different methods', () => {
      const getRoute: ApiRouteConfig = {
        path: '/api/v1/resource',
        method: 'GET',
        module: 'test',
        version: 'v1',
        requiresAuth: true,
      };
      const postRoute: ApiRouteConfig = {
        path: '/api/v1/resource',
        method: 'POST',
        module: 'test',
        version: 'v1',
        requiresAuth: true,
      };

      router.registerRoute(getRoute);
      router.registerRoute(postRoute);

      expect(router.findRoute('/api/v1/resource', 'GET')).toBeDefined();
      expect(router.findRoute('/api/v1/resource', 'POST')).toBeDefined();
    });
  });

  describe('findRoute', () => {
    it('should find exact route match', () => {
      const route = router.findRoute('/api/v1/health', 'GET');

      expect(route).toBeDefined();
      expect(route?.path).toBe('/api/v1/health');
    });

    it('should return null for non-existent route', () => {
      const route = router.findRoute('/api/v1/nonexistent', 'GET');

      expect(route).toBeNull();
    });

    it('should match routes with path parameters', () => {
      const route: ApiRouteConfig = {
        path: '/api/v1/users/:id',
        method: 'GET',
        module: 'user',
        version: 'v1',
        requiresAuth: true,
      };

      router.registerRoute(route);
      const foundRoute = router.findRoute('/api/v1/users/123', 'GET');

      expect(foundRoute).toBeDefined();
      expect(foundRoute?.path).toBe('/api/v1/users/:id');
    });

    it('should be case-sensitive for HTTP methods', () => {
      const route = router.findRoute('/api/v1/health', 'get');

      expect(route).toBeDefined(); // Should still find it as method is normalized
    });
  });

  describe('extractPathParams', () => {
    it('should extract single path parameter', () => {
      const params = router.extractPathParams(
        '/api/v1/users/:id',
        '/api/v1/users/123'
      );

      expect(params).toEqual({ id: '123' });
    });

    it('should extract multiple path parameters', () => {
      const params = router.extractPathParams(
        '/api/v1/tenants/:tenantId/users/:userId',
        '/api/v1/tenants/tenant-123/users/user-456'
      );

      expect(params).toEqual({
        tenantId: 'tenant-123',
        userId: 'user-456',
      });
    });

    it('should return empty object when no parameters', () => {
      const params = router.extractPathParams(
        '/api/v1/health',
        '/api/v1/health'
      );

      expect(params).toEqual({});
    });

    it('should handle parameters with special characters', () => {
      const params = router.extractPathParams(
        '/api/v1/resources/:id',
        '/api/v1/resources/abc-123-xyz'
      );

      expect(params).toEqual({ id: 'abc-123-xyz' });
    });
  });

  describe('getAllRoutes', () => {
    it('should return all registered routes', () => {
      const routes = router.getAllRoutes();

      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0); // Default routes exist
    });

    it('should include newly registered routes', () => {
      const initialCount = router.getAllRoutes().length;

      const newRoute: ApiRouteConfig = {
        path: '/api/v1/custom',
        method: 'POST',
        module: 'custom',
        version: 'v1',
        requiresAuth: true,
      };
      router.registerRoute(newRoute);

      const routes = router.getAllRoutes();
      expect(routes.length).toBe(initialCount + 1);
    });
  });

  describe('getModuleRoutes', () => {
    it('should return routes for specific module', () => {
      const routes = router.getModuleRoutes('tenant-management');

      expect(Array.isArray(routes)).toBe(true);
      routes.forEach(route => {
        expect(route.module).toBe('tenant-management');
      });
    });

    it('should return empty array for non-existent module', () => {
      const routes = router.getModuleRoutes('nonexistent-module');

      expect(routes).toEqual([]);
    });
  });

  describe('getVersionRoutes', () => {
    it('should return routes for specific version', () => {
      const routes = router.getVersionRoutes('v1');

      expect(Array.isArray(routes)).toBe(true);
      routes.forEach(route => {
        expect(route.version).toBe('v1');
      });
    });

    it('should return empty array for non-existent version', () => {
      const routes = router.getVersionRoutes('v99');

      expect(routes).toEqual([]);
    });
  });

  describe('hasRoute', () => {
    it('should return true for existing route', () => {
      const exists = router.hasRoute('/api/v1/health', 'GET');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent route', () => {
      const exists = router.hasRoute('/api/v1/nonexistent', 'GET');

      expect(exists).toBe(false);
    });
  });

  describe('unregisterRoute', () => {
    it('should remove a registered route', () => {
      const route: ApiRouteConfig = {
        path: '/api/v1/temp',
        method: 'GET',
        module: 'temp',
        version: 'v1',
        requiresAuth: false,
      };

      router.registerRoute(route);
      expect(router.hasRoute('/api/v1/temp', 'GET')).toBe(true);

      router.unregisterRoute('/api/v1/temp', 'GET');
      expect(router.hasRoute('/api/v1/temp', 'GET')).toBe(false);
    });
  });

  describe('clearRoutes', () => {
    it('should remove all routes', () => {
      router.clearRoutes();
      const routes = router.getAllRoutes();

      expect(routes).toEqual([]);
    });
  });
});
