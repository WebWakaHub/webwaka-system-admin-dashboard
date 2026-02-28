/**
 * AssetTracking Organ — Domain Boundary Tests
 * Organ ID: ORGX-RES-ASSET_TRACKING
 */

import { AssetTrackingOrgan } from '../src/AssetTrackingOrgan';

describe('AssetTracking Domain Boundary', () => {
  it('should enforce organ boundary for Resource and Asset Management', () => {
    const organ = new AssetTrackingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-RES-ASSET_TRACKING');
    expect(health.organId).toMatch(/^ORGX-RES/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AssetTrackingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-07f38e68' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-RES-ASSET_TRACKING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-RES-ASSET_TRACKING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('AssetTracking');
  });
});
