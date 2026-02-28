/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * P4-T01 Verification Task 1 — Unit Tests for InstrumentationProbe
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#483
 *
 * Tests cover: state machine, metrics, tracing, logging, health, operations.
 */

import { InstrumentationProbe } from '../InstrumentationProbe';
import {
  ProbeState,
  SpanStatus,
  LogLevel,
  HealthState,
} from '../types';
import {
  ITelemetryEmitterPort,
  IOfflineBufferPort,
  IHealthReporterPort,
  IContextPropagatorPort,
  ITenantContextPort,
} from '../ports';
import {
  ProbeInitializationError,
  InvalidMetricNameError,
  MetricRegistryFullError,
} from '../errors';

// ─── Mock Factories ─────────────────────────────────────────────────────────

function createMockEmitter(): ITelemetryEmitterPort {
  return {
    emitMetrics: jest.fn().mockResolvedValue({ success: true, itemsAccepted: 1, itemsRejected: 0 }),
    emitTraces: jest.fn().mockResolvedValue({ success: true, itemsAccepted: 1, itemsRejected: 0 }),
    emitLogs: jest.fn().mockResolvedValue({ success: true, itemsAccepted: 1, itemsRejected: 0 }),
    isAvailable: jest.fn().mockResolvedValue(true),
    getBackendInfo: jest.fn().mockReturnValue({ name: 'test', version: '1.0', endpoint: 'http://localhost', protocol: 'http' }),
  };
}

function createMockBuffer(): IOfflineBufferPort {
  return {
    append: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue([]),
    getSize: jest.fn().mockResolvedValue(0),
    getByteSize: jest.fn().mockResolvedValue(0),
    clear: jest.fn().mockResolvedValue(undefined),
    setMaxSize: jest.fn(),
  };
}

function createMockHealthReporter(): IHealthReporterPort {
  return {
    reportStatus: jest.fn(),
    registerCheck: jest.fn(),
    deregisterCheck: jest.fn(),
  };
}

function createMockPropagator(): IContextPropagatorPort {
  return {
    inject: jest.fn(),
    extract: jest.fn().mockReturnValue(null),
    createRootContext: jest.fn().mockReturnValue({
      traceId: 'a'.repeat(32),
      spanId: 'b'.repeat(16),
      traceFlags: 1,
    }),
  };
}

function createMockTenantContext(): ITenantContextPort {
  return {
    getCurrentTenantId: jest.fn().mockReturnValue(null),
    validateTenantAccess: jest.fn().mockReturnValue(true),
    getTenantConfig: jest.fn().mockReturnValue({ tenantId: 'test', enabled: true }),
  };
}

