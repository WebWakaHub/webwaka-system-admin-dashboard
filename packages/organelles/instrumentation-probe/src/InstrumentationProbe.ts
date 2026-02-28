/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * Core InstrumentationProbe Implementation
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#479 (P3-T01)
 *
 * Implements IInstrumentationProbePort (inbound port).
 * Depends on outbound ports: ITelemetryEmitterPort, IOfflineBufferPort,
 * IHealthReporterPort, IContextPropagatorPort, ITenantContextPort.
 */

import {
  ProbeState,
  ProbeConfig,
  DEFAULT_PROBE_CONFIG,
  CounterHandle,
  HistogramHandle,
  GaugeHandle,
  SpanContext,
  SpanOptions,
  SpanStatus,
  SpanData,
  StructuredLogEvent,
  HealthStatus,
  HealthState,
  OperationMetadata,
  OperationResult,
  InstrumentationHandle,
  MetricEntry,
  MetricBatch,
  EmissionQueueEntry,
} from './types';

import {
  IInstrumentationProbePort,
  ITelemetryEmitterPort,
  IOfflineBufferPort,
  IHealthReporterPort,
  IContextPropagatorPort,
  ITenantContextPort,
} from './ports';

import {
  ProbeInitializationError,
  InvalidMetricNameError,
  MetricRegistryFullError,
  InvalidStateTransitionError,
} from './errors';

// ─── Valid State Transitions (from P1-T01 State Machine Design) ─────────────

const VALID_TRANSITIONS: Record<ProbeState, ProbeState[]> = {
  [ProbeState.UNINITIALIZED]: [ProbeState.INITIALIZING],
  [ProbeState.INITIALIZING]: [ProbeState.ACTIVE, ProbeState.SHUTDOWN],
  [ProbeState.ACTIVE]: [ProbeState.DEGRADED, ProbeState.DRAINING, ProbeState.SHUTDOWN],
  [ProbeState.DEGRADED]: [ProbeState.ACTIVE, ProbeState.DRAINING, ProbeState.SHUTDOWN],
  [ProbeState.DRAINING]: [ProbeState.SHUTDOWN],
  [ProbeState.SHUTDOWN]: [],
};

const METRIC_NAME_PATTERN = /^webwaka\.[a-z]+\.[a-z_]+\.[a-z_.]+$/;

export class InstrumentationProbe implements IInstrumentationProbePort {
  private state: ProbeState = ProbeState.UNINITIALIZED;
  private config: ProbeConfig = { ...DEFAULT_PROBE_CONFIG };
  private readonly startTime: number = Date.now();

  // Registries (bounded per INV-IN-P04)
  private readonly metricRegistry = new Map<string, MetricEntry>();
  private readonly spanCache = new Map<string, SpanData>();
  private readonly emissionQueue: EmissionQueueEntry[] = [];

