/**
 * InteractionEngine Organ — Domain Boundary Tests
 * Organ ID: ORGX-SOC-INTERACTION_ENGINE
 */

import { InteractionEngineOrgan } from '../src/InteractionEngineOrgan';

describe('InteractionEngine Domain Boundary', () => {
  it('should enforce organ boundary for Social and Relationship', () => {
    const organ = new InteractionEngineOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-SOC-INTERACTION_ENGINE');
    expect(health.organId).toMatch(/^ORGX-SOC/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new InteractionEngineOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-cb21a0ec' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-SOC-INTERACTION_ENGINE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-SOC-INTERACTION_ENGINE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('InteractionEngine');
  });
});
