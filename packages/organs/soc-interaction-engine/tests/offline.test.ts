/**
 * InteractionEngine Organ — Offline-First Tests
 * Organ ID: ORGX-SOC-INTERACTION_ENGINE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { InteractionEngineOrgan } from '../src/InteractionEngineOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('InteractionEngine Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new InteractionEngineOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-cb21a0ec' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-SOC-INTERACTION_ENGINE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new InteractionEngineOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-SOC-INTERACTION_ENGINE',
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