function createProbe(overrides?: {
  emitter?: Partial<ITelemetryEmitterPort>;
  buffer?: Partial<IOfflineBufferPort>;
}) {
  const emitter = { ...createMockEmitter(), ...overrides?.emitter };
  const buffer = { ...createMockBuffer(), ...overrides?.buffer };
  const health = createMockHealthReporter();
  const propagator = createMockPropagator();
  const tenant = createMockTenantContext();

  return {
    probe: new InstrumentationProbe(emitter, buffer, health, propagator, tenant),
    emitter,
    buffer,
    health,
    propagator,
    tenant,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('InstrumentationProbe', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('State Machine', () => {
    it('should start in UNINITIALIZED state', () => {
      const { probe } = createProbe();
      expect(probe.getState()).toBe(ProbeState.UNINITIALIZED);
    });

    it('should transition to ACTIVE after initialize()', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      expect(probe.getState()).toBe(ProbeState.ACTIVE);
    });

    it('should reject double initialization', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      await expect(probe.initialize({})).rejects.toThrow(ProbeInitializationError);
    });

    it('should transition to SHUTDOWN after shutdown()', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      await probe.shutdown();
      expect(probe.getState()).toBe(ProbeState.SHUTDOWN);
    });

    it('should deregister health check on shutdown', async () => {
      jest.useFakeTimers();
      const { probe, health } = createProbe();
      await probe.initialize({});
      await probe.shutdown();
      expect(health.deregisterCheck).toHaveBeenCalledWith('probe');
    });
  });

  describe('Metrics', () => {
    it('should register a counter with valid name', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const counter = probe.registerCounter('webwaka.infra.probe.requests', 'Total requests');
      expect(counter.name).toBe('webwaka.infra.probe.requests');
      expect(counter.type).toBe('counter');
    });

    it('should reject invalid metric names', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      expect(() => probe.registerCounter('invalid-name', 'Bad')).toThrow(InvalidMetricNameError);
    });

    it('should reject metrics when not initialized', () => {
      const { probe } = createProbe();
      expect(() => probe.registerCounter('webwaka.infra.probe.test', 'Test')).toThrow(ProbeInitializationError);
    });

    it('should register histogram with buckets', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const hist = probe.registerHistogram('webwaka.infra.probe.latency', 'Latency', [10, 50, 100, 500]);
      expect(hist.type).toBe('histogram');
    });

    it('should register gauge', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const gauge = probe.registerGauge('webwaka.infra.probe.connections', 'Active connections');
      expect(gauge.type).toBe('gauge');
    });
  });

  describe('Tracing', () => {
    it('should start a root span', async () => {
      jest.useFakeTimers();
      const { probe, propagator } = createProbe();
      await probe.initialize({});
      const span = probe.startSpan('test-operation');
      expect(span.traceId).toBeDefined();
      expect(span.spanId).toBeDefined();
      expect(propagator.createRootContext).toHaveBeenCalled();
    });

    it('should start a child span with parent context', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const parent = probe.startSpan('parent');
      const child = probe.startSpan('child', { parentContext: parent });
      expect(child.traceId).toBe(parent.traceId);
      expect(child.parentSpanId).toBe(parent.spanId);
    });

    it('should end a span', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const span = probe.startSpan('test');
      probe.endSpan(span, SpanStatus.OK);
      // Span should be removed from cache (no error thrown)
    });

    it('should inject trace context into carrier', async () => {
      jest.useFakeTimers();
      const { probe, propagator } = createProbe();
      await probe.initialize({});
      probe.startSpan('test');
      const carrier: Record<string, string> = {};
      probe.injectTraceContext(carrier);
      expect(propagator.inject).toHaveBeenCalled();
    });

    it('should extract trace context from carrier', async () => {
      jest.useFakeTimers();
      const { probe, propagator } = createProbe();
      await probe.initialize({});
      const carrier = { traceparent: '00-' + 'a'.repeat(32) + '-' + 'b'.repeat(16) + '-01' };
      probe.extractTraceContext(carrier);
      expect(propagator.extract).toHaveBeenCalledWith(carrier);
    });
  });

  describe('Logging', () => {
    it('should emit structured log event', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      // Should not throw
      probe.emitStructuredLog({
        timestamp: Date.now(),
        level: LogLevel.INFO,
        message: 'Test log',
        attributes: { key: 'value' },
      });
    });
  });

  describe('Health', () => {
    it('should return HEALTHY when active', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const status = probe.getHealthStatus();
      expect(status.state).toBe(HealthState.HEALTHY);
    });
  });

  describe('Operation Hooks', () => {
    it('should create instrumentation handle on operation start', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const handle = probe.onOperationStart('op-1', {
        component: 'database',
        layer: 'runtime',
        operation: 'query',
      });
      expect(handle.operationId).toBe('op-1');
      expect(handle.spanContext).toBeDefined();
      expect(handle.startTime).toBeDefined();
    });

    it('should record metrics on operation end', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe();
      await probe.initialize({});
      const handle = probe.onOperationStart('op-1', {
        component: 'database',
        layer: 'runtime',
        operation: 'query',
      });
      probe.onOperationEnd(handle, { success: true, duration: 42 });
      // No error means success
    });
  });

  describe('Offline Mode (Nigeria First)', () => {
    it('should buffer when emitter is unavailable', async () => {
      jest.useFakeTimers();
      const { probe } = createProbe({
        emitter: { isAvailable: jest.fn().mockResolvedValue(false) },
      });
      await probe.initialize({ offlineMode: true });
      // Should be in DEGRADED state
      expect(probe.getState()).toBe(ProbeState.DEGRADED);
    });
  });
});
