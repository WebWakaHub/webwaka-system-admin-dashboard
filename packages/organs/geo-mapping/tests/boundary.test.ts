/**
 * Mapping Organ — Domain Boundary Tests
 * Organ ID: ORGX-GEO-MAPPING
 */

import { MappingOrgan } from '../src/MappingOrgan';

describe('Mapping Domain Boundary', () => {
  it('should enforce organ boundary for Geospatial and Location Services', () => {
    const organ = new MappingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GEO-MAPPING');
    expect(health.organId).toMatch(/^ORGX-GEO/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new MappingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-85c28086' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GEO-MAPPING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GEO-MAPPING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('Mapping');
  });
});
