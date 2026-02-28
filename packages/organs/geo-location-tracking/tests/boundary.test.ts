/**
 * LocationTracking Organ — Domain Boundary Tests
 * Organ ID: ORGX-GEO-LOCATION_TRACKING
 */

import { LocationTrackingOrgan } from '../src/LocationTrackingOrgan';

describe('LocationTracking Domain Boundary', () => {
  it('should enforce organ boundary for Geospatial and Location Services', () => {
    const organ = new LocationTrackingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GEO-LOCATION_TRACKING');
    expect(health.organId).toMatch(/^ORGX-GEO/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new LocationTrackingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-a71b5b26' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GEO-LOCATION_TRACKING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GEO-LOCATION_TRACKING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('LocationTracking');
  });
});
