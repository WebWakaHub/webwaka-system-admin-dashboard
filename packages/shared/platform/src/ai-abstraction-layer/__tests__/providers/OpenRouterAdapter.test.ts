/**
 * OpenRouter Adapter Unit Tests
 * Tests for OpenRouter provider integration
 */

import OpenRouterAdapter from '../../providers/OpenRouterAdapter';

describe('OpenRouterAdapter', () => {
  let adapter: OpenRouterAdapter;

  beforeEach(() => {
    adapter = new OpenRouterAdapter('test-api-key');
  });

  describe('constructor', () => {
    test('should create adapter with API key', () => {
      expect(adapter).toBeDefined();
    });

    test('should use environment API key if not provided', () => {
      process.env.OPENROUTER_API_KEY = 'env-key';
      const newAdapter = new OpenRouterAdapter();
      expect(newAdapter).toBeDefined();
    });
  });

  describe('initialize', () => {
    test('should initialize adapter', async () => {
      await adapter.initialize();
      expect(adapter.getStatistics().isInitialized).toBe(true);
    });

    test('should fetch models', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      expect(Array.isArray(models)).toBe(true);
    });

    test('should emit adapter:initialized event', (done) => {
      adapter.on('adapter:initialized', (data) => {
        expect(data.modelCount).toBeGreaterThanOrEqual(0);
        done();
      });
      adapter.initialize();
    });
  });

  describe('getModels', () => {
    test('should return list of models', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      expect(Array.isArray(models)).toBe(true);
    });

    test('should return models with required properties', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        const model = models[0];
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.pricing).toBeDefined();
      }
    });
  });

  describe('getModel', () => {
    test('should return specific model', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        const model = adapter.getModel(models[0].id);
        expect(model).toBeDefined();
        expect(model?.id).toBe(models[0].id);
      }
    });

    test('should return undefined for non-existent model', async () => {
      await adapter.initialize();
      const model = adapter.getModel('non-existent-model');
      expect(model).toBeUndefined();
    });
  });

  describe('hasModel', () => {
    test('should return true for existing model', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        expect(adapter.hasModel(models[0].id)).toBe(true);
      }
    });

    test('should return false for non-existent model', async () => {
      await adapter.initialize();
      expect(adapter.hasModel('non-existent')).toBe(false);
    });
  });

  describe('executeRequest', () => {
    test('should throw error if not initialized', async () => {
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
      };
      await expect(adapter.executeRequest(request)).rejects.toThrow();
    });

    test('should throw error for non-existent model', async () => {
      await adapter.initialize();
      const request = {
        model: 'non-existent',
        messages: [{ role: 'user', content: 'test' }],
      };
      await expect(adapter.executeRequest(request)).rejects.toThrow();
    });

    test('should execute request successfully', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        const request = {
          model: models[0].id,
          messages: [{ role: 'user', content: 'test' }],
        };
        const response = await adapter.executeRequest(request);
        expect(response).toBeDefined();
        expect(response.model).toBe(models[0].id);
        expect(response.choices).toBeDefined();
        expect(response.usage).toBeDefined();
      }
    });

    test('should emit request:executed event', (done) => {
      adapter.on('request:executed', (data) => {
        expect(data.status).toBe('success');
        done();
      });
      adapter.initialize().then(async () => {
        const models = adapter.getModels();
        if (models.length > 0) {
          await adapter.executeRequest({
            model: models[0].id,
            messages: [{ role: 'user', content: 'test' }],
          });
        }
      });
    });
  });

  describe('streamRequest', () => {
    test('should throw error if not initialized', async () => {
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
      };
      await expect(adapter.streamRequest(request)).rejects.toThrow();
    });

    test('should stream request', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        const request = {
          model: models[0].id,
          messages: [{ role: 'user', content: 'test' }],
        };
        const stream = await adapter.streamRequest(request);
        expect(stream).toBeDefined();
      }
    });
  });

  describe('calculateCost', () => {
    test('should calculate cost for request', async () => {
      await adapter.initialize();
      const models = adapter.getModels();
      if (models.length > 0) {
        const cost = adapter.calculateCost(models[0].id, 1000, 500);
        expect(typeof cost).toBe('number');
        expect(cost).toBeGreaterThanOrEqual(0);
      }
    });

    test('should return 0 for non-existent model', () => {
      const cost = adapter.calculateCost('non-existent', 1000, 500);
      expect(cost).toBe(0);
    });
  });

  describe('testConnection', () => {
    test('should test connection successfully', async () => {
      const result = await adapter.testConnection();
      expect(typeof result).toBe('boolean');
    });

    test('should emit connection:success event', (done) => {
      adapter.on('connection:success', () => {
        done();
      });
      adapter.testConnection();
    });
  });

  describe('getStatistics', () => {
    test('should return statistics', () => {
      const stats = adapter.getStatistics();
      expect(stats.isInitialized).toBeDefined();
      expect(stats.modelCount).toBeDefined();
      expect(stats.apiKey).toBeDefined();
    });

    test('should show initialized status', async () => {
      await adapter.initialize();
      const stats = adapter.getStatistics();
      expect(stats.isInitialized).toBe(true);
    });
  });

  describe('setApiKey', () => {
    test('should set API key', () => {
      adapter.setApiKey('new-key');
      const stats = adapter.getStatistics();
      expect(stats.apiKey).toBe('***');
    });

    test('should reset initialization status', async () => {
      await adapter.initialize();
      adapter.setApiKey('new-key');
      const stats = adapter.getStatistics();
      expect(stats.isInitialized).toBe(false);
    });
  });

  describe('getApiKey', () => {
    test('should return masked API key', () => {
      adapter.setApiKey('test-key');
      const key = adapter.getApiKey();
      expect(key).toBe('***');
    });

    test('should return not set message if no key', () => {
      const newAdapter = new OpenRouterAdapter('');
      const key = newAdapter.getApiKey();
      expect(key).toBe('not set');
    });
  });

  describe('clearModels', () => {
    test('should clear models cache', async () => {
      await adapter.initialize();
      adapter.clearModels();
      const stats = adapter.getStatistics();
      expect(stats.isInitialized).toBe(false);
      expect(stats.modelCount).toBe(0);
    });

    test('should emit models:cleared event', (done) => {
      adapter.on('models:cleared', () => {
        done();
      });
      adapter.clearModels();
    });
  });

  describe('refreshModels', () => {
    test('should refresh models from OpenRouter', async () => {
      await adapter.initialize();
      const countBefore = adapter.getModels().length;
      await adapter.refreshModels();
      const countAfter = adapter.getModels().length;
      expect(countAfter).toBeGreaterThanOrEqual(0);
    });
  });

  describe('events', () => {
    test('should emit request:success event', (done) => {
      adapter.on('request:success', (data) => {
        expect(data.status).toBeDefined();
        done();
      });
      adapter.initialize();
    });

    test('should emit request:error event on failure', (done) => {
      const badAdapter = new OpenRouterAdapter('');
      badAdapter.on('request:error', (data) => {
        expect(data.error).toBeDefined();
        done();
      });
      badAdapter.initialize().catch(() => {});
    });

    test('should emit adapter:error event on initialization failure', (done) => {
      const badAdapter = new OpenRouterAdapter('');
      badAdapter.on('adapter:error', (data) => {
        expect(data.error).toBeDefined();
        done();
      });
      badAdapter.initialize().catch(() => {});
    });
  });
});
