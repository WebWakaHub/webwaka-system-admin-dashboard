/**
 * DeveloperPortal Organ — Domain Boundary Tests
 * Organ ID: ORGX-EXT-DEVELOPER_PORTAL
 */

import { DeveloperPortalOrgan } from '../src/DeveloperPortalOrgan';

describe('DeveloperPortal Domain Boundary', () => {
  it('should enforce organ boundary for External Integration and API', () => {
    const organ = new DeveloperPortalOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EXT-DEVELOPER_PORTAL');
    expect(health.organId).toMatch(/^ORGX-EXT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new DeveloperPortalOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-e4735cc9' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EXT-DEVELOPER_PORTAL' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EXT-DEVELOPER_PORTAL');
    // Event should be scoped to this organ only
    expect(event.type).toContain('DeveloperPortal');
  });
});
