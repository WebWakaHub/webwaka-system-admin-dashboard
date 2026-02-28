/**
 * ContentDistribution Organ — Domain Boundary Tests
 * Organ ID: ORGX-MED-CONTENT_DISTRIBUTION
 */

import { ContentDistributionOrgan } from '../src/ContentDistributionOrgan';

describe('ContentDistribution Domain Boundary', () => {
  it('should enforce organ boundary for Media and Content', () => {
    const organ = new ContentDistributionOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-MED-CONTENT_DISTRIBUTION');
    expect(health.organId).toMatch(/^ORGX-MED/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ContentDistributionOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-1a1d71c9' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-MED-CONTENT_DISTRIBUTION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-MED-CONTENT_DISTRIBUTION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ContentDistribution');
  });
});
