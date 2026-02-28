/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * P4-T02 Verification Task 2 — Integration Tests for Adapters
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#484
 *
 * Tests cover: W3CContextPropagator, FlushOrchestrator, MetricRegistry.
 */

import { W3CContextPropagator } from '../adapters/W3CContextPropagator';
import { FlushOrchestrator, NetworkTier } from '../FlushOrchestrator';
import { MetricRegistry } from '../MetricRegistry';
import { ITelemetryEmitterPort, IOfflineBufferPort } from '../ports';
import { InvalidMetricNameError } from '../errors';

// ─── W3C Context Propagator Tests ───────────────────────────────────────────

describe('W3CContextPropagator', () => {
  let propagator: W3CContextPropagator;

  beforeEach(() => {
    propagator = new W3CContextPropagator();
  });

  describe('inject', () => {
    it('should inject traceparent header in W3C format', () => {
      const carrier: Record<string, string> = {};
      propagator.inject(
        { traceId: 'a'.repeat(32), spanId: 'b'.repeat(16), traceFlags: 1 },
        carrier,
      );
      expect(carrier['traceparent']).toBe(`00-${'a'.repeat(32)}-${'b'.repeat(16)}-01`);
    });

    it('should inject tracestate when present', () => {
      const carrier: Record<string, string> = {};
      propagator.inject(
        { traceId: 'a'.repeat(32), spanId: 'b'.repeat(16), traceFlags: 1, traceState: 'vendor=value' },
        carrier,
      );
      expect(carrier['tracestate']).toBe('vendor=value');
    });

    it('should throw on missing traceId', () => {
      const carrier: Record<string, string> = {};
      expect(() =>
        propagator.inject({ traceId: '', spanId: 'b'.repeat(16), traceFlags: 1 }, carrier),
      ).toThrow();
    });
  });

  describe('extract', () => {
    it('should extract valid traceparent', () => {
      const carrier = {
        traceparent: `00-${'a'.repeat(32)}-${'b'.repeat(16)}-01`,
      };
      const ctx = propagator.extract(carrier);
      expect(ctx).not.toBeNull();
      expect(ctx!.traceId).toBe('a'.repeat(32));
      expect(ctx!.spanId).toBe('b'.repeat(16));
      expect(ctx!.traceFlags).toBe(1);
    });

    it('should return null for missing traceparent', () => {
      expect(propagator.extract({})).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(propagator.extract({ traceparent: 'invalid' })).toBeNull();
    });

    it('should return null for all-zero traceId', () => {
      const carrier = {
        traceparent: `00-${'0'.repeat(32)}-${'b'.repeat(16)}-01`,
      };
      expect(propagator.extract(carrier)).toBeNull();
    });

    it('should return null for all-zero spanId', () => {
      const carrier = {
        traceparent: `00-${'a'.repeat(32)}-${'0'.repeat(16)}-01`,
      };
      expect(propagator.extract(carrier)).toBeNull();
    });
  });

  describe('createRootContext', () => {
    it('should create a valid root context', () => {
      const ctx = propagator.createRootContext();
      expect(ctx.traceId).toHaveLength(32);
      expect(ctx.spanId).toHaveLength(16);
      expect(ctx.traceFlags).toBe(1);
    });

    it('should create unique trace IDs', () => {
      const ctx1 = propagator.createRootContext();
      const ctx2 = propagator.createRootContext();
      expect(ctx1.traceId).not.toBe(ctx2.traceId);
    });
  });
});

// ─── MetricRegistry Tests ───────────────────────────────────────────────────

