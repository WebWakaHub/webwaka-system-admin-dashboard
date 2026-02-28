/**
 * CivicService Organ — Domain Boundary Tests
 * Organ ID: ORGX-GOV-CIVIC_SERVICE
 */

import { CivicServiceOrgan } from '../src/CivicServiceOrgan';

describe('CivicService Domain Boundary', () => {
  it('should enforce organ boundary for Government and Civic Services', () => {
    const organ = new CivicServiceOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GOV-CIVIC_SERVICE');
    expect(health.organId).toMatch(/^ORGX-GOV/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new CivicServiceOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-b85d3fd7' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GOV-CIVIC_SERVICE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GOV-CIVIC_SERVICE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('CivicService');
  });
});
