/**
 * Metrics Collector Service
 * 
 * Collects and aggregates performance metrics for monitoring.
 * Tracks request counts, latencies, errors, and custom metrics.
 */

export class MetricsCollectorService {
  private metrics: Map<string, Metric>;
  private histograms: Map<string, number[]>;

  constructor() {
    this.metrics = new Map();
    this.histograms = new Map();
  }

  /**
   * Increment a counter metric
   * 
   * @param name - Metric name
   * @param value - Increment value (default 1)
   * @param labels - Optional labels
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing && existing.type === 'counter') {
      existing.value += value;
      existing.timestamp = new Date();
    } else {
      this.metrics.set(key, {
        name,
        type: 'counter',
        value,
        labels,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Set a gauge metric
   * 
   * @param name - Metric name
   * @param value - Gauge value
   * @param labels - Optional labels
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.metrics.set(key, {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Record a histogram value
   * 
   * @param name - Metric name
   * @param value - Value to record
   * @param labels - Optional labels
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }

    const values = this.histograms.get(key)!;
    values.push(value);

    // Keep only last 1000 values to prevent memory issues
    if (values.length > 1000) {
      values.shift();
    }

    // Update metric with percentiles
    const sorted = [...values].sort((a, b) => a - b);
    this.metrics.set(key, {
      name,
      type: 'histogram',
      value: this.calculatePercentile(sorted, 50), // Median
      labels,
      timestamp: new Date(),
      histogram: {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.calculatePercentile(sorted, 50),
        p95: this.calculatePercentile(sorted, 95),
        p99: this.calculatePercentile(sorted, 99),
      },
    });
  }

  /**
   * Record request metrics
   * 
   * @param method - HTTP method
   * @param path - Request path
   * @param statusCode - Response status code
   * @param duration - Request duration in milliseconds
   */
  recordRequest(method: string, path: string, statusCode: number, duration: number): void {
    // Increment request counter
    this.incrementCounter('api_requests_total', 1, {
      method,
      path,
      status: statusCode.toString(),
    });

    // Record latency histogram
    this.recordHistogram('api_request_duration_ms', duration, {
      method,
      path,
    });

    // Track errors
    if (statusCode >= 400) {
      this.incrementCounter('api_errors_total', 1, {
        method,
        path,
        status: statusCode.toString(),
      });
    }
  }

  /**
   * Record authentication metrics
   * 
   * @param success - Whether authentication succeeded
   */
  recordAuthentication(success: boolean): void {
    this.incrementCounter('api_auth_total', 1, {
      result: success ? 'success' : 'failure',
    });
  }

  /**
   * Record authorization metrics
   * 
   * @param allowed - Whether authorization succeeded
   */
  recordAuthorization(allowed: boolean): void {
    this.incrementCounter('api_authz_total', 1, {
      result: allowed ? 'allowed' : 'denied',
    });
  }

  /**
   * Record rate limit metrics
   * 
   * @param exceeded - Whether rate limit was exceeded
   */
  recordRateLimit(exceeded: boolean): void {
    this.incrementCounter('api_rate_limit_total', 1, {
      result: exceeded ? 'exceeded' : 'allowed',
    });
  }

  /**
   * Get all metrics
   * 
   * @returns Map of all metrics
   */
  getMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  /**
   * Get metric by name
   * 
   * @param name - Metric name
   * @param labels - Optional labels
   * @returns Metric or undefined
   */
  getMetric(name: string, labels?: Record<string, string>): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  /**
   * Get metrics summary
   * 
   * @returns Metrics summary
   */
  getSummary(): MetricsSummary {
    const summary: MetricsSummary = {
      timestamp: new Date().toISOString(),
      metrics: {},
    };

    for (const [key, metric] of this.metrics.entries()) {
      summary.metrics[key] = {
        name: metric.name,
        type: metric.type,
        value: metric.value,
        labels: metric.labels,
        histogram: metric.histogram,
      };
    }

    return summary;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.histograms.clear();
  }

  /**
   * Calculate percentile from sorted array
   * 
   * @param sorted - Sorted array of values
   * @param percentile - Percentile to calculate (0-100)
   * @returns Percentile value
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) {
      return 0;
    }

    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Generate metric key
   * 
   * @param name - Metric name
   * @param labels - Optional labels
   * @returns Metric key
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}}`;
  }
}

/**
 * Metric Type
 */
export type MetricType = 'counter' | 'gauge' | 'histogram';

/**
 * Metric
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
  histogram?: HistogramData;
}

/**
 * Histogram Data
 */
export interface HistogramData {
  count: number;
  sum: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

/**
 * Metrics Summary
 */
export interface MetricsSummary {
  timestamp: string;
  metrics: Record<string, {
    name: string;
    type: MetricType;
    value: number;
    labels?: Record<string, string>;
    histogram?: HistogramData;
  }>;
}
