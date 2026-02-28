/**
 * Geocoding Organ — Offline-First Tests
 * Organ ID: ORGX-GEO-GEOCODING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { GeocodingOrgan } from '../src/GeocodingOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('Geocoding Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new GeocodingOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-af2fffae' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-GEO-GEOCODING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new GeocodingOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-GEO-GEOCODING',
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
