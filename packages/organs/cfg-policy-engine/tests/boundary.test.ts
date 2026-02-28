/**
 * PolicyEngine Organ — Domain Boundary Tests
 * Organ ID: ORGX-CFG-POLICY_ENGINE
 */

import { PolicyEngineOrgan } from '../src/PolicyEngineOrgan';

describe('PolicyEngine Domain Boundary', () => {
  it('should enforce organ boundary for Configuration and Policy Management', () => {
    const organ = new PolicyEngineOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-CFG-POLICY_ENGINE');
    expect(health.organId).toMatch(/^ORGX-CFG/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PolicyEngineOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-2fe54c92' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-CFG-POLICY_ENGINE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-CFG-POLICY_ENGINE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PolicyEngine');
  });
});
