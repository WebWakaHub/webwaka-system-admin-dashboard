/**
 * AIServiceGateway - Unified interface for accessing AI services
 */

import { AIServiceError } from '../errors/AIExtensionError';

export interface AITextGenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface AITextGenerationResponse {
  text: string;
  tokens: number;
  model: string;
}

export interface AIEmbeddingRequest {
  text: string;
}

export interface AIEmbeddingResponse {
  embedding: number[];
  model: string;
}

export interface AIClassificationRequest {
  text: string;
  labels: string[];
}

export interface AIClassificationResponse {
  label: string;
  confidence: number;
  model: string;
}

export class AIServiceGateway {
  private providers: Map<string, any>;
  private defaultProvider: string;

  constructor(defaultProvider: string = 'mock') {
    this.providers = new Map();
    this.defaultProvider = defaultProvider;

    // Register mock provider for development
    this.registerMockProvider();
  }

  /**
   * Register a mock AI provider for development
   */
  private registerMockProvider(): void {
    const mockProvider = {
      text: {
        generate: async (request: AITextGenerationRequest): Promise<AITextGenerationResponse> => {
          return {
            text: `Mock response to: ${request.prompt}`,
            tokens: 10,
            model: 'mock-gpt',
          };
        },
      },
      embedding: {
        generate: async (request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> => {
          return {
            embedding: Array(768).fill(0.1),
            model: 'mock-embedding',
          };
        },
      },
      classification: {
        classify: async (request: AIClassificationRequest): Promise<AIClassificationResponse> => {
          return {
            label: request.labels[0],
            confidence: 0.95,
            model: 'mock-classifier',
          };
        },
      },
    };

    this.providers.set('mock', mockProvider);
  }

  /**
   * Register an AI provider
   */
  registerProvider(name: string, provider: any): void {
    this.providers.set(name, provider);
  }

  /**
   * Get a provider
   */
  getProvider(name: string = this.defaultProvider): any {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIServiceError(`AI provider '${name}' not found`);
    }
    return provider;
  }

  /**
   * Text generation service
   */
  get text() {
    return {
      generate: async (request: AITextGenerationRequest): Promise<AITextGenerationResponse> => {
        try {
          const provider = this.getProvider();
          return await provider.text.generate(request);
        } catch (error) {
          throw new AIServiceError(`Text generation failed: ${(error as Error).message}`);
        }
      },
    };
  }

  /**
   * Embedding service
   */
  get embedding() {
    return {
      generate: async (request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> => {
        try {
          const provider = this.getProvider();
          return await provider.embedding.generate(request);
        } catch (error) {
          throw new AIServiceError(`Embedding generation failed: ${(error as Error).message}`);
        }
      },
    };
  }

  /**
   * Classification service
   */
  get classification() {
    return {
      classify: async (request: AIClassificationRequest): Promise<AIClassificationResponse> => {
        try {
          const provider = this.getProvider();
          return await provider.classification.classify(request);
        } catch (error) {
          throw new AIServiceError(`Classification failed: ${(error as Error).message}`);
        }
      },
    };
  }

  /**
   * Get all registered providers
   */
  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Set default provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new AIServiceError(`AI provider '${name}' not found`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get default provider name
   */
  getDefaultProvider(): string {
    return this.defaultProvider;
  }
}
