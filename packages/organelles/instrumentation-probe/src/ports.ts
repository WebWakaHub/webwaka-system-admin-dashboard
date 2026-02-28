/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * Port Interface Definitions (Hexagonal Architecture)
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#479 (P3-T01)
 */

import {
  ProbeConfig,
  ProbeState,
  CounterHandle,
  HistogramHandle,
  GaugeHandle,
  SpanContext,
  SpanOptions,
  SpanStatus,
  StructuredLogEvent,
  HealthStatus,
  OperationMetadata,
  OperationResult,
  InstrumentationHandle,
  MetricBatch,
  SpanData,
  EmissionResult,
  BackendInfo,
  BufferEntry,
  CheckResult,
  TenantProbeConfig,
} from './types';

// ─── Inbound Port ───────────────────────────────────────────────────────────

/**
 * Primary interface for host components to interact with the Instrumentation Probe.
 * This is the INBOUND port — provided BY the probe TO the host.
 *
 * Contract Rules:
 * - initialize() MUST be called before any other method (except getState())
 * - registerCounter/Histogram/Gauge MUST reject names not matching the pattern
 * - startSpan MUST propagate W3C Trace Context when options.propagate is true
 * - emitStructuredLog MUST NOT block the caller for more than 0.1ms
 * - onOperationStart/End MUST NOT modify the host operation's return value
 */
export interface IInstrumentationProbePort {
  // Lifecycle
  initialize(config: Partial<ProbeConfig>): Promise<void>;
  shutdown(): Promise<void>;
  getState(): ProbeState;

  // Metrics
  registerCounter(name: string, description: string, labels?: string[]): CounterHandle;
  registerHistogram(name: string, description: string, buckets: number[]): HistogramHandle;
  registerGauge(name: string, description: string): GaugeHandle;

  // Tracing
  startSpan(name: string, options?: SpanOptions): SpanContext;
  endSpan(context: SpanContext, status: SpanStatus): void;
  injectTraceContext(carrier: Record<string, string>): void;
  extractTraceContext(carrier: Record<string, string>): SpanContext | null;

  // Logging
  emitStructuredLog(event: StructuredLogEvent): void;

  // Health
  getHealthStatus(): HealthStatus;

  // Lifecycle hooks
  onOperationStart(operationId: string, metadata: OperationMetadata): InstrumentationHandle;
  onOperationEnd(handle: InstrumentationHandle, result: OperationResult): void;
}

// ─── Outbound Ports ─────────────────────────────────────────────────────────

/**
 * Transports telemetry to the backend.
 * Provided by the HOST ENVIRONMENT, consumed by the probe.
 */
export interface ITelemetryEmitterPort {
  emitMetrics(batch: MetricBatch): Promise<EmissionResult>;
  emitTraces(spans: SpanData[]): Promise<EmissionResult>;
  emitLogs(events: StructuredLogEvent[]): Promise<EmissionResult>;
  isAvailable(): Promise<boolean>;
  getBackendInfo(): BackendInfo;
}

/**
 * Persistent offline storage for telemetry when backend is unreachable.
 * Provided by the HOST ENVIRONMENT (IndexedDB in browser, filesystem in Node.js).
 */
export interface IOfflineBufferPort {
  append(entry: BufferEntry): Promise<void>;
  flush(batchSize: number): Promise<BufferEntry[]>;
  getSize(): Promise<number>;
  getByteSize(): Promise<number>;
  clear(): Promise<void>;
  setMaxSize(bytes: number): void;
}

/**
 * Reports probe health status to the host's health check system.
 */
export interface IHealthReporterPort {
  reportStatus(status: HealthStatus): void;
  registerCheck(name: string, check: () => Promise<CheckResult>): void;
  deregisterCheck(name: string): void;
}

/**
 * Handles W3C Trace Context propagation across service boundaries.
 */
export interface IContextPropagatorPort {
  inject(context: SpanContext, carrier: Record<string, string>): void;
  extract(carrier: Record<string, string>): SpanContext | null;
  createRootContext(): SpanContext;
}

/**
 * Provides tenant isolation context for multi-tenant deployments.
 */
export interface ITenantContextPort {
  getCurrentTenantId(): string | null;
  validateTenantAccess(tenantId: string): boolean;
  getTenantConfig(tenantId: string): TenantProbeConfig;
}
