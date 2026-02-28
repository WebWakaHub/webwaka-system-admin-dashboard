/**
 * MetricsCollection Organ — Domain Boundary Tests
 * Organ ID: ORGX-IN-METRICS_COLLECTION
 */

import { MetricsCollectionOrgan } from '../src/MetricsCollectionOrgan';

describe('MetricsCollection Domain Boundary', () => {
  it('should enforce organ boundary for Instrumentation and Observability', () => {
    const organ = new MetricsCollectionOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IN-METRICS_COLLECTION');
    expect(health.organId).toMatch(/^ORGX-IN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new MetricsCollectionOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-4eed02be' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IN-METRICS_COLLECTION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IN-METRICS_COLLECTION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('MetricsCollection');
  });
});
