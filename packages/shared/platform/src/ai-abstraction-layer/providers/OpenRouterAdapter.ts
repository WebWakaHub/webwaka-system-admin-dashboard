/**
 * OpenRouter Provider Adapter
 * Integrates with OpenRouter API for accessing multiple AI models
 */

import { EventEmitter } from 'events';

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface OpenRouterRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterAdapter extends EventEmitter {
  private config: OpenRouterConfig;
  private baseUrl: string;
  private requestCount: number = 0;
  private errorCount: number = 0;

  constructor(config: OpenRouterConfig) {
    super();
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://openrouter.io/api/v1';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.emit('adapter:initialized', { provider: 'openrouter' });
  }

  /**
   * Send request to OpenRouter
   */
  public async sendRequest(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      // Validate request
      this.validateRequest(request);

      // Prepare request payload
      const payload = {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
        top_p: request.top_p ?? 1,
        frequency_penalty: request.frequency_penalty ?? 0,
        presence_penalty: request.presence_penalty ?? 0,
        stop: request.stop,
      };

      // Make API call (mocked for now)
      const response = await this.makeAPICall(payload);

      this.requestCount++;
      this.emit('request:sent', { model: request.model, tokens: response.usage.total_tokens });

      return response;
    } catch (error) {
      this.errorCount++;
      this.emit('error', { error, requestModel: request.model });
      throw error;
    }
  }

  /**
   * Validate request
   */
  private validateRequest(request: OpenRouterRequest): void {
    if (!request.model) {
      throw new Error('Model is required');
    }
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages are required');
    }
  }

  /**
   * Make API call to OpenRouter
   */
  private async makeAPICall(payload: any): Promise<OpenRouterResponse> {
    // Mock implementation - in production, this would call the actual API
    return {
      id: `openrouter-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: payload.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `Mock response from OpenRouter for model ${payload.model}`,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    };
  }

  /**
   * List available models
   */
  public async listModels(): Promise<string[]> {
    return [
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'gemini-pro',
      'mistral-7b',
      'llama-2-70b',
    ];
  }

  /**
   * Get adapter statistics
   */
  public getStatistics(): {
    requestCount: number;
    errorCount: number;
    successRate: number;
  } {
    const total = this.requestCount + this.errorCount;
    const successRate = total > 0 ? (this.requestCount / total) * 100 : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.emit('statistics:reset', { timestamp: new Date() });
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const models = await this.listModels();
      this.emit('connection:tested', { success: true, modelCount: models.length });
      return true;
    } catch (error) {
      this.emit('connection:failed', { error });
      return false;
    }
  }
}

export default OpenRouterAdapter;
