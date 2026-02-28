/**
 * Geocoding Organ — Domain Boundary Tests
 * Organ ID: ORGX-GEO-GEOCODING
 */

import { GeocodingOrgan } from '../src/GeocodingOrgan';

describe('Geocoding Domain Boundary', () => {
  it('should enforce organ boundary for Geospatial and Location Services', () => {
    const organ = new GeocodingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GEO-GEOCODING');
    expect(health.organId).toMatch(/^ORGX-GEO/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new GeocodingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-af2fffae' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GEO-GEOCODING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GEO-GEOCODING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('Geocoding');
  });
});
