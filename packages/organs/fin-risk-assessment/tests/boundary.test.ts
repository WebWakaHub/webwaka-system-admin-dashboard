/**
 * RiskAssessment Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-RISK_ASSESSMENT
 */

import { RiskAssessmentOrgan } from '../src/RiskAssessmentOrgan';

describe('RiskAssessment Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new RiskAssessmentOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-RISK_ASSESSMENT');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new RiskAssessmentOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-373b2591' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-RISK_ASSESSMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-RISK_ASSESSMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('RiskAssessment');
  });
});
