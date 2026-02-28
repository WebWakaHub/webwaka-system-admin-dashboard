/**
 * AppStore Organ — Offline-First Tests
 * Organ ID: ORGX-EXT-APP_STORE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { AppStoreOrgan } from '../src/AppStoreOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('AppStore Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new AppStoreOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-7c7e5e6e' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-EXT-APP_STORE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new AppStoreOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-EXT-APP_STORE',
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
