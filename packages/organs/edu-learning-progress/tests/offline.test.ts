/**
 * LearningProgress Organ — Offline-First Tests
 * Organ ID: ORGX-EDU-LEARNING_PROGRESS
 * Nigeria-First: Designed for unreliable network conditions
 */

import { LearningProgressOrgan } from '../src/LearningProgressOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('LearningProgress Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new LearningProgressOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-d5daacc9' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-EDU-LEARNING_PROGRESS',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new LearningProgressOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-EDU-LEARNING_PROGRESS',
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
