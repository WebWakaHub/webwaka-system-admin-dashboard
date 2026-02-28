/**
 * TrainingPipeline Organ — Offline-First Tests
 * Organ ID: ORGX-AI-TRAINING_PIPELINE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { TrainingPipelineOrgan } from '../src/TrainingPipelineOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('TrainingPipeline Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new TrainingPipelineOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-80ffa819' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-AI-TRAINING_PIPELINE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new TrainingPipelineOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-AI-TRAINING_PIPELINE',
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
