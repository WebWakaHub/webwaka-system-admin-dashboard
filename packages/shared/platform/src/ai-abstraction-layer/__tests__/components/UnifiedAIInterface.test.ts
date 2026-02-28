/**
 * Unit Tests for UnifiedAIInterface
 * Tests for request creation, execution, and response handling
 */

import UnifiedAIInterface, { AIRequest, AIResponse } from '../../components/UnifiedAIInterface';

describe('UnifiedAIInterface', () => {
  let interface_: UnifiedAIInterface;

  beforeEach(() => {
    interface_ = new UnifiedAIInterface();
  });

  describe('createRequest', () => {
    it('should create a request with valid input', () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.model).toBe('gpt-4');
      expect(request.messages).toHaveLength(1);
      expect(request.temperature).toBe(0.7);
      expect(request.maxTokens).toBe(2048);
    });

    it('should throw error when model is missing', () => {
      expect(() => {
        interface_.createRequest({
          messages: [{ role: 'user', content: 'Hello' }],
        });
      }).toThrow('Model is required');
    });

    it('should throw error when messages are missing', () => {
      expect(() => {
        interface_.createRequest({
          model: 'gpt-4',
        });
      }).toThrow('Messages are required');
    });

    it('should throw error when messages are empty', () => {
      expect(() => {
        interface_.createRequest({
          model: 'gpt-4',
          messages: [],
        });
      }).toThrow('Messages are required');
    });

    it('should set default values for optional parameters', () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(request.temperature).toBe(0.7);
      expect(request.maxTokens).toBe(2048);
      expect(request.topP).toBe(1);
      expect(request.frequencyPenalty).toBe(0);
      expect(request.presencePenalty).toBe(0);
      expect(request.stream).toBe(false);
    });

    it('should accept custom parameter values', () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
        maxTokens: 1024,
        topP: 0.9,
      });

      expect(request.temperature).toBe(0.5);
      expect(request.maxTokens).toBe(1024);
      expect(request.topP).toBe(0.9);
    });

    it('should support BYOK with apiKey parameter', () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'sk-test-key',
      });

      expect(request.apiKey).toBe('sk-test-key');
    });

    it('should emit request:created event', (done) => {
      interface_.on('request:created', (request: AIRequest) => {
        expect(request).toBeDefined();
        expect(request.model).toBe('gpt-4');
        done();
      });

      interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });
    });

    it('should store request in queue', () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const retrieved = interface_.getRequest(request.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(request.id);
    });
  });

  describe('executeRequest', () => {
    it('should execute a request successfully', async () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await interface_.executeRequest(request.id);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.requestId).toBe(request.id);
      expect(response.model).toBe('gpt-4');
      expect(response.content).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('should throw error for non-existent request', async () => {
      await expect(interface_.executeRequest('non-existent-id')).rejects.toThrow(
        'Request not found'
      );
    });

    it('should emit response:received event', (done) => {
      interface_.on('response:received', (response: AIResponse) => {
        expect(response).toBeDefined();
        done();
      });

      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      interface_.executeRequest(request.id);
    });

    it('should cache response on subsequent requests', async () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response1 = await interface_.executeRequest(request.id);
      const response2 = await interface_.executeRequest(request.id);

      expect(response1.id).toBe(response2.id);
    });
  });

  describe('getRequest', () => {
    it('should retrieve a stored request', () => {
      const created = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const retrieved = interface_.getRequest(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent request', () => {
      const retrieved = interface_.getRequest('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('listRequests', () => {
    it('should list all requests', () => {
      interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      interface_.createRequest({
        model: 'claude-3',
        messages: [{ role: 'user', content: 'Hi' }],
      });

      const requests = interface_.listRequests();

      expect(requests).toHaveLength(2);
    });

    it('should return empty array when no requests exist', () => {
      const requests = interface_.listRequests();

      expect(requests).toHaveLength(0);
    });
  });

  describe('clearCache', () => {
    it('should clear the response cache', async () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      await interface_.executeRequest(request.id);

      interface_.clearCache();

      const stats = interface_.getStatistics();
      expect(stats.cachedResponses).toBe(0);
    });

    it('should emit cache:cleared event', (done) => {
      interface_.on('cache:cleared', () => {
        done();
      });

      interface_.clearCache();
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', () => {
      interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const stats = interface_.getStatistics();

      expect(stats.totalRequests).toBe(1);
      expect(stats.queueSize).toBe(1);
      expect(stats.cachedResponses).toBeGreaterThanOrEqual(0);
    });

    it('should track request count', () => {
      interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      interface_.createRequest({
        model: 'claude-3',
        messages: [{ role: 'user', content: 'Hi' }],
      });

      const stats = interface_.getStatistics();

      expect(stats.totalRequests).toBe(2);
    });
  });

  describe('determineProvider', () => {
    it('should determine OpenAI provider for gpt models', async () => {
      const request = interface_.createRequest({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await interface_.executeRequest(request.id);

      expect(response.provider).toBe('openai');
    });

    it('should determine Anthropic provider for claude models', async () => {
      const request = interface_.createRequest({
        model: 'claude-3',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await interface_.executeRequest(request.id);

      expect(response.provider).toBe('anthropic');
    });

    it('should determine Google provider for gemini models', async () => {
      const request = interface_.createRequest({
        model: 'gemini-pro',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await interface_.executeRequest(request.id);

      expect(response.provider).toBe('google');
    });

    it('should default to OpenRouter for unknown models', async () => {
      const request = interface_.createRequest({
        model: 'unknown-model',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await interface_.executeRequest(request.id);

      expect(response.provider).toBe('openrouter');
    });
  });
});
