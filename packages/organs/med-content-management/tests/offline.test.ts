/**
 * ContentManagement Organ — Offline-First Tests
 * Organ ID: ORGX-MED-CONTENT_MANAGEMENT
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ContentManagementOrgan } from '../src/ContentManagementOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ContentManagement Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ContentManagementOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-2e23bd2b' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-MED-CONTENT_MANAGEMENT',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ContentManagementOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-MED-CONTENT_MANAGEMENT',
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
