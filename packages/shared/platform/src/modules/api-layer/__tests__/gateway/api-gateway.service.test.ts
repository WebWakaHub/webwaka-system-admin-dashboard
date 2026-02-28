/**
 * Unit Tests for API Gateway Service
 * 
 * Tests full request pipeline orchestration.
 */

import { ApiGatewayService } from '../../gateway/api-gateway.service';
import { AuthenticationService } from '../../auth/authentication.service';
import { AuthorizationService } from '../../auth/authorization.service';
import { RateLimiterService } from '../../rate-limit/rate-limiter.service';
import { RequestValidatorService } from '../../validation/request-validator.service';
import { RequestRouterService } from '../../routing/request-router.service';

describe('ApiGatewayService', () => {
  let gateway: ApiGatewayService;
  let authService: AuthenticationService;
  let authzService: AuthorizationService;
  let rateLimiter: RateLimiterService;
  let validator: RequestValidatorService;
  let router: RequestRouterService;

  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InRlbmFudC0xMjMiLCJ1c2VySWQiOiJ1c2VyLTQ1NiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI2MjM5MDIyfQ.test';

  beforeEach(() => {
    authService = new AuthenticationService('test-secret');
    authzService = new AuthorizationService();
    rateLimiter = new RateLimiterService(undefined, 100, 60, true);
    validator = new RequestValidatorService();
    router = new RequestRouterService();

    // Register test route
    router.registerRoute({
      path: '/api/v1/test',
      method: 'GET',
      module: 'test',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'test:read',
    });

    gateway = new ApiGatewayService(
      authService,
      authzService,
      rateLimiter,
      validator,
      router
    );
  });

  describe('processRequest', () => {
    it('should process valid authenticated request', async () => {
      // Mock authorization to return allowed
      jest.spyOn(authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
        reason: 'Permission granted',
      });

      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should reject request without authentication', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {},
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject request with invalid token', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(401);
    });

    it('should reject request without required permission', async () => {
      jest.spyOn(authzService, 'checkPermission').mockResolvedValue({
        allowed: false,
        reason: 'Insufficient permissions',
      });

      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(403);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should handle route not found', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/nonexistent',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle internal errors', async () => {
      jest.spyOn(authService, 'authenticate').mockRejectedValue(
        new Error('Internal error')
      );

      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      const response = await gateway.processRequest(request);

      expect(response.statusCode).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('getStatistics', () => {
    it('should return gateway statistics', async () => {
      jest.spyOn(authzService, 'checkPermission').mockResolvedValue({
        allowed: true,
      });

      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      await gateway.processRequest(request);

      const stats = gateway.getStatistics();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(1);
      expect(stats.failedRequests).toBe(0);
    });

    it('should track failed requests', async () => {
      const request = {
        method: 'GET',
        path: '/api/v1/test',
        headers: {},
        query: {},
        body: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test/1.0',
      };

      await gateway.processRequest(request);

      const stats = gateway.getStatistics();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successfulRequests).toBe(0);
      expect(stats.failedRequests).toBe(1);
    });
  });

  describe('close', () => {
    it('should cleanup resources', async () => {
      await gateway.close();
      // No error should be thrown
      expect(true).toBe(true);
    });
  });
});
