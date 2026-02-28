/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * Core Type Definitions
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#479 (P3-T01)
 */

// ─── Probe State Machine ────────────────────────────────────────────────────

export enum ProbeState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  DRAINING = 'DRAINING',
  SHUTDOWN = 'SHUTDOWN',
}

// ─── Configuration ──────────────────────────────────────────────────────────

export interface ProbeConfig {
  /** Interval between telemetry emissions in milliseconds (default: 10000) */
  emissionInterval: number;
  /** Maximum offline buffer size in bytes (default: 10MB) */
  bufferMaxSize: number;
  /** Health check interval in milliseconds (default: 30000) */
  healthCheckInterval: number;
  /** Enable offline-first mode (default: true per Nigeria First doctrine) */
  offlineMode: boolean;
  /** Enable multi-tenant isolation (default: false) */
  tenantMode: boolean;
  /** Maximum number of registered metrics (default: 1000) */
  maxMetrics: number;
  /** Maximum span context cache size (default: 100) */
  maxSpanCache: number;
  /** Emission queue capacity (default: 1000) */
  emissionQueueCapacity: number;
}

export const DEFAULT_PROBE_CONFIG: ProbeConfig = {
  emissionInterval: 10_000,
  bufferMaxSize: 10 * 1024 * 1024, // 10MB
  healthCheckInterval: 30_000,
  offlineMode: true,
  tenantMode: false,
  maxMetrics: 1000,
  maxSpanCache: 100,
  emissionQueueCapacity: 1000,
};

// ─── Metrics ────────────────────────────────────────────────────────────────

export interface CounterHandle {
  readonly name: string;
  readonly type: 'counter';
  increment(value?: number, labels?: Record<string, string>): void;
}

export interface HistogramHandle {
  readonly name: string;
  readonly type: 'histogram';
  observe(value: number, labels?: Record<string, string>): void;
}

export interface GaugeHandle {
  readonly name: string;
  readonly type: 'gauge';
  set(value: number, labels?: Record<string, string>): void;
  increment(value?: number): void;
  decrement(value?: number): void;
}

export interface MetricEntry {
  name: string;
  type: 'counter' | 'histogram' | 'gauge';
  value: number;
  labels: Record<string, string>;
  timestamp: number;
  tenantId?: string;
}

export interface MetricBatch {
  metrics: MetricEntry[];
  timestamp: number;
  tenantId?: string;
}

// ─── Tracing ────────────────────────────────────────────────────────────────

export interface SpanContext {
  traceId: string;   // 128-bit hex string (32 chars)
  spanId: string;    // 64-bit hex string (16 chars)
  parentSpanId?: string;
  traceFlags: number;
  traceState?: string;
}

export interface SpanOptions {
  parentContext?: SpanContext;
  propagate?: boolean;
  attributes?: Record<string, string | number | boolean>;
}

export enum SpanStatus {
  OK = 'OK',
  ERROR = 'ERROR',
  UNSET = 'UNSET',
}

export interface SpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime: number;
  status: SpanStatus;
  attributes: Record<string, string | number | boolean>;
  tenantId?: string;
}

// ─── Logging ────────────────────────────────────────────────────────────────

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface StructuredLogEvent {
  timestamp: number;
  level: LogLevel;
  message: string;
  attributes: Record<string, string | number | boolean>;
  tenantId?: string;
  correlationId?: string;
}

// ─── Health ─────────────────────────────────────────────────────────────────

export enum HealthState {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
}

export interface CheckResult {
  name: string;
  state: HealthState;
  message?: string;
  duration: number;
}

export interface HealthStatus {
  state: HealthState;
  checks: CheckResult[];
  lastUpdated: number;
  uptime: number;
}

// ─── Operations ─────────────────────────────────────────────────────────────

export interface OperationMetadata {
  component: string;
  layer: string;
  operation: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface OperationResult {
  success: boolean;
  duration: number;
  error?: string;
}

export interface InstrumentationHandle {
  operationId: string;
  spanContext: SpanContext;
  startTime: number;
  metadata: OperationMetadata;
}

// ─── Emission ───────────────────────────────────────────────────────────────

export interface EmissionResult {
  success: boolean;
  itemsAccepted: number;
  itemsRejected: number;
  error?: string;
}

export interface BackendInfo {
  name: string;
  version: string;
  endpoint: string;
  protocol: string;
}

// ─── Offline Buffer ─────────────────────────────────────────────────────────

export type BufferEntryType = 'metric' | 'trace' | 'log';

export interface BufferEntry {
  type: BufferEntryType;
  payload: MetricBatch | SpanData[] | StructuredLogEvent[];
  timestamp: number;
  tenantId?: string;
  retryCount: number;
}

// ─── Tenant ─────────────────────────────────────────────────────────────────

export interface TenantProbeConfig {
  tenantId: string;
  emissionInterval?: number;
  bufferMaxSize?: number;
  enabled: boolean;
}

// ─── Emission Queue ─────────────────────────────────────────────────────────

export type EmissionQueueEntry = {
  type: BufferEntryType;
  data: MetricEntry | SpanData | StructuredLogEvent;
  timestamp: number;
  tenantId?: string;
};
