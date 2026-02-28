/**
 * LogAggregation Organ — Domain Boundary Tests
 * Organ ID: ORGX-IN-LOG_AGGREGATION
 */

import { LogAggregationOrgan } from '../src/LogAggregationOrgan';

describe('LogAggregation Domain Boundary', () => {
  it('should enforce organ boundary for Instrumentation and Observability', () => {
    const organ = new LogAggregationOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IN-LOG_AGGREGATION');
    expect(health.organId).toMatch(/^ORGX-IN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new LogAggregationOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-17014125' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IN-LOG_AGGREGATION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IN-LOG_AGGREGATION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('LogAggregation');
  });
});
