/**
 * CivicService Organ — Offline-First Tests
 * Organ ID: ORGX-GOV-CIVIC_SERVICE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { CivicServiceOrgan } from '../src/CivicServiceOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('CivicService Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new CivicServiceOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-b85d3fd7' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-GOV-CIVIC_SERVICE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new CivicServiceOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-GOV-CIVIC_SERVICE',
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
