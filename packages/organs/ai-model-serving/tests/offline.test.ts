/**
 * ModelServing Organ — Offline-First Tests
 * Organ ID: ORGX-AI-MODEL_SERVING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ModelServingOrgan } from '../src/ModelServingOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ModelServing Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ModelServingOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-d971d254' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-AI-MODEL_SERVING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ModelServingOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-AI-MODEL_SERVING',
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
