/**
 * AccountManagement Organ — Offline-First Tests
 * Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT
 * Nigeria-First: Designed for unreliable network conditions
 */

import { AccountManagementOrgan } from '../src/AccountManagementOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('AccountManagement Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new AccountManagementOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-8d5f6cbe' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-FIN-ACCOUNT_MANAGEMENT',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new AccountManagementOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-FIN-ACCOUNT_MANAGEMENT',
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
