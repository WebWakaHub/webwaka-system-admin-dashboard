/**
 * ContentDistribution Organ — Offline-First Tests
 * Organ ID: ORGX-MED-CONTENT_DISTRIBUTION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ContentDistributionOrgan } from '../src/ContentDistributionOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ContentDistribution Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ContentDistributionOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-1a1d71c9' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-MED-CONTENT_DISTRIBUTION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ContentDistributionOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-MED-CONTENT_DISTRIBUTION',
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
