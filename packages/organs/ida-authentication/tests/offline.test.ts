/**
 * Authentication Organ — Offline-First Tests
 * Organ ID: ORGX-IDA-AUTHENTICATION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { AuthenticationOrgan } from '../src/AuthenticationOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('Authentication Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new AuthenticationOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-c314b632' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-IDA-AUTHENTICATION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new AuthenticationOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-IDA-AUTHENTICATION',
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
