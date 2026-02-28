/**
 * PredictionEngine Organ — Offline-First Tests
 * Organ ID: ORGX-AI-PREDICTION_ENGINE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { PredictionEngineOrgan } from '../src/PredictionEngineOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('PredictionEngine Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new PredictionEngineOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-cd81f58e' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-AI-PREDICTION_ENGINE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new PredictionEngineOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-AI-PREDICTION_ENGINE',
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
