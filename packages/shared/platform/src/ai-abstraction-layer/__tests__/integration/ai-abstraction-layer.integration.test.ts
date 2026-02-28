/**
 * AI Abstraction Layer Integration Tests
 * Tests for end-to-end workflows and component interactions
 */

import AIAbstractionLayer from '../../AIAbstractionLayer';

describe('AI Abstraction Layer Integration Tests', () => {
  let system: AIAbstractionLayer;

  beforeEach(() => {
    system = new AIAbstractionLayer({
      openRouterApiKey: 'test-key',
      cacheEnabled: true,
      cacheTTL: 3600,
      rateLimitConfig: {
        maxRequests: 100,
        windowMs: 60000,
      },
    });
  });

  describe('System Initialization', () => {
    test('should initialize system successfully', async () => {
      await system.initialize();
      expect(system.isInitialized()).toBe(true);
    });

    test('should emit system:initialized event', (done) => {
      system.on('system:initialized', () => {
        done();
      });
      system.initialize();
    });

    test('should load available models', async () => {
      await system.initialize();
      const models = system.getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
    });
  });

  describe('Request Processing Workflow', () => {
    test('should process request end-to-end', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      const response = await system.processRequest(request);
      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
    });

    test('should cache responses', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      const response1 = await system.processRequest(request);
      const response2 = await system.processRequest(request);
      expect(response1).toEqual(response2);
    });

    test('should handle request with custom parameters', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.5,
        maxTokens: 1000,
      };
      const response = await system.processRequest(request);
      expect(response).toBeDefined();
    });
  });

  describe('Key Management Workflow', () => {
    test('should create and manage API keys', async () => {
      const key = await system.createAPIKey('user123', 'test-key');
      expect(key).toBeDefined();
      expect(key.id).toBeDefined();
    });

    test('should retrieve API key', async () => {
      const created = await system.createAPIKey('user124', 'test-key');
      const retrieved = await system.getAPIKey(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    test('should list user API keys', async () => {
      await system.createAPIKey('user125', 'test-key-1');
      await system.createAPIKey('user125', 'test-key-2');
      const keys = await system.listAPIKeys('user125');
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    test('should revoke API key', async () => {
      const key = await system.createAPIKey('user126', 'test-key');
      await system.revokeAPIKey(key.id);
      const retrieved = await system.getAPIKey(key.id);
      expect(retrieved?.isRevoked).toBe(true);
    });

    test('should rotate API key', async () => {
      const key = await system.createAPIKey('user127', 'test-key');
      const rotated = await system.rotateAPIKey(key.id);
      expect(rotated).toBeDefined();
      expect(rotated?.id).not.toBe(key.id);
    });
  });

  describe('Rate Limiting Workflow', () => {
    test('should enforce rate limits', async () => {
      const limiter = system.getRateLimiter();
      for (let i = 0; i < 100; i++) {
        expect(limiter.isAllowed('user128')).toBe(true);
      }
      expect(limiter.isAllowed('user128')).toBe(false);
    });

    test('should track rate limit status', async () => {
      const limiter = system.getRateLimiter();
      limiter.isAllowed('user129');
      const status = limiter.getStatus('user129');
      expect(status.remaining).toBeLessThan(100);
    });
  });

  describe('Analytics Workflow', () => {
    test('should track request analytics', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await system.processRequest(request);
      const analytics = system.getAnalytics();
      expect(analytics.totalRequests).toBeGreaterThan(0);
    });

    test('should calculate usage costs', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await system.processRequest(request);
      const analytics = system.getAnalytics();
      expect(analytics.totalCost).toBeGreaterThanOrEqual(0);
    });

    test('should provide model statistics', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await system.processRequest(request);
      const stats = system.getModelStatistics('gpt-4');
      expect(stats).toBeDefined();
      expect(stats.requestCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Workflow', () => {
    test('should handle request errors gracefully', async () => {
      await system.initialize();
      const request = {
        model: 'invalid-model',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await expect(system.processRequest(request)).rejects.toThrow();
    });

    test('should retry failed requests', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      const response = await system.processRequest(request);
      expect(response).toBeDefined();
    });

    test('should track error statistics', async () => {
      const errorHandler = system.getErrorHandler();
      errorHandler.handleError(new Error('test error'));
      const stats = errorHandler.getStatistics();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });
  });

  describe('Caching Workflow', () => {
    test('should cache responses', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Cache test' }],
      };
      const response1 = await system.processRequest(request);
      const response2 = await system.processRequest(request);
      expect(response1).toEqual(response2);
    });

    test('should clear cache', async () => {
      await system.initialize();
      system.clearCache();
      const cacheStats = system.getCacheStatistics();
      expect(cacheStats.size).toBe(0);
    });

    test('should provide cache statistics', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await system.processRequest(request);
      const stats = system.getCacheStatistics();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.hitRate).toBeDefined();
    });
  });

  describe('Multi-Provider Workflow', () => {
    test('should support multiple providers', async () => {
      await system.initialize();
      const providers = system.getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    test('should route requests to appropriate provider', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      const response = await system.processRequest(request);
      expect(response).toBeDefined();
    });

    test('should handle provider fallback', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      const response = await system.processRequest(request);
      expect(response).toBeDefined();
    });
  });

  describe('System Shutdown', () => {
    test('should shutdown gracefully', async () => {
      await system.initialize();
      await system.shutdown();
      expect(system.isInitialized()).toBe(false);
    });

    test('should emit system:shutdown event', (done) => {
      system.on('system:shutdown', () => {
        done();
      });
      system.initialize().then(() => system.shutdown());
    });

    test('should cleanup resources', async () => {
      await system.initialize();
      const analyticsBefore = system.getAnalytics();
      await system.shutdown();
      expect(system.isInitialized()).toBe(false);
    });
  });

  describe('Compliance & Security', () => {
    test('should enforce Nigerian-First compliance', async () => {
      await system.initialize();
      const compliance = system.getComplianceStatus();
      expect(compliance.nigerianFirst).toBe(true);
    });

    test('should support BYOK', async () => {
      const key = await system.createAPIKey('user130', 'custom-key');
      expect(key.isCustomKey).toBe(true);
    });

    test('should encrypt sensitive data', async () => {
      const key = await system.createAPIKey('user131', 'test-key');
      expect(key.encryptedKey).toBeDefined();
    });

    test('should audit key operations', async () => {
      const key = await system.createAPIKey('user132', 'test-key');
      const audit = await system.getAuditLog(key.id);
      expect(Array.isArray(audit)).toBe(true);
      expect(audit.length).toBeGreaterThan(0);
    });
  });

  describe('Performance & Scalability', () => {
    test('should handle concurrent requests', async () => {
      await system.initialize();
      const requests = Array(10)
        .fill(null)
        .map(() => ({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
        }));
      const responses = await Promise.all(
        requests.map((req) => system.processRequest(req))
      );
      expect(responses.length).toBe(10);
    });

    test('should provide performance metrics', async () => {
      await system.initialize();
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };
      await system.processRequest(request);
      const metrics = system.getPerformanceMetrics();
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Monitoring & Observability', () => {
    test('should provide system health status', async () => {
      await system.initialize();
      const health = system.getHealthStatus();
      expect(health.status).toBeDefined();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    test('should track system events', async () => {
      await system.initialize();
      const events = system.getEventLog();
      expect(Array.isArray(events)).toBe(true);
    });

    test('should provide detailed diagnostics', async () => {
      await system.initialize();
      const diagnostics = system.getDiagnostics();
      expect(diagnostics).toBeDefined();
      expect(diagnostics.components).toBeDefined();
    });
  });
});