describe('MetricRegistry', () => {
  let registry: MetricRegistry;

  beforeEach(() => {
    registry = new MetricRegistry(100);
  });

  it('should register a metric with valid name', () => {
    registry.register('webwaka.infra.probe.requests', 'counter', 'Total requests');
    expect(registry.has('webwaka.infra.probe.requests')).toBe(true);
    expect(registry.size).toBe(1);
  });

  it('should reject invalid metric names', () => {
    expect(() => registry.register('bad-name', 'counter', 'Bad')).toThrow(InvalidMetricNameError);
  });

  it('should be idempotent on duplicate registration', () => {
    registry.register('webwaka.infra.probe.requests', 'counter', 'Total requests');
    registry.register('webwaka.infra.probe.requests', 'counter', 'Total requests');
    expect(registry.size).toBe(1);
  });

  it('should record and retrieve metric values', () => {
    registry.register('webwaka.infra.probe.latency', 'histogram', 'Latency');
    registry.record('webwaka.infra.probe.latency', 42);
    const metric = registry.get('webwaka.infra.probe.latency');
    expect(metric).toBeDefined();
    expect(metric!.value).toBe(42);
  });

  it('should take a snapshot of all metrics', () => {
    registry.register('webwaka.infra.probe.a', 'counter', 'A');
    registry.register('webwaka.infra.probe.b', 'gauge', 'B');
    registry.record('webwaka.infra.probe.a', 10);
    registry.record('webwaka.infra.probe.b', 20);
    const snapshot = registry.snapshot();
    expect(snapshot).toHaveLength(2);
  });

  it('should evict LRU when full', () => {
    const smallRegistry = new MetricRegistry(3);
    smallRegistry.register('webwaka.infra.probe.a', 'counter', 'A');
    smallRegistry.register('webwaka.infra.probe.b', 'counter', 'B');
    smallRegistry.register('webwaka.infra.probe.c', 'counter', 'C');
    // Access 'b' and 'c' to make 'a' the LRU
    smallRegistry.get('webwaka.infra.probe.b');
    smallRegistry.get('webwaka.infra.probe.c');
    // Adding 'd' should evict 'a'
    smallRegistry.register('webwaka.infra.probe.d', 'counter', 'D');
    expect(smallRegistry.has('webwaka.infra.probe.a')).toBe(false);
    expect(smallRegistry.has('webwaka.infra.probe.d')).toBe(true);
  });

  it('should unregister a metric', () => {
    registry.register('webwaka.infra.probe.temp', 'gauge', 'Temp');
    expect(registry.unregister('webwaka.infra.probe.temp')).toBe(true);
    expect(registry.has('webwaka.infra.probe.temp')).toBe(false);
  });

  it('should clear all metrics', () => {
    registry.register('webwaka.infra.probe.a', 'counter', 'A');
    registry.register('webwaka.infra.probe.b', 'counter', 'B');
    registry.clear();
    expect(registry.size).toBe(0);
  });
});

// ─── FlushOrchestrator Tests ────────────────────────────────────────────────

describe('FlushOrchestrator', () => {
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

  it('should detect broadband network tier when emitter is available', async () => {
    const emitter = createMockEmitter();
    const buffer = createMockBuffer();
    const orchestrator = new FlushOrchestrator(emitter, buffer);
    const tier = await orchestrator.detectNetworkTier();
    expect(tier).toBe(NetworkTier.BROADBAND);
  });

  it('should detect offline tier when emitter is unavailable', async () => {
    const emitter = createMockEmitter();
    emitter.isAvailable = jest.fn().mockResolvedValue(false);
    const buffer = createMockBuffer();
    const orchestrator = new FlushOrchestrator(emitter, buffer);
    const tier = await orchestrator.detectNetworkTier();
    expect(tier).toBe(NetworkTier.OFFLINE);
  });

  it('should flush empty queue successfully', async () => {
    const emitter = createMockEmitter();
    const buffer = createMockBuffer();
    const orchestrator = new FlushOrchestrator(emitter, buffer);
    const result = await orchestrator.flush([]);
    expect(result).toBe(true);
  });

  it('should buffer entries when offline', async () => {
    const emitter = createMockEmitter();
    emitter.isAvailable = jest.fn().mockResolvedValue(false);
    const buffer = createMockBuffer();
    const orchestrator = new FlushOrchestrator(emitter, buffer);
    const result = await orchestrator.flush([
      { type: 'metric', data: { name: 'test', value: 1 }, timestamp: Date.now() },
    ]);
    expect(result).toBe(true);
    expect(buffer.append).toHaveBeenCalled();
  });

  it('should return correct batch size for broadband', async () => {
    const emitter = createMockEmitter();
    const buffer = createMockBuffer();
    const orchestrator = new FlushOrchestrator(emitter, buffer);
    await orchestrator.detectNetworkTier();
    expect(orchestrator.getEffectiveBatchSize()).toBe(256 * 1024);
  });
});
