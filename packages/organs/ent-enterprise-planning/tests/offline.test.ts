/**
 * EnterprisePlanning Organ — Offline-First Tests
 * Organ ID: ORGX-ENT-ENTERPRISE_PLANNING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { EnterprisePlanningOrgan } from '../src/EnterprisePlanningOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('EnterprisePlanning Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new EnterprisePlanningOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-0d1722ab' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-ENT-ENTERPRISE_PLANNING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new EnterprisePlanningOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-ENT-ENTERPRISE_PLANNING',
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
