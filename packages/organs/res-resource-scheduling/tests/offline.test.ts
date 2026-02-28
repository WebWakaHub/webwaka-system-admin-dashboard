/**
 * ResourceScheduling Organ — Offline-First Tests
 * Organ ID: ORGX-RES-RESOURCE_SCHEDULING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ResourceSchedulingOrgan } from '../src/ResourceSchedulingOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ResourceScheduling Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ResourceSchedulingOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-af78dd73' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-RES-RESOURCE_SCHEDULING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ResourceSchedulingOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-RES-RESOURCE_SCHEDULING',
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
