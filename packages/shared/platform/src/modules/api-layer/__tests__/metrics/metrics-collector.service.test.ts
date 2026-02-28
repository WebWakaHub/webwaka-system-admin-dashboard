/**
 * Unit Tests for Metrics Collector Service
 * 
 * Tests performance metrics collection and aggregation.
 */

import { MetricsCollectorService } from '../../metrics/metrics-collector.service';

describe('MetricsCollectorService', () => {
  let metrics: MetricsCollectorService;

  beforeEach(() => {
    metrics = new MetricsCollectorService();
  });

  describe('incrementCounter', () => {
    it('should increment counter metric', () => {
      metrics.incrementCounter('test_counter');

      const metric = metrics.getMetric('test_counter');
      expect(metric).toBeDefined();
      expect(metric?.type).toBe('counter');
      expect(metric?.value).toBe(1);
    });

    it('should increment counter by custom value', () => {
      metrics.incrementCounter('test_counter', 5);

      const metric = metrics.getMetric('test_counter');
      expect(metric?.value).toBe(5);
    });

    it('should accumulate counter values', () => {
      metrics.incrementCounter('test_counter', 1);
      metrics.incrementCounter('test_counter', 2);
      metrics.incrementCounter('test_counter', 3);

      const metric = metrics.getMetric('test_counter');
      expect(metric?.value).toBe(6);
    });

    it('should support labels', () => {
      metrics.incrementCounter('requests', 1, { method: 'GET' });
      metrics.incrementCounter('requests', 1, { method: 'POST' });

      const getMetric = metrics.getMetric('requests', { method: 'GET' });
      const postMetric = metrics.getMetric('requests', { method: 'POST' });

      expect(getMetric?.value).toBe(1);
      expect(postMetric?.value).toBe(1);
    });
  });

  describe('setGauge', () => {
    it('should set gauge metric', () => {
      metrics.setGauge('memory_usage', 75.5);

      const metric = metrics.getMetric('memory_usage');
      expect(metric).toBeDefined();
      expect(metric?.type).toBe('gauge');
      expect(metric?.value).toBe(75.5);
    });

    it('should overwrite gauge value', () => {
      metrics.setGauge('memory_usage', 75.5);
      metrics.setGauge('memory_usage', 80.2);

      const metric = metrics.getMetric('memory_usage');
      expect(metric?.value).toBe(80.2);
    });

    it('should support labels', () => {
      metrics.setGauge('cpu_usage', 50, { core: '0' });
      metrics.setGauge('cpu_usage', 60, { core: '1' });

      const core0 = metrics.getMetric('cpu_usage', { core: '0' });
      const core1 = metrics.getMetric('cpu_usage', { core: '1' });

      expect(core0?.value).toBe(50);
      expect(core1?.value).toBe(60);
    });
  });

  describe('recordHistogram', () => {
    it('should record histogram value', () => {
      metrics.recordHistogram('request_duration', 45);

      const metric = metrics.getMetric('request_duration');
      expect(metric).toBeDefined();
      expect(metric?.type).toBe('histogram');
      expect(metric?.histogram).toBeDefined();
      expect(metric?.histogram?.count).toBe(1);
      expect(metric?.histogram?.sum).toBe(45);
    });

    it('should calculate percentiles', () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      values.forEach(v => metrics.recordHistogram('latency', v));

      const metric = metrics.getMetric('latency');
      expect(metric?.histogram?.p50).toBe(50);
      expect(metric?.histogram?.p95).toBe(95);
      expect(metric?.histogram?.p99).toBe(99);
    });

    it('should track min and max', () => {
      metrics.recordHistogram('response_size', 100);
      metrics.recordHistogram('response_size', 500);
      metrics.recordHistogram('response_size', 200);

      const metric = metrics.getMetric('response_size');
      expect(metric?.histogram?.min).toBe(100);
      expect(metric?.histogram?.max).toBe(500);
    });

    it('should limit histogram size to 1000 values', () => {
      for (let i = 0; i < 1500; i++) {
        metrics.recordHistogram('test', i);
      }

      const metric = metrics.getMetric('test');
      expect(metric?.histogram?.count).toBe(1000);
    });
  });

  describe('recordRequest', () => {
    it('should record request metrics', () => {
      metrics.recordRequest('GET', '/api/v1/test', 200, 45);

      const counterMetric = metrics.getMetric('api_requests_total', {
        method: 'GET',
        path: '/api/v1/test',
        status: '200',
      });

      expect(counterMetric?.value).toBe(1);

      const latencyMetric = metrics.getMetric('api_request_duration_ms', {
        method: 'GET',
        path: '/api/v1/test',
      });

      expect(latencyMetric?.histogram).toBeDefined();
    });

    it('should track errors separately', () => {
      metrics.recordRequest('POST', '/api/v1/test', 500, 100);

      const errorMetric = metrics.getMetric('api_errors_total', {
        method: 'POST',
        path: '/api/v1/test',
        status: '500',
      });

      expect(errorMetric?.value).toBe(1);
    });

    it('should not track successful requests as errors', () => {
      metrics.recordRequest('GET', '/api/v1/test', 200, 45);

      const errorMetric = metrics.getMetric('api_errors_total', {
        method: 'GET',
        path: '/api/v1/test',
        status: '200',
      });

      expect(errorMetric).toBeUndefined();
    });
  });

  describe('recordAuthentication', () => {
    it('should record successful authentication', () => {
      metrics.recordAuthentication(true);

      const metric = metrics.getMetric('api_auth_total', { result: 'success' });
      expect(metric?.value).toBe(1);
    });

    it('should record failed authentication', () => {
      metrics.recordAuthentication(false);

      const metric = metrics.getMetric('api_auth_total', { result: 'failure' });
      expect(metric?.value).toBe(1);
    });
  });

  describe('recordAuthorization', () => {
    it('should record allowed authorization', () => {
      metrics.recordAuthorization(true);

      const metric = metrics.getMetric('api_authz_total', { result: 'allowed' });
      expect(metric?.value).toBe(1);
    });

    it('should record denied authorization', () => {
      metrics.recordAuthorization(false);

      const metric = metrics.getMetric('api_authz_total', { result: 'denied' });
      expect(metric?.value).toBe(1);
    });
  });

  describe('recordRateLimit', () => {
    it('should record rate limit exceeded', () => {
      metrics.recordRateLimit(true);

      const metric = metrics.getMetric('api_rate_limit_total', { result: 'exceeded' });
      expect(metric?.value).toBe(1);
    });

    it('should record rate limit allowed', () => {
      metrics.recordRateLimit(false);

      const metric = metrics.getMetric('api_rate_limit_total', { result: 'allowed' });
      expect(metric?.value).toBe(1);
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics', () => {
      metrics.incrementCounter('counter1');
      metrics.setGauge('gauge1', 50);
      metrics.recordHistogram('histogram1', 100);

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getSummary', () => {
    it('should return metrics summary', () => {
      metrics.incrementCounter('test_counter');
      metrics.setGauge('test_gauge', 75);

      const summary = metrics.getSummary();
      expect(summary.timestamp).toBeDefined();
      expect(summary.metrics).toBeDefined();
      expect(Object.keys(summary.metrics).length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      metrics.incrementCounter('counter');
      metrics.setGauge('gauge', 50);

      metrics.reset();

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.size).toBe(0);
    });
  });
});
