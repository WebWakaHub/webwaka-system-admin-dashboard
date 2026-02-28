import { AIServiceGateway } from '../../../src/ai-extension-framework/gateway/AIServiceGateway';
import { AIServiceError } from '../../../src/ai-extension-framework/errors/AIExtensionError';

describe('AIServiceGateway', () => {
  let gateway: AIServiceGateway;

  beforeEach(() => {
    gateway = new AIServiceGateway();
  });

  describe('Provider Management', () => {
    it('should have mock provider by default', () => {
      const providers = gateway.getProviders();
      expect(providers).toContain('mock');
    });

    it('should register a provider', () => {
      const mockProvider = { test: 'provider' };
      gateway.registerProvider('custom', mockProvider);
      expect(gateway.getProviders()).toContain('custom');
    });

    it('should get a provider', () => {
      const provider = gateway.getProvider('mock');
      expect(provider).toBeDefined();
    });

    it('should throw error for non-existent provider', () => {
      expect(() => gateway.getProvider('non-existent')).toThrow(AIServiceError);
    });

    it('should set default provider', () => {
      const mockProvider = { test: 'provider' };
      gateway.registerProvider('custom', mockProvider);
      gateway.setDefaultProvider('custom');
      expect(gateway.getDefaultProvider()).toBe('custom');
    });

    it('should throw error when setting non-existent default', () => {
      expect(() => gateway.setDefaultProvider('non-existent')).toThrow(AIServiceError);
    });
  });

  describe('Text Generation', () => {
    it('should generate text', async () => {
      const response = await gateway.text.generate({
        prompt: 'Hello, world!',
      });
      expect(response.text).toBeDefined();
      expect(response.tokens).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it('should handle text generation with options', async () => {
      const response = await gateway.text.generate({
        prompt: 'Test prompt',
        maxTokens: 100,
        temperature: 0.7,
        topP: 0.9,
      });
      expect(response.text).toBeDefined();
    });

    it('should throw error on text generation failure', async () => {
      gateway.registerProvider('error', {
        text: {
          generate: async () => {
            throw new Error('Generation failed');
          },
        },
      });
      gateway.setDefaultProvider('error');
      await expect(gateway.text.generate({ prompt: 'test' })).rejects.toThrow(AIServiceError);
    });
  });

  describe('Embedding', () => {
    it('should generate embedding', async () => {
      const response = await gateway.embedding.generate({
        text: 'Hello, world!',
      });
      expect(response.embedding).toBeDefined();
      expect(Array.isArray(response.embedding)).toBe(true);
      expect(response.model).toBeDefined();
    });

    it('should throw error on embedding failure', async () => {
      gateway.registerProvider('error', {
        embedding: {
          generate: async () => {
            throw new Error('Embedding failed');
          },
        },
      });
      gateway.setDefaultProvider('error');
      await expect(gateway.embedding.generate({ text: 'test' })).rejects.toThrow(AIServiceError);
    });
  });

  describe('Classification', () => {
    it('should classify text', async () => {
      const response = await gateway.classification.classify({
        text: 'Hello, world!',
        labels: ['greeting', 'question', 'statement'],
      });
      expect(response.label).toBeDefined();
      expect(response.confidence).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it('should throw error on classification failure', async () => {
      gateway.registerProvider('error', {
        classification: {
          classify: async () => {
            throw new Error('Classification failed');
          },
        },
      });
      gateway.setDefaultProvider('error');
      await expect(
        gateway.classification.classify({
          text: 'test',
          labels: ['a', 'b'],
        })
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('Default Provider', () => {
    it('should use default provider', async () => {
      const response = await gateway.text.generate({ prompt: 'test' });
      expect(response.model).toBe('mock-gpt');
    });

    it('should change default provider', async () => {
      const customProvider = {
        text: {
          generate: async () => ({
            text: 'custom response',
            tokens: 5,
            model: 'custom-model',
          }),
        },
      };
      gateway.registerProvider('custom', customProvider);
      gateway.setDefaultProvider('custom');
      const response = await gateway.text.generate({ prompt: 'test' });
      expect(response.model).toBe('custom-model');
    });
  });
});
