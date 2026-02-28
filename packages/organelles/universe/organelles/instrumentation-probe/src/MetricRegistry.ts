/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * MetricRegistry — Bounded Metric Storage with LRU Eviction
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#481 (P3-T03)
 *
 * Enforces INV-IN-P04: ≤ 500KB (1000 metrics x 500B).
 * Provides metric registration, lookup, and snapshot for emission.
 */

import { MetricEntry } from './types';
import { MetricRegistryFullError, InvalidMetricNameError } from './errors';

const METRIC_NAME_PATTERN = /^webwaka\.[a-z]+\.[a-z_]+\.[a-z_.]+$/;

interface RegistryEntry {
  metric: MetricEntry;
  lastAccessed: number;
  description: string;
  labels: string[];
}

export class MetricRegistry {
  private readonly entries = new Map<string, RegistryEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Register a new metric. Throws if name is invalid or registry is full.
   */
  register(
    name: string,
    type: 'counter' | 'histogram' | 'gauge',
    description: string,
    labels: string[] = [],
  ): void {
    if (!METRIC_NAME_PATTERN.test(name)) {
      throw new InvalidMetricNameError(name);
    }

    if (this.entries.has(name)) {
      return; // Idempotent registration
    }

    if (this.entries.size >= this.maxEntries) {
      // Try LRU eviction
      const evicted = this.evictLRU();
      if (!evicted) {
        throw new MetricRegistryFullError(this.maxEntries);
      }
    }

    this.entries.set(name, {
      metric: {
        name,
        type,
        value: 0,
        labels: {},
        timestamp: Date.now(),
      },
      lastAccessed: Date.now(),
      description,
      labels,
    });
  }

  /**
   * Record a metric value.
   */
  record(
    name: string,
    value: number,
    labels: Record<string, string> = {},
    tenantId?: string,
  ): MetricEntry {
    const entry = this.entries.get(name);
    if (!entry) {
      throw new Error(`Metric "${name}" not registered`);
    }

    entry.lastAccessed = Date.now();
    entry.metric = {
      ...entry.metric,
      value,
      labels,
      timestamp: Date.now(),
      tenantId,
    };

    return entry.metric;
  }

  /**
   * Get current value of a metric.
   */
  get(name: string): MetricEntry | undefined {
    const entry = this.entries.get(name);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.metric;
    }
    return undefined;
  }

  /**
   * Take a snapshot of all metrics for emission.
   * Does not clear the registry.
   */
  snapshot(): MetricEntry[] {
    return Array.from(this.entries.values()).map(e => ({ ...e.metric }));
  }

  /**
   * Get the number of registered metrics.
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Check if a metric is registered.
   */
  has(name: string): boolean {
    return this.entries.has(name);
  }

  /**
   * Remove a metric from the registry.
   */
  unregister(name: string): boolean {
    return this.entries.delete(name);
  }

  /**
   * Clear all metrics.
   */
  clear(): void {
    this.entries.clear();
  }

  /**
   * Evict the least recently used metric.
   * Returns true if an entry was evicted, false if registry is empty.
   */
  private evictLRU(): boolean {
    if (this.entries.size === 0) return false;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.entries) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.entries.delete(oldestKey);
      return true;
    }

    return false;
  }
}
