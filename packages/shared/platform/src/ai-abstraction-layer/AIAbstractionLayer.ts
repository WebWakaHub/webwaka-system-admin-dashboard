/**
 * AI Abstraction Layer
 * Main orchestrator for the AI Abstraction Layer system
 * Coordinates all components: UnifiedAIInterface, RequestRouter, KeyManagement, CachingLayer, AnalyticsEngine
 */

import { EventEmitter } from 'events';
import UnifiedAIInterface, { AIRequest, AIResponse } from './components/UnifiedAIInterface';
import RequestRouter from './components/RequestRouter';
import KeyManagement, { BYOKKey } from './components/KeyManagement';
import CachingLayer from './components/CachingLayer';
import AnalyticsEngine, { RequestMetrics } from './components/AnalyticsEngine';
import OpenRouterAdapter from './providers/OpenRouterAdapter';

export interface AIAbstractionLayerConfig {
  encryptionKey?: string;
  cacheMaxSize?: number;
  cacheTTL?: number;
  enableAnalytics?: boolean;
  enableCaching?: boolean;
}

export class AIAbstractionLayer extends EventEmitter {
  private unifiedInterface: UnifiedAIInterface;
  private requestRouter: RequestRouter;
  private keyManagement: KeyManagement;
  private cachingLayer: CachingLayer;
  private analyticsEngine: AnalyticsEngine;
  private openRouterAdapter: OpenRouterAdapter | null = null;
  private config: AIAbstractionLayerConfig;
  private isInitialized: boolean = false;

  constructor(config: AIAbstractionLayerConfig = {}) {
    super();
    this.config = config;
    this.unifiedInterface = new UnifiedAIInterface();
    this.requestRouter = new RequestRouter();
    this.keyManagement = new KeyManagement(config.encryptionKey);
    this.cachingLayer = new CachingLayer({
      maxSize: config.cacheMaxSize || 1000,
      defaultTTL: config.cacheTTL || 3600,
    });
    this.analyticsEngine = new AnalyticsEngine();
    this.initialize();
  }

  /**
   * Initialize the system
   */
  private initialize(): void {
    // Wire up event listeners
    this.unifiedInterface.on('request:created', (request: AIRequest) => {
      this.emit('request:created', request);
    });

    this.unifiedInterface.on('response:received', (response: AIResponse) => {
      this.emit('response:received', response);
    });

    this.requestRouter.on('request:routed', (data) => {
      this.emit('request:routed', data);
    });

    this.keyManagement.on('key:created', (data) => {
      this.emit('key:created', data);
    });

    this.cachingLayer.on('cache:hit', (data) => {
      this.emit('cache:hit', data);
    });

    this.analyticsEngine.on('metric:recorded', (data) => {
      this.emit('metric:recorded', data);
    });

    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Create and execute an AI request
   */
  public async executeRequest(options: Partial<AIRequest>): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI Abstraction Layer not initialized');
    }

    const startTime = Date.now();

    try {
      // Create request
      const request = this.unifiedInterface.createRequest(options);

      // Route request
      const route = this.requestRouter.routeRequest(request.model);

      // Execute request
      const response = await this.unifiedInterface.executeRequest(request.id);

      // Record metrics
      if (this.config.enableAnalytics) {
        const metric: RequestMetrics = {
          timestamp: new Date(),
          model: request.model,
          provider: route.provider,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          responseTime: Date.now() - startTime,
          status: 'success',
          cost: this.analyticsEngine.calculateCost(
            request.model,
            response.usage.promptTokens,
            response.usage.completionTokens
          ),
        };
        this.analyticsEngine.recordMetric(metric);
      }

      return response;
    } catch (error) {
      // Record error metric
      if (this.config.enableAnalytics) {
        const metric: RequestMetrics = {
          timestamp: new Date(),
          model: options.model || 'unknown',
          provider: 'unknown',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTime: Date.now() - startTime,
          status: 'error',
        };
        this.analyticsEngine.recordMetric(metric);
      }

      throw error;
    }
  }

  /**
   * Create a BYOK key
   */
  public createBYOKKey(
    name: string,
    provider: string,
    apiKey: string,
    expiresAt?: Date,
    metadata?: Record<string, any>
  ): BYOKKey {
    return this.keyManagement.createKey(name, provider, apiKey, expiresAt, metadata);
  }

  /**
   * Get decrypted API key
   */
  public getDecryptedKey(keyId: string): string {
    return this.keyManagement.getDecryptedKey(keyId);
  }

  /**
   * Rotate a BYOK key
   */
  public rotateBYOKKey(keyId: string, newApiKey: string): BYOKKey {
    return this.keyManagement.rotateKey(keyId, newApiKey);
  }

  /**
   * Revoke a BYOK key
   */
  public revokeBYOKKey(keyId: string): void {
    this.keyManagement.revokeKey(keyId);
  }

  /**
   * List BYOK keys for a provider
   */
  public listBYOKKeys(provider: string): BYOKKey[] {
    return this.keyManagement.listKeysByProvider(provider);
  }

  /**
   * Initialize OpenRouter adapter
   */
  public initializeOpenRouter(apiKey: string): void {
    this.openRouterAdapter = new OpenRouterAdapter({ apiKey });
    this.emit('openrouter:initialized', { timestamp: new Date() });
  }

  /**
   * Get OpenRouter adapter
   */
  public getOpenRouterAdapter(): OpenRouterAdapter | null {
    return this.openRouterAdapter;
  }

  /**
   * Get system statistics
   */
  public getStatistics(): {
    requests: { total: number; queued: number };
    keys: { total: number; active: number };
    cache: { size: number; maxSize: number; hitRate: number };
    analytics: any;
  } {
    return {
      requests: this.unifiedInterface.getStatistics(),
      keys: this.keyManagement.getStatistics(),
      cache: this.cachingLayer.getStatistics(),
      analytics: this.analyticsEngine.getOverallStats(),
    };
  }

  /**
   * Get overall health status
   */
  public getHealthStatus(): {
    initialized: boolean;
    components: {
      unifiedInterface: boolean;
      requestRouter: boolean;
      keyManagement: boolean;
      cachingLayer: boolean;
      analyticsEngine: boolean;
      openRouter: boolean;
    };
  } {
    return {
      initialized: this.isInitialized,
      components: {
        unifiedInterface: true,
        requestRouter: true,
        keyManagement: true,
        cachingLayer: true,
        analyticsEngine: true,
        openRouter: this.openRouterAdapter !== null,
      },
    };
  }

  /**
   * Shutdown the system
   */
  public shutdown(): void {
    this.cachingLayer.clear();
    this.isInitialized = false;
    this.emit('shutdown', { timestamp: new Date() });
  }
}

export default AIAbstractionLayer;
