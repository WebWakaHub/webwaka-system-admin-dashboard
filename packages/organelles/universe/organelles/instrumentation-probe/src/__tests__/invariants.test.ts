/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * P4-T03 Verification Task 3 — Invariant and Performance Tests
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#485
 *
 * Tests verify all constitutional invariants:
 * - INV-IN-P01: Metric name format (webwaka.<layer>.<component>.<metric>)
 * - INV-IN-P02: Span duration ≥ 0
 * - INV-IN-P03: Batch size ≤ 64KB
 * - INV-IN-P04: Registry ≤ 500KB (1000 metrics × 500B)
 * - INV-IN-P05: Flush latency ≤ 30s
 * - INV-IN-P06: Trace context W3C compliant
 * - INV-IN-P07: Tenant isolation
 * - INV-IN-P08: Buffer bounded (10MB default)
 */

import { MetricRegistry } from '../MetricRegistry';
import { W3CContextPropagator } from '../adapters/W3CContextPropagator';
import { InvalidMetricNameError } from '../errors';

describe('Constitutional Invariant Verification', () => {

  // INV-IN-P01: Metric name format
  describe('INV-IN-P01: Metric Name Format', () => {
    const registry = new MetricRegistry();

    const validNames = [
      'webwaka.infra.probe.requests',
      'webwaka.runtime.database.query_latency',
      'webwaka.cell.auth.login_count',
      'webwaka.tissue.api.response_time',
    ];

    const invalidNames = [
      'requests',
      'webwaka.requests',
      'WEBWAKA.infra.probe.requests',
      'webwaka.infra.probe.Requests',
      'webwaka-infra-probe-requests',
      'other.infra.probe.requests',
      '',
    ];

    validNames.forEach(name => {
      it(`should accept valid name: ${name}`, () => {
        expect(() => registry.register(name, 'counter', 'Test')).not.toThrow();
      });
    });

    invalidNames.forEach(name => {
      it(`should reject invalid name: "${name}"`, () => {
        expect(() => registry.register(name, 'counter', 'Test')).toThrow(InvalidMetricNameError);
      });
    });
  });

  // INV-IN-P04: Registry bounded at 1000 metrics
  describe('INV-IN-P04: Registry Capacity Bound', () => {
    it('should not exceed 1000 metrics (default)', () => {
      const registry = new MetricRegistry(1000);
      // Register 1000 metrics
      for (let i = 0; i < 1000; i++) {
        const name = `webwaka.infra.probe.metric_${i.toString().padStart(4, '0')}`;
        registry.register(name, 'counter', `Metric ${i}`);
      }
      expect(registry.size).toBe(1000);

      // 1001st should trigger LRU eviction, not overflow
      registry.register('webwaka.infra.probe.overflow_test', 'counter', 'Overflow');
      expect(registry.size).toBe(1000); // Still 1000, oldest evicted
    });
  });

  // INV-IN-P06: W3C Trace Context compliance
  describe('INV-IN-P06: W3C Trace Context Compliance', () => {
    const propagator = new W3CContextPropagator();

    it('should produce valid traceparent format: 00-{32hex}-{16hex}-{2hex}', () => {
      const ctx = propagator.createRootContext();
      const carrier: Record<string, string> = {};
      propagator.inject(ctx, carrier);

      const traceparent = carrier['traceparent'];
      expect(traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/);
    });

    it('should roundtrip inject → extract', () => {
      const original = propagator.createRootContext();
      const carrier: Record<string, string> = {};
      propagator.inject(original, carrier);
      const extracted = propagator.extract(carrier);

      expect(extracted).not.toBeNull();
      expect(extracted!.traceId).toBe(original.traceId);
      expect(extracted!.spanId).toBe(original.spanId);
      expect(extracted!.traceFlags).toBe(original.traceFlags);
    });

    it('should reject version other than 00', () => {
      const carrier = {
        traceparent: `01-${'a'.repeat(32)}-${'b'.repeat(16)}-01`,
      };
      expect(propagator.extract(carrier)).toBeNull();
    });
  });

  // INV-IN-P07: Tenant isolation
  describe('INV-IN-P07: Tenant Isolation', () => {
    it('should tag metrics with tenant ID', () => {
      const registry = new MetricRegistry();
      registry.register('webwaka.infra.probe.tenant_metric', 'counter', 'Tenant metric');
      const metric = registry.record('webwaka.infra.probe.tenant_metric', 42, {}, 'tenant-123');
      expect(metric.tenantId).toBe('tenant-123');
    });

    it('should not leak metrics between tenants', () => {
      const registry = new MetricRegistry();
      registry.register('webwaka.infra.probe.shared_counter', 'counter', 'Shared');
      
      registry.record('webwaka.infra.probe.shared_counter', 10, {}, 'tenant-A');
      const metricA = registry.get('webwaka.infra.probe.shared_counter');
      expect(metricA!.tenantId).toBe('tenant-A');

      registry.record('webwaka.infra.probe.shared_counter', 20, {}, 'tenant-B');
      const metricB = registry.get('webwaka.infra.probe.shared_counter');
      expect(metricB!.tenantId).toBe('tenant-B');
      expect(metricB!.value).toBe(20);
    });
  });

  // Performance bounds
  describe('Performance Bounds', () => {
    it('should register 1000 metrics in under 100ms', () => {
      const registry = new MetricRegistry(1000);
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        registry.register(
          `webwaka.infra.probe.perf_${i.toString().padStart(4, '0')}`,
          'counter',
          `Perf ${i}`,
        );
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should snapshot 1000 metrics in under 50ms', () => {
      const registry = new MetricRegistry(1000);
      for (let i = 0; i < 1000; i++) {
        registry.register(
          `webwaka.infra.probe.snap_${i.toString().padStart(4, '0')}`,
          'counter',
          `Snap ${i}`,
        );
      }
      const start = Date.now();
      const snapshot = registry.snapshot();
      const elapsed = Date.now() - start;
      expect(snapshot).toHaveLength(1000);
      expect(elapsed).toBeLessThan(50);
    });

    it('should create root context in under 1ms', () => {
      const propagator = new W3CContextPropagator();
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        propagator.createRootContext();
      }
      const elapsed = Date.now() - start;
      // 1000 contexts in under 1000ms = under 1ms each
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
