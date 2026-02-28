/**
 * Authorization Organ — Offline-First Tests
 * Organ ID: ORGX-IDA-AUTHORIZATION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { AuthorizationOrgan } from '../src/AuthorizationOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('Authorization Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new AuthorizationOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-80dae5e1' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-IDA-AUTHORIZATION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new AuthorizationOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-IDA-AUTHORIZATION',
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
