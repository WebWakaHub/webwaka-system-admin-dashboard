/**
 * MetricsCollection Organ — Offline-First Tests
 * Organ ID: ORGX-IN-METRICS_COLLECTION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { MetricsCollectionOrgan } from '../src/MetricsCollectionOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('MetricsCollection Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new MetricsCollectionOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-4eed02be' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-IN-METRICS_COLLECTION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new MetricsCollectionOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-IN-METRICS_COLLECTION',
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
