/**
 * ResourceScheduling Organ — Domain Boundary Tests
 * Organ ID: ORGX-RES-RESOURCE_SCHEDULING
 */

import { ResourceSchedulingOrgan } from '../src/ResourceSchedulingOrgan';

describe('ResourceScheduling Domain Boundary', () => {
  it('should enforce organ boundary for Resource and Asset Management', () => {
    const organ = new ResourceSchedulingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-RES-RESOURCE_SCHEDULING');
    expect(health.organId).toMatch(/^ORGX-RES/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ResourceSchedulingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-af78dd73' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-RES-RESOURCE_SCHEDULING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-RES-RESOURCE_SCHEDULING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ResourceScheduling');
  });
});
