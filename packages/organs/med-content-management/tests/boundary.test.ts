/**
 * ContentManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-MED-CONTENT_MANAGEMENT
 */

import { ContentManagementOrgan } from '../src/ContentManagementOrgan';

describe('ContentManagement Domain Boundary', () => {
  it('should enforce organ boundary for Media and Content', () => {
    const organ = new ContentManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-MED-CONTENT_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-MED/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ContentManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-2e23bd2b' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-MED-CONTENT_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-MED-CONTENT_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ContentManagement');
  });
});
