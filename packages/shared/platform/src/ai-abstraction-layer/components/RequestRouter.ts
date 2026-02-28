/**
 * Request Router
 * Routes AI requests to appropriate providers based on model and configuration
 */

import { EventEmitter } from 'events';

export interface RoutingConfig {
  model: string;
  provider: string;
  priority: number;
  fallback?: string;
  rateLimit?: number;
  timeout?: number;
}

export class RequestRouter extends EventEmitter {
  private routes: Map<string, RoutingConfig> = new Map();
  private providerWeights: Map<string, number> = new Map();
  private requestCounts: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializeDefaultRoutes();
  }

  /**
   * Initialize default routes
   */
  private initializeDefaultRoutes(): void {
    // OpenAI routes
    this.addRoute('gpt-4', 'openai', 1, 'gpt-3.5-turbo', 100, 30000);
    this.addRoute('gpt-3.5-turbo', 'openai', 2, 'gpt-4', 100, 30000);

    // Anthropic routes
    this.addRoute('claude-3-opus', 'anthropic', 1, 'claude-3-sonnet', 100, 30000);
    this.addRoute('claude-3-sonnet', 'anthropic', 2, 'claude-3-opus', 100, 30000);

    // Google routes
    this.addRoute('gemini-pro', 'google', 1, 'gpt-4', 100, 30000);

    // OpenRouter routes (fallback)
    this.addRoute('default', 'openrouter', 3, undefined, 100, 30000);

    this.emit('routes:initialized', { count: this.routes.size });
  }

  /**
   * Add a route
   */
  public addRoute(
    model: string,
    provider: string,
    priority: number,
    fallback?: string,
    rateLimit?: number,
    timeout?: number
  ): void {
    this.routes.set(model, {
      model,
      provider,
      priority,
      fallback,
      rateLimit,
      timeout,
    });

    this.emit('route:added', { model, provider });
  }

  /**
   * Route a request to the appropriate provider
   */
  public routeRequest(model: string): RoutingConfig {
    let route = this.routes.get(model);

    if (!route) {
      // Try to find a default route
      route = this.routes.get('default');
    }

    if (!route) {
      throw new Error(`No route found for model: ${model}`);
    }

    // Check rate limit
    const count = this.requestCounts.get(route.provider) || 0;
    if (route.rateLimit && count >= route.rateLimit) {
      if (route.fallback) {
        this.emit('route:fallback', { model, fallback: route.fallback });
        return this.routeRequest(route.fallback);
      }
      throw new Error(`Rate limit exceeded for provider: ${route.provider}`);
    }

    // Increment request count
    this.requestCounts.set(route.provider, count + 1);

    this.emit('request:routed', { model, provider: route.provider });

    return route;
  }

  /**
   * Get route for model
   */
  public getRoute(model: string): RoutingConfig | undefined {
    return this.routes.get(model);
  }

  /**
   * List all routes
   */
  public listRoutes(): RoutingConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * Set provider weight for load balancing
   */
  public setProviderWeight(provider: string, weight: number): void {
    this.providerWeights.set(provider, weight);
    this.emit('weight:updated', { provider, weight });
  }

  /**
   * Get provider weight
   */
  public getProviderWeight(provider: string): number {
    return this.providerWeights.get(provider) || 1;
  }

  /**
   * Reset request counts
   */
  public resetRequestCounts(): void {
    this.requestCounts.clear();
    this.emit('counts:reset', { timestamp: new Date() });
  }

  /**
   * Get request counts
   */
  public getRequestCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.requestCounts.forEach((count, provider) => {
      counts[provider] = count;
    });
    return counts;
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalRoutes: number;
    totalProviders: number;
    totalRequests: number;
  } {
    let totalRequests = 0;
    this.requestCounts.forEach((count) => {
      totalRequests += count;
    });

    return {
      totalRoutes: this.routes.size,
      totalProviders: this.providerWeights.size,
      totalRequests,
    };
  }
}

export default RequestRouter;
