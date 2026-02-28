/**
 * OperationsManagement Organ — Offline-First Tests
 * Organ ID: ORGX-ENT-OPERATIONS_MANAGEMENT
 * Nigeria-First: Designed for unreliable network conditions
 */

import { OperationsManagementOrgan } from '../src/OperationsManagementOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('OperationsManagement Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new OperationsManagementOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-2c6d418d' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-ENT-OPERATIONS_MANAGEMENT',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new OperationsManagementOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-ENT-OPERATIONS_MANAGEMENT',
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
