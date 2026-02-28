/**
 * FeatureFlagging Organ — Offline-First Tests
 * Organ ID: ORGX-CFG-FEATURE_FLAGGING
 * Nigeria-First: Designed for unreliable network conditions
 */

import { FeatureFlaggingOrgan } from '../src/FeatureFlaggingOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('FeatureFlagging Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new FeatureFlaggingOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-10199205' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-CFG-FEATURE_FLAGGING',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new FeatureFlaggingOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-CFG-FEATURE_FLAGGING',
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
