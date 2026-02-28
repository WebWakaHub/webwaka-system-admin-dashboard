/**
 * Unit Tests for AnalyticsEngine
 * Tests for metrics tracking, usage statistics, and cost calculation
 */

import AnalyticsEngine, { RequestMetrics } from '../../components/AnalyticsEngine';

describe('AnalyticsEngine', () => {
  let analytics: AnalyticsEngine;

  beforeEach(() => {
    analytics = new AnalyticsEngine();
  });

  describe('recordMetric', () => {
    it('should record a request metric', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      const stats = analytics.getModelStats('gpt-4');
      expect(stats?.totalRequests).toBe(1);
    });

    it('should emit metric:recorded event', (done) => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.on('metric:recorded', (data) => {
        expect(data.model).toBe('gpt-4');
        done();
      });

      analytics.recordMetric(metric);
    });

    it('should track multiple metrics', () => {
      const metric1: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      const metric2: RequestMetrics = {
        timestamp: new Date(),
        model: 'claude-3',
        provider: 'anthropic',
        promptTokens: 80,
        completionTokens: 40,
        totalTokens: 120,
        responseTime: 400,
        status: 'success',
      };

      analytics.recordMetric(metric1);
      analytics.recordMetric(metric2);

      const gpt4Stats = analytics.getModelStats('gpt-4');
      const claudeStats = analytics.getModelStats('claude-3');

      expect(gpt4Stats?.totalRequests).toBe(1);
      expect(claudeStats?.totalRequests).toBe(1);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for GPT-4', () => {
      const cost = analytics.calculateCost('gpt-4', 100, 50);

      expect(cost).toBeGreaterThan(0);
    });

    it('should calculate cost for Claude-3-Opus', () => {
      const cost = analytics.calculateCost('claude-3-opus', 100, 50);

      expect(cost).toBeGreaterThan(0);
    });

    it('should return 0 for unknown model', () => {
      const cost = analytics.calculateCost('unknown-model', 100, 50);

      expect(cost).toBe(0);
    });

    it('should calculate different costs for different models', () => {
      const gpt4Cost = analytics.calculateCost('gpt-4', 100, 50);
      const claudeCost = analytics.calculateCost('claude-3-opus', 100, 50);

      expect(gpt4Cost).not.toBe(claudeCost);
    });
  });

  describe('getModelStats', () => {
    it('should return statistics for a model', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      const stats = analytics.getModelStats('gpt-4');

      expect(stats?.totalRequests).toBe(1);
      expect(stats?.totalTokens).toBe(150);
      expect(stats?.averageResponseTime).toBe(500);
    });

    it('should return undefined for unknown model', () => {
      const stats = analytics.getModelStats('unknown-model');

      expect(stats).toBeUndefined();
    });

    it('should calculate success rate', () => {
      const successMetric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      const errorMetric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        responseTime: 100,
        status: 'error',
      };

      analytics.recordMetric(successMetric);
      analytics.recordMetric(errorMetric);

      const stats = analytics.getModelStats('gpt-4');

      expect(stats?.successRate).toBe(50);
    });
  });

  describe('getProviderStats', () => {
    it('should return statistics for a provider', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      const stats = analytics.getProviderStats('openai');

      expect(stats?.totalRequests).toBe(1);
      expect(stats?.totalTokens).toBe(150);
    });

    it('should return undefined for unknown provider', () => {
      const stats = analytics.getProviderStats('unknown-provider');

      expect(stats).toBeUndefined();
    });
  });

  describe('getMetricsForTimeRange', () => {
    it('should return metrics for a time range', () => {
      const now = new Date();
      const metric: RequestMetrics = {
        timestamp: now,
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      const startTime = new Date(now.getTime() - 60000); // 1 minute ago
      const endTime = new Date(now.getTime() + 60000); // 1 minute from now

      const metrics = analytics.getMetricsForTimeRange(startTime, endTime);

      expect(metrics).toHaveLength(1);
    });

    it('should return empty array for time range with no metrics', () => {
      const startTime = new Date('2020-01-01');
      const endTime = new Date('2020-01-02');

      const metrics = analytics.getMetricsForTimeRange(startTime, endTime);

      expect(metrics).toHaveLength(0);
    });
  });

  describe('getMetricsForModel', () => {
    it('should return metrics for a model', () => {
      const metric1: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      const metric2: RequestMetrics = {
        timestamp: new Date(),
        model: 'claude-3',
        provider: 'anthropic',
        promptTokens: 80,
        completionTokens: 40,
        totalTokens: 120,
        responseTime: 400,
        status: 'success',
      };

      analytics.recordMetric(metric1);
      analytics.recordMetric(metric2);

      const metrics = analytics.getMetricsForModel('gpt-4');

      expect(metrics).toHaveLength(1);
      expect(metrics[0].model).toBe('gpt-4');
    });
  });

  describe('getMetricsForProvider', () => {
    it('should return metrics for a provider', () => {
      const metric1: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      const metric2: RequestMetrics = {
        timestamp: new Date(),
        model: 'claude-3',
        provider: 'anthropic',
        promptTokens: 80,
        completionTokens: 40,
        totalTokens: 120,
        responseTime: 400,
        status: 'success',
      };

      analytics.recordMetric(metric1);
      analytics.recordMetric(metric2);

      const metrics = analytics.getMetricsForProvider('openai');

      expect(metrics).toHaveLength(1);
      expect(metrics[0].provider).toBe('openai');
    });
  });

  describe('getOverallStats', () => {
    it('should return overall statistics', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
        cost: 0.01,
      };

      analytics.recordMetric(metric);

      const stats = analytics.getOverallStats();

      expect(stats.totalRequests).toBe(1);
      expect(stats.totalTokens).toBe(150);
      expect(stats.totalCost).toBe(0.01);
      expect(stats.successRate).toBe(100);
    });

    it('should calculate average response time', () => {
      const metric1: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 400,
        status: 'success',
      };

      const metric2: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 600,
        status: 'success',
      };

      analytics.recordMetric(metric1);
      analytics.recordMetric(metric2);

      const stats = analytics.getOverallStats();

      expect(stats.averageResponseTime).toBe(500);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      analytics.clearMetrics();

      const stats = analytics.getOverallStats();

      expect(stats.totalRequests).toBe(0);
    });

    it('should emit metrics:cleared event', (done) => {
      analytics.on('metrics:cleared', () => {
        done();
      });

      analytics.clearMetrics();
    });
  });

  describe('exportMetrics', () => {
    it('should export all metrics', () => {
      const metric: RequestMetrics = {
        timestamp: new Date(),
        model: 'gpt-4',
        provider: 'openai',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        responseTime: 500,
        status: 'success',
      };

      analytics.recordMetric(metric);

      const exported = analytics.exportMetrics();

      expect(exported.metrics).toHaveLength(1);
      expect(exported.modelStats).toBeDefined();
      expect(exported.providerStats).toBeDefined();
      expect(exported.overallStats).toBeDefined();
    });
  });
});
