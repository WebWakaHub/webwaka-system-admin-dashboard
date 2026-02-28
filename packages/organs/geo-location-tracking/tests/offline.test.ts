/**
 * LocationTracking Organ — Offline-First Tests
 * Organ ID: ORGX-GEO-LOCATION_TRACKING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { LocationTrackingOrgan } from '../src/LocationTrackingOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('LocationTracking Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new LocationTrackingOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-a71b5b26' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-GEO-LOCATION_TRACKING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new LocationTrackingOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-GEO-LOCATION_TRACKING',
    });

    // Sync
    await organ.sync();
    const health = organ.getHealth();
    expect(health.offlineQueueSize).toBe(0);
  });

  it('should respect Nigeria-first timeout of 30s', () => {
    expect(NIGERIA_FIRST_CONFIG.timeout).toBe(30_000);
  });
});
