/**
 * Analytics Engine
 * Tracks and analyzes AI request/response metrics and usage
 */

import { EventEmitter } from 'events';

export interface RequestMetrics {
  timestamp: Date;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: number; // in milliseconds
  status: 'success' | 'error' | 'timeout';
  cost?: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  timeoutRate: number;
}

export class AnalyticsEngine extends EventEmitter {
  private metrics: RequestMetrics[] = [];
  private modelStats: Map<string, UsageStats> = new Map();
  private providerStats: Map<string, UsageStats> = new Map();
  private tokenPrices: Map<string, { input: number; output: number }> = new Map();

  constructor() {
    super();
    this.initializeTokenPrices();
  }

  /**
   * Initialize token prices for different models
   */
  private initializeTokenPrices(): void {
    // OpenAI pricing
    this.tokenPrices.set('gpt-4', { input: 0.00003, output: 0.00006 });
    this.tokenPrices.set('gpt-3.5-turbo', { input: 0.0005, output: 0.0015 });

    // Anthropic pricing
    this.tokenPrices.set('claude-3-opus', { input: 0.000015, output: 0.000075 });
    this.tokenPrices.set('claude-3-sonnet', { input: 0.000003, output: 0.000015 });

    // Google pricing
    this.tokenPrices.set('gemini-pro', { input: 0.0005, output: 0.0015 });

    this.emit('prices:initialized', { count: this.tokenPrices.size });
  }

  /**
   * Record a request metric
   */
  public recordMetric(metric: RequestMetrics): void {
    this.metrics.push(metric);

    // Update model stats
    this.updateModelStats(metric);

    // Update provider stats
    this.updateProviderStats(metric);

    // Emit event
    this.emit('metric:recorded', {
      model: metric.model,
      status: metric.status,
      tokens: metric.totalTokens,
    });
  }

  /**
   * Update model statistics
   */
  private updateModelStats(metric: RequestMetrics): void {
    let stats = this.modelStats.get(metric.model);
    if (!stats) {
      stats = {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        timeoutRate: 0,
      };
      this.modelStats.set(metric.model, stats);
    }

    stats.totalRequests++;
    stats.totalTokens += metric.totalTokens;
    stats.totalCost += metric.cost || 0;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.totalRequests - 1) + metric.responseTime) /
      stats.totalRequests;

    // Update success/error/timeout rates
    const successCount = this.metrics.filter(
      (m) => m.model === metric.model && m.status === 'success'
    ).length;
    const errorCount = this.metrics.filter(
      (m) => m.model === metric.model && m.status === 'error'
    ).length;
    const timeoutCount = this.metrics.filter(
      (m) => m.model === metric.model && m.status === 'timeout'
    ).length;

    stats.successRate = (successCount / stats.totalRequests) * 100;
    stats.errorRate = (errorCount / stats.totalRequests) * 100;
    stats.timeoutRate = (timeoutCount / stats.totalRequests) * 100;
  }

  /**
   * Update provider statistics
   */
  private updateProviderStats(metric: RequestMetrics): void {
    let stats = this.providerStats.get(metric.provider);
    if (!stats) {
      stats = {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        timeoutRate: 0,
      };
      this.providerStats.set(metric.provider, stats);
    }

    stats.totalRequests++;
    stats.totalTokens += metric.totalTokens;
    stats.totalCost += metric.cost || 0;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.totalRequests - 1) + metric.responseTime) /
      stats.totalRequests;
  }

  /**
   * Calculate cost for a request
   */
  public calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const prices = this.tokenPrices.get(model);
    if (!prices) {
      return 0;
    }

    return promptTokens * prices.input + completionTokens * prices.output;
  }

  /**
   * Get model statistics
   */
  public getModelStats(model: string): UsageStats | undefined {
    return this.modelStats.get(model);
  }

  /**
   * Get provider statistics
   */
  public getProviderStats(provider: string): UsageStats | undefined {
    return this.providerStats.get(provider);
  }

  /**
   * Get all model statistics
   */
  public getAllModelStats(): Record<string, UsageStats> {
    const stats: Record<string, UsageStats> = {};
    this.modelStats.forEach((stat, model) => {
      stats[model] = stat;
    });
    return stats;
  }

  /**
   * Get all provider statistics
   */
  public getAllProviderStats(): Record<string, UsageStats> {
    const stats: Record<string, UsageStats> = {};
    this.providerStats.forEach((stat, provider) => {
      stats[provider] = stat;
    });
    return stats;
  }

  /**
   * Get metrics for a time range
   */
  public getMetricsForTimeRange(startTime: Date, endTime: Date): RequestMetrics[] {
    return this.metrics.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * Get metrics for a model
   */
  public getMetricsForModel(model: string): RequestMetrics[] {
    return this.metrics.filter((m) => m.model === model);
  }

  /**
   * Get metrics for a provider
   */
  public getMetricsForProvider(provider: string): RequestMetrics[] {
    return this.metrics.filter((m) => m.provider === provider);
  }

  /**
   * Get overall statistics
   */
  public getOverallStats(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    timeoutRate: number;
  } {
    const successCount = this.metrics.filter((m) => m.status === 'success').length;
    const errorCount = this.metrics.filter((m) => m.status === 'error').length;
    const timeoutCount = this.metrics.filter((m) => m.status === 'timeout').length;

    let totalCost = 0;
    let totalResponseTime = 0;

    this.metrics.forEach((m) => {
      totalCost += m.cost || 0;
      totalResponseTime += m.responseTime;
    });

    const total = this.metrics.length;

    return {
      totalRequests: total,
      totalTokens: this.metrics.reduce((sum, m) => sum + m.totalTokens, 0),
      totalCost,
      averageResponseTime: total > 0 ? totalResponseTime / total : 0,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      errorRate: total > 0 ? (errorCount / total) * 100 : 0,
      timeoutRate: total > 0 ? (timeoutCount / total) * 100 : 0,
    };
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.modelStats.clear();
    this.providerStats.clear();
    this.emit('metrics:cleared', { timestamp: new Date() });
  }

  /**
   * Export metrics as JSON
   */
  public exportMetrics(): {
    metrics: RequestMetrics[];
    modelStats: Record<string, UsageStats>;
    providerStats: Record<string, UsageStats>;
    overallStats: any;
  } {
    return {
      metrics: this.metrics,
      modelStats: this.getAllModelStats(),
      providerStats: this.getAllProviderStats(),
      overallStats: this.getOverallStats(),
    };
  }
}

export default AnalyticsEngine;
