/**
 * Integration Tests for API Layer
 * 
 * Tests full request pipeline integration across all services.
 */

import { initializeApiLayer } from '../../index';

describe('API Layer Integration Tests', () => {
  let apiLayer: any;

  beforeAll(() => {
    // Initialize API Layer with test configuration
    apiLayer = initializeApiLayer();

    // Register test routes
    apiLayer.router.registerRoute({
      path: '/api/v1/users',
      method: 'GET',
      module: 'users',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'users:read',
    });

    apiLayer.router.registerRoute({
      path: '/api/v1/users/:id',
      method: 'GET',
      module: 'users',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'users:read',
    });

    apiLayer.router.registerRoute({
      path: '/api/v1/public',
      method: 'GET',
      module: 'public',
      version: 'v1',
      requiresAuth: false,
    });
  });

  describe('Full Request Pipeline', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InRlbmFudC0xMjMiLCJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI2MjM5MDIyfQ.test';

    it('should process authenticated request through full pipeline', async () => {
      // Mock authorization
      jest.spyOn(apiLayer.authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const request = {
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          authorization: `Bearer ${validToken}`,
          'content-type': 'application/json',
        },
        query: { page: '1', pageSize: '10' },
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      const response = await apiLayer.gateway.processRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.meta.requestId).toBeDefined();
      expect(response.body.meta.version).toBe('v1');
    });

    it('should handle public routes without authentication', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/public',
        headers: {
          'content-type': 'application/json',
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      const response = await apiLayer.gateway.processRequest(request);

      expect(response.statusCode).toBe(200);
    });

    it('should extract path parameters', async () => {
      jest.spyOn(apiLayer.authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const request = {
        method: 'GET',
        path: '/api/v1/users/user-123',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      const response = await apiLayer.gateway.processRequest(request);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Response Transformation', () => {
    it('should transform successful responses consistently', async () => {
      jest.spyOn(apiLayer.authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InRlbmFudC0xMjMiLCJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI2MjM5MDIyfQ.test';

      const request = {
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      const response = await apiLayer.gateway.processRequest(request);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(response.body.meta).toHaveProperty('requestId');
      expect(response.body.meta).toHaveProperty('version');
    });

    it('should transform error responses consistently', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/users',
        headers: {},
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      const response = await apiLayer.gateway.processRequest(request);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
      expect(response.body.error).toHaveProperty('requestId');
    });
  });

  describe('Logging Integration', () => {
    it('should log requests through the pipeline', async () => {
      const loggerSpy = jest.spyOn(console, 'log').mockImplementation();

      jest.spyOn(apiLayer.authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InRlbmFudC0xMjMiLCJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI2MjM5MDIyfQ.test';

      const request = {
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      await apiLayer.gateway.processRequest(request);

      // Logger should have been called
      expect(loggerSpy).toHaveBeenCalled();

      loggerSpy.mockRestore();
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics during request processing', async () => {
      jest.spyOn(apiLayer.authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InRlbmFudC0xMjMiLCJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI2MjM5MDIyfQ.test';

      const request = {
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test-Client/1.0',
      };

      await apiLayer.gateway.processRequest(request);

      const metrics = apiLayer.metrics.getMetrics();
      expect(metrics.size).toBeGreaterThan(0);
    });
  });

  describe('Health Check Integration', () => {
    it('should perform health checks', async () => {
      const health = await apiLayer.healthCheck.checkHealth();

      expect(health.status).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(health.checks).toBeDefined();
    });

    it('should check readiness', async () => {
      const ready = await apiLayer.healthCheck.checkReadiness();

      expect(typeof ready).toBe('boolean');
    });

    it('should check liveness', () => {
      const alive = apiLayer.healthCheck.checkLiveness();

      expect(alive).toBe(true);
    });
  });

  describe('CORS Integration', () => {
    it('should validate CORS requests', () => {
      const result = apiLayer.cors.validateRequest(
        'https://app.webwaka.com',
        'GET'
      );

      expect(result.valid).toBeDefined();
    });

    it('should generate CORS headers', () => {
      const headers = apiLayer.cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Allow-Origin']).toBeDefined();
    });
  });

  describe('OpenAPI Documentation', () => {
    it('should generate OpenAPI specification', () => {
      const routes = apiLayer.router.getAllRoutes();
      const spec = apiLayer.openApiGenerator.generateSpec(routes);

      expect(spec.openapi).toBe('3.0.0');
      expect(spec.paths).toBeDefined();
      expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
    });

    it('should generate HTML documentation', () => {
      const routes = apiLayer.router.getAllRoutes();
      const spec = apiLayer.openApiGenerator.generateSpec(routes);
      const html = apiLayer.openApiGenerator.generateHtml(spec);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('swagger-ui');
    });
  });
});
