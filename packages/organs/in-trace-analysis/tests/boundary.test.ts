/**
 * TraceAnalysis Organ — Domain Boundary Tests
 * Organ ID: ORGX-IN-TRACE_ANALYSIS
 */

import { TraceAnalysisOrgan } from '../src/TraceAnalysisOrgan';

describe('TraceAnalysis Domain Boundary', () => {
  it('should enforce organ boundary for Instrumentation and Observability', () => {
    const organ = new TraceAnalysisOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IN-TRACE_ANALYSIS');
    expect(health.organId).toMatch(/^ORGX-IN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new TraceAnalysisOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-d4bea6ae' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IN-TRACE_ANALYSIS' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IN-TRACE_ANALYSIS');
    // Event should be scoped to this organ only
    expect(event.type).toContain('TraceAnalysis');
  });
});
