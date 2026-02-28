/**
 * WarehouseManagement Organ — Offline-First Tests
 * Organ ID: ORGX-LOG-WAREHOUSE_MANAGEMENT
 * Nigeria-First: Designed for unreliable network conditions
 */

import { WarehouseManagementOrgan } from '../src/WarehouseManagementOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('WarehouseManagement Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new WarehouseManagementOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-8128eb26' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-LOG-WAREHOUSE_MANAGEMENT',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new WarehouseManagementOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-LOG-WAREHOUSE_MANAGEMENT',
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
