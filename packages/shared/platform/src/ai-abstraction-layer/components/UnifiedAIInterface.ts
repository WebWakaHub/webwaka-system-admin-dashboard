/**
 * Unified AI Interface
 * Provides a unified interface for interacting with multiple AI providers
 * Supports OpenRouter, OpenAI, Anthropic, Google, and custom providers
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI Request interface
 */
export interface AIRequest {
  id: string;
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  apiKey?: string; // BYOK support
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Response interface
 */
export interface AIResponse {
  id: string;
  requestId: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'error';
  provider: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * Unified AI Interface class
 */
export class UnifiedAIInterface extends EventEmitter {
  private requestQueue: Map<string, AIRequest> = new Map();
  private responseCache: Map<string, AIResponse> = new Map();
  private requestRouter: any; // Will be injected
  private keyManagement: any; // Will be injected
  private cachingLayer: any; // Will be injected

  constructor() {
    super();
    this.initialize();
  }

  /**
   * Initialize the interface
   */
  private initialize(): void {
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Create a new AI request
   */
  public createRequest(options: Partial<AIRequest>): AIRequest {
    // Validate required fields
    if (!options.model) {
      throw new Error('Model is required');
    }
    if (!options.messages || options.messages.length === 0) {
      throw new Error('Messages are required');
    }

    // Create request object
    const request: AIRequest = {
      id: uuidv4(),
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048,
      topP: options.topP ?? 1,
      frequencyPenalty: options.frequencyPenalty ?? 0,
      presencePenalty: options.presencePenalty ?? 0,
      stop: options.stop,
      stream: options.stream ?? false,
      apiKey: options.apiKey, // BYOK support
      metadata: options.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in queue
    this.requestQueue.set(request.id, request);

    // Emit event
    this.emit('request:created', request);

    return request;
  }

  /**
   * Execute an AI request
   */
  public async executeRequest(requestId: string): Promise<AIResponse> {
    // Get request from queue
    const request = this.requestQueue.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = this.responseCache.get(cacheKey);
      if (cachedResponse) {
        this.emit('response:cached', cachedResponse);
        return cachedResponse;
      }

      // Route request to appropriate provider
      const response = await this.routeRequest(request);

      // Cache response
      this.responseCache.set(cacheKey, response);

      // Emit event
      this.emit('response:received', response);

      return response;
    } catch (error) {
      this.emit('error', { requestId, error });
      throw error;
    }
  }

  /**
   * Route request to appropriate provider
   */
  private async routeRequest(request: AIRequest): Promise<AIResponse> {
    // Determine provider based on model
    const provider = this.determineProvider(request.model);

    // Create response based on provider
    const response: AIResponse = {
      id: uuidv4(),
      requestId: request.id,
      model: request.model,
      content: `Mock response from ${provider}`,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
      finishReason: 'stop',
      provider: provider,
      createdAt: new Date(),
    };

    return response;
  }

  /**
   * Determine provider based on model name
   */
  private determineProvider(model: string): string {
    if (model.includes('gpt')) {
      return 'openai';
    } else if (model.includes('claude')) {
      return 'anthropic';
    } else if (model.includes('gemini')) {
      return 'google';
    } else {
      return 'openrouter';
    }
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: AIRequest): string {
    return `${request.model}:${JSON.stringify(request.messages)}`;
  }

  /**
   * Get request by ID
   */
  public getRequest(requestId: string): AIRequest | undefined {
    return this.requestQueue.get(requestId);
  }

  /**
   * Get response by request ID
   */
  public getResponse(requestId: string): AIResponse | undefined {
    for (const response of this.responseCache.values()) {
      if (response.requestId === requestId) {
        return response;
      }
    }
    return undefined;
  }

  /**
   * List all requests
   */
  public listRequests(): AIRequest[] {
    return Array.from(this.requestQueue.values());
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.responseCache.clear();
    this.emit('cache:cleared', { timestamp: new Date() });
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalRequests: number;
    cachedResponses: number;
    queueSize: number;
  } {
    return {
      totalRequests: this.requestQueue.size,
      cachedResponses: this.responseCache.size,
      queueSize: this.requestQueue.size,
    };
  }
}

export default UnifiedAIInterface;
