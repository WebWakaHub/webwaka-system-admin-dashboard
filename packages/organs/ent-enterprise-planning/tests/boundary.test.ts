/**
 * EnterprisePlanning Organ — Domain Boundary Tests
 * Organ ID: ORGX-ENT-ENTERPRISE_PLANNING
 */

import { EnterprisePlanningOrgan } from '../src/EnterprisePlanningOrgan';

describe('EnterprisePlanning Domain Boundary', () => {
  it('should enforce organ boundary for Enterprise Management', () => {
    const organ = new EnterprisePlanningOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-ENT-ENTERPRISE_PLANNING');
    expect(health.organId).toMatch(/^ORGX-ENT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new EnterprisePlanningOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-0d1722ab' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-ENT-ENTERPRISE_PLANNING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-ENT-ENTERPRISE_PLANNING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('EnterprisePlanning');
  });
});
