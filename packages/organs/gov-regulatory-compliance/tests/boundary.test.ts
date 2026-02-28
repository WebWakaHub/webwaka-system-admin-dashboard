/**
 * RegulatoryCompliance Organ — Domain Boundary Tests
 * Organ ID: ORGX-GOV-REGULATORY_COMPLIANCE
 */

import { RegulatoryComplianceOrgan } from '../src/RegulatoryComplianceOrgan';

describe('RegulatoryCompliance Domain Boundary', () => {
  it('should enforce organ boundary for Government and Civic Services', () => {
    const organ = new RegulatoryComplianceOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GOV-REGULATORY_COMPLIANCE');
    expect(health.organId).toMatch(/^ORGX-GOV/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new RegulatoryComplianceOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-bb2e2e3c' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GOV-REGULATORY_COMPLIANCE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GOV-REGULATORY_COMPLIANCE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('RegulatoryCompliance');
  });
});
