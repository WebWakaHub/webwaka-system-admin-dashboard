/**
 * BOUNDARY CONTEXT ORGANELLE — Observability Hooks
 * Code: ORG-TB-BOUNDARY_CONTEXT-v0.1.0
 * Phase: 3 — Implementation (P3-T03: Observability Hooks)
 * Agent: webwakaagent4
 *
 * Implements BoundaryContextMetrics port with Prometheus-compatible counters,
 * histograms, and gauges. Also provides structured logging helpers.
 */

import type { BoundaryContextMetrics } from './index.js';

// ─── Prometheus-Compatible Metrics Implementation ─────────────────────────────

/**
 * In-memory metrics store compatible with Prometheus exposition format.
 * In production, replace with a Prometheus client (prom-client) or
 * OpenTelemetry SDK adapter.
 */
export class BoundaryContextPrometheusMetrics implements BoundaryContextMetrics {
  private counters = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private gauges = new Map<string, number>();

  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    const existing = this.histograms.get(key) ?? [];
    existing.push(value);
    this.histograms.set(key, existing);
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Export metrics in Prometheus text exposition format.
   * Mount this on GET /metrics for scraping.
   */
  exposition(): string {
    const lines: string[] = [];

    for (const [key, value] of this.counters) {
      lines.push(`# TYPE ${key.split('{')[0]} counter`);
      lines.push(`${key} ${value}`);
    }

    for (const [key, values] of this.histograms) {
      const baseName = key.split('{')[0];
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      lines.push(`# TYPE ${baseName} histogram`);
      lines.push(`${baseName}_sum ${sum}`);
      lines.push(`${baseName}_count ${count}`);
    }

    for (const [key, value] of this.gauges) {
      lines.push(`# TYPE ${key.split('{')[0]} gauge`);
      lines.push(`${key} ${value}`);
    }

    return lines.join('\n');
  }

  /**
   * Snapshot for health checks and dashboards.
   */
  snapshot(): Record<string, unknown> {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histogram_counts: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([k, v]) => [k, v.length])
      ),
    };
  }
}

// ─── Metric Catalogue ─────────────────────────────────────────────────────────

/**
 * All metric names emitted by the Boundary Context Organelle.
 * Reference: BOUNDARY_CONTEXT_ORGANELLE.md §9 (Observability)
 */
export const BOUNDARY_CONTEXT_METRICS = {
  // Counters
  CONTEXT_REGISTERED: 'boundary_context.context.registered',
  CONTEXT_DEPRECATED: 'boundary_context.context.deprecated',
  CONTEXT_RETIRED: 'boundary_context.context.retired',
  CONTEXT_MAP_DECLARED: 'boundary_context.context_map.declared',
  CONTEXT_MAP_REVOKED: 'boundary_context.context_map.revoked',
  CONTEXT_MAP_CASCADE_REVOKED: 'boundary_context.context_map.cascade_revoked',
  VIOLATION_REPORTED: 'boundary_context.violation.reported',
  REGISTRATION_REJECTED: 'boundary_context.registration.rejected',

  // Histograms
  REGISTRATION_DURATION_MS: 'boundary_context.registration.duration_ms',

  // Gauges (updated externally by a periodic job)
  ACTIVE_CONTEXT_COUNT: 'boundary_context.active_context.count',
  DEPRECATED_CONTEXT_COUNT: 'boundary_context.deprecated_context.count',
  ACTIVE_MAP_COUNT: 'boundary_context.active_map.count',
  VIOLATION_COUNT_LAST_24H: 'boundary_context.violation.count_last_24h',
} as const;

// ─── Structured Logger ────────────────────────────────────────────────────────

export interface BoundaryContextLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  organelle: 'ORG-TB-BOUNDARY_CONTEXT-v0.1.0';
  event: string;
  context_id?: string;
  map_id?: string;
  violation_id?: string;
  error_code?: string;
  duration_ms?: number;
  details?: Record<string, unknown>;
}

export class BoundaryContextLogger {
  constructor(private readonly output: (entry: BoundaryContextLogEntry) => void = console.log) {}

  info(event: string, details?: Partial<BoundaryContextLogEntry>): void {
    this.output({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      organelle: 'ORG-TB-BOUNDARY_CONTEXT-v0.1.0',
      event,
      ...details,
    });
  }

  warn(event: string, details?: Partial<BoundaryContextLogEntry>): void {
    this.output({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      organelle: 'ORG-TB-BOUNDARY_CONTEXT-v0.1.0',
      event,
      ...details,
    });
  }

  error(event: string, details?: Partial<BoundaryContextLogEntry>): void {
    this.output({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      organelle: 'ORG-TB-BOUNDARY_CONTEXT-v0.1.0',
      event,
      ...details,
    });
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  organelle: string;
  checked_at: string;
  checks: {
    storage_reachable: boolean;
    event_publisher_reachable: boolean;
    active_context_count: number;
    violation_rate_last_hour: number;
  };
}

export async function checkBoundaryContextHealth(
  storage: { findContextById: (id: string) => Promise<unknown> },
  eventPublisher: { publish: (type: string, payload: object) => Promise<void> },
  metrics: BoundaryContextPrometheusMetrics
): Promise<HealthStatus> {
  let storage_reachable = false;
  let event_publisher_reachable = false;

  try {
    await storage.findContextById('health-check-probe');
    storage_reachable = true;
  } catch {
    // storage unreachable
  }

  try {
    await eventPublisher.publish('HEALTH_CHECK', { probe: true });
    event_publisher_reachable = true;
  } catch {
    // event publisher unreachable
  }

  const snapshot = metrics.snapshot() as any;
  const active_context_count = snapshot.gauges?.['boundary_context.active_context.count'] ?? 0;
  const violation_rate_last_hour = snapshot.counters?.['boundary_context.violation.reported'] ?? 0;

  const status = !storage_reachable || !event_publisher_reachable
    ? 'unhealthy'
    : violation_rate_last_hour > 100
    ? 'degraded'
    : 'healthy';

  return {
    status,
    organelle: 'ORG-TB-BOUNDARY_CONTEXT-v0.1.0',
    checked_at: new Date().toISOString(),
    checks: {
      storage_reachable,
      event_publisher_reachable,
      active_context_count,
      violation_rate_last_hour,
    },
  };
}