  // Flush timer
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly emitter: ITelemetryEmitterPort,
    private readonly buffer: IOfflineBufferPort,
    private readonly healthReporter: IHealthReporterPort,
    private readonly propagator: IContextPropagatorPort,
    private readonly tenantContext: ITenantContextPort,
  ) {}

  // ─── State Machine ──────────────────────────────────────────────────────

  private transitionTo(newState: ProbeState): void {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed.includes(newState)) {
      throw new InvalidStateTransitionError(this.state, newState);
    }
    this.state = newState;
  }

  private assertActive(): void {
    if (this.state !== ProbeState.ACTIVE && this.state !== ProbeState.DEGRADED) {
      throw new ProbeInitializationError(
        `Probe is in ${this.state} state. Must be ACTIVE or DEGRADED.`,
      );
    }
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  async initialize(config: Partial<ProbeConfig>): Promise<void> {
    if (this.state !== ProbeState.UNINITIALIZED) {
      throw new ProbeInitializationError('Probe already initialized');
    }

    this.transitionTo(ProbeState.INITIALIZING);
    this.config = { ...DEFAULT_PROBE_CONFIG, ...config };

    try {
      // Check if emitter backend is available
      const available = await this.emitter.isAvailable();
      if (available) {
        this.transitionTo(ProbeState.ACTIVE);
      } else if (this.config.offlineMode) {
        // Nigeria First: degrade gracefully when offline
        this.transitionTo(ProbeState.ACTIVE);
        // Immediately check if we should go to DEGRADED
        this.transitionTo(ProbeState.DEGRADED);
      } else {
        throw new ProbeInitializationError('Emitter backend unavailable and offline mode disabled');
      }

      // Start periodic flush
      this.flushTimer = setInterval(() => this.flush(), this.config.emissionInterval);

      // Register health check
      this.healthReporter.registerCheck('probe', async () => ({
        name: 'probe',
        state: this.state === ProbeState.ACTIVE ? HealthState.HEALTHY : HealthState.DEGRADED,
        duration: 0,
      }));
    } catch (err) {
      this.transitionTo(ProbeState.SHUTDOWN);
      throw err;
    }
  }

  async shutdown(): Promise<void> {
    if (this.state === ProbeState.SHUTDOWN) return;

    // Drain remaining queue
    if (this.state === ProbeState.ACTIVE || this.state === ProbeState.DEGRADED) {
      this.transitionTo(ProbeState.DRAINING);
      await this.flush();
    }

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.healthReporter.deregisterCheck('probe');
    this.transitionTo(ProbeState.SHUTDOWN);
  }

  getState(): ProbeState {
    return this.state;
  }

  // ─── Metrics ────────────────────────────────────────────────────────────

  registerCounter(name: string, description: string, labels?: string[]): CounterHandle {
    this.assertActive();
    this.validateMetricName(name);
    this.ensureRegistryCapacity();

    const handle: CounterHandle = {
      name,
      type: 'counter',
      increment: (value = 1, labelValues?: Record<string, string>) => {
        this.recordMetric(name, 'counter', value, labelValues ?? {});
      },
    };

    return handle;
  }

  registerHistogram(name: string, description: string, buckets: number[]): HistogramHandle {
    this.assertActive();
    this.validateMetricName(name);
    this.ensureRegistryCapacity();

    const handle: HistogramHandle = {
      name,
      type: 'histogram',
      observe: (value: number, labelValues?: Record<string, string>) => {
        this.recordMetric(name, 'histogram', value, labelValues ?? {});
      },
    };

    return handle;
  }

  registerGauge(name: string, description: string): GaugeHandle {
    this.assertActive();
    this.validateMetricName(name);
    this.ensureRegistryCapacity();

    const handle: GaugeHandle = {
      name,
      type: 'gauge',
      set: (value: number, labelValues?: Record<string, string>) => {
        this.recordMetric(name, 'gauge', value, labelValues ?? {});
      },
      increment: (value = 1) => {
        const current = this.metricRegistry.get(name);
        const newValue = (current?.value ?? 0) + value;
        this.recordMetric(name, 'gauge', newValue, current?.labels ?? {});
      },
      decrement: (value = 1) => {
        const current = this.metricRegistry.get(name);
        const newValue = (current?.value ?? 0) - value;
        this.recordMetric(name, 'gauge', newValue, current?.labels ?? {});
      },
    };

    return handle;
  }

  private validateMetricName(name: string): void {
    if (!METRIC_NAME_PATTERN.test(name)) {
      throw new InvalidMetricNameError(name);
    }
  }

  private ensureRegistryCapacity(): void {
    if (this.metricRegistry.size >= this.config.maxMetrics) {
      throw new MetricRegistryFullError(this.config.maxMetrics);
    }
  }

  private recordMetric(
    name: string,
    type: 'counter' | 'histogram' | 'gauge',
    value: number,
    labels: Record<string, string>,
  ): void {
    const tenantId = this.config.tenantMode
      ? this.tenantContext.getCurrentTenantId() ?? undefined
      : undefined;

    const entry: MetricEntry = {
      name,
      type,
      value,
      labels,
      timestamp: Date.now(),
      tenantId,
    };

    this.metricRegistry.set(name, entry);
    this.enqueue({ type: 'metric', data: entry, timestamp: Date.now(), tenantId });
  }

  // ─── Tracing ────────────────────────────────────────────────────────────

  startSpan(name: string, options?: SpanOptions): SpanContext {
    this.assertActive();

    let context: SpanContext;
    if (options?.parentContext) {
      context = {
        traceId: options.parentContext.traceId,
        spanId: this.generateSpanId(),
        parentSpanId: options.parentContext.spanId,
        traceFlags: options.parentContext.traceFlags,
        traceState: options.parentContext.traceState,
      };
    } else {
      context = this.propagator.createRootContext();
    }

    const tenantId = this.config.tenantMode
      ? this.tenantContext.getCurrentTenantId() ?? undefined
      : undefined;

    const spanData: SpanData = {
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      name,
      startTime: Date.now(),
      endTime: 0,
      status: SpanStatus.UNSET,
      attributes: (options?.attributes ?? {}) as Record<string, string | number | boolean>,
      tenantId,
    };

    // Bounded cache (INV-IN-P04)
    if (this.spanCache.size >= this.config.maxSpanCache) {
      // Evict oldest span
      const oldest = this.spanCache.keys().next().value;
      if (oldest) this.spanCache.delete(oldest);
    }
    this.spanCache.set(context.spanId, spanData);

    return context;
  }

  endSpan(context: SpanContext, status: SpanStatus): void {
    const spanData = this.spanCache.get(context.spanId);
    if (!spanData) return; // Silently ignore unknown spans

    spanData.endTime = Date.now();
    spanData.status = status;

    this.spanCache.delete(context.spanId);
    this.enqueue({ type: 'trace', data: spanData, timestamp: Date.now(), tenantId: spanData.tenantId });
  }

  injectTraceContext(carrier: Record<string, string>): void {
    const activeSpan = this.getActiveSpan();
    if (activeSpan) {
      const context: SpanContext = {
        traceId: activeSpan.traceId,
        spanId: activeSpan.spanId,
        parentSpanId: activeSpan.parentSpanId,
        traceFlags: 1,
      };
      this.propagator.inject(context, carrier);
    }
  }

  extractTraceContext(carrier: Record<string, string>): SpanContext | null {
    return this.propagator.extract(carrier);
  }

  private getActiveSpan(): SpanData | undefined {
    // Return the most recently started span that hasn't ended
    let latest: SpanData | undefined;
    for (const span of this.spanCache.values()) {
      if (span.endTime === 0) {
        if (!latest || span.startTime > latest.startTime) {
          latest = span;
        }
      }
    }
    return latest;
  }

  private generateSpanId(): string {
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── Logging ────────────────────────────────────────────────────────────

  emitStructuredLog(event: StructuredLogEvent): void {
    // Fire-and-forget: must not block caller for more than 0.1ms
    const tenantId = this.config.tenantMode
      ? this.tenantContext.getCurrentTenantId() ?? undefined
      : undefined;

    const enrichedEvent: StructuredLogEvent = {
      ...event,
      tenantId: tenantId ?? event.tenantId,
    };

    this.enqueue({ type: 'log', data: enrichedEvent, timestamp: Date.now(), tenantId });
  }

  // ─── Health ─────────────────────────────────────────────────────────────

  getHealthStatus(): HealthStatus {
    return {
      state: this.state === ProbeState.ACTIVE ? HealthState.HEALTHY : HealthState.DEGRADED,
      checks: [],
      lastUpdated: Date.now(),
      uptime: Date.now() - this.startTime,
    };
  }

  // ─── Operation Hooks ────────────────────────────────────────────────────

  onOperationStart(operationId: string, metadata: OperationMetadata): InstrumentationHandle {
    this.assertActive();

    const spanContext = this.startSpan(
      `${metadata.component}.${metadata.operation}`,
      { attributes: metadata.attributes },
    );

    return {
      operationId,
      spanContext,
      startTime: Date.now(),
      metadata,
    };
  }

  onOperationEnd(handle: InstrumentationHandle, result: OperationResult): void {
    const duration = Date.now() - handle.startTime;

    // End the span
    this.endSpan(
      handle.spanContext,
      result.success ? SpanStatus.OK : SpanStatus.ERROR,
    );

    // Record duration metric
    const metricName = `webwaka.${handle.metadata.layer}.${handle.metadata.component}.duration`;
    if (METRIC_NAME_PATTERN.test(metricName)) {
      this.recordMetric(metricName, 'histogram', duration, {
        operation: handle.metadata.operation,
        success: String(result.success),
      });
    }
  }

  // ─── Emission Queue ─────────────────────────────────────────────────────

  private enqueue(entry: EmissionQueueEntry): void {
    // Bounded queue (INV-IN-P04)
    if (this.emissionQueue.length >= this.config.emissionQueueCapacity) {
      // Backpressure: drop oldest entry
      this.emissionQueue.shift();
    }
    this.emissionQueue.push(entry);
  }

  private async flush(): Promise<void> {
    if (this.emissionQueue.length === 0) return;

    const batch = this.emissionQueue.splice(0, this.emissionQueue.length);

    // Separate by type
    const metrics: MetricEntry[] = [];
    const traces: SpanData[] = [];
    const logs: StructuredLogEvent[] = [];

    for (const entry of batch) {
      switch (entry.type) {
        case 'metric':
          metrics.push(entry.data as MetricEntry);
          break;
        case 'trace':
          traces.push(entry.data as SpanData);
          break;
        case 'log':
          logs.push(entry.data as StructuredLogEvent);
          break;
      }
    }

    try {
      const available = await this.emitter.isAvailable();

      if (available) {
        // Emit to backend
        if (metrics.length > 0) {
          await this.emitter.emitMetrics({ metrics, timestamp: Date.now() });
        }
        if (traces.length > 0) {
          await this.emitter.emitTraces(traces);
        }
        if (logs.length > 0) {
          await this.emitter.emitLogs(logs);
        }

        // If we were degraded, try to recover
        if (this.state === ProbeState.DEGRADED) {
          this.transitionTo(ProbeState.ACTIVE);
        }
      } else {
        // Offline: buffer for later (Nigeria First / Offline First)
        await this.buffer.append({
          type: 'metric',
          payload: { metrics, timestamp: Date.now() },
          timestamp: Date.now(),
          retryCount: 0,
        });

        if (this.state === ProbeState.ACTIVE) {
          this.transitionTo(ProbeState.DEGRADED);
        }
      }
    } catch {
      // On emission failure, buffer everything
      await this.buffer.append({
        type: 'metric',
        payload: { metrics, timestamp: Date.now() },
        timestamp: Date.now(),
        retryCount: 0,
      });

      if (this.state === ProbeState.ACTIVE) {
        this.transitionTo(ProbeState.DEGRADED);
      }
    }
  }
}
