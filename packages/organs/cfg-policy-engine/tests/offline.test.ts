/**
 * PolicyEngine Organ — Offline-First Tests
 * Organ ID: ORGX-CFG-POLICY_ENGINE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { PolicyEngineOrgan } from '../src/PolicyEngineOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('PolicyEngine Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new PolicyEngineOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-2fe54c92' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-CFG-POLICY_ENGINE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new PolicyEngineOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-CFG-POLICY_ENGINE',
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
