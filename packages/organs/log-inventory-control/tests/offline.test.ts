/**
 * InventoryControl Organ — Offline-First Tests
 * Organ ID: ORGX-LOG-INVENTORY_CONTROL
 * Nigeria-First: Designed for unreliable network conditions
 */

import { InventoryControlOrgan } from '../src/InventoryControlOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('InventoryControl Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new InventoryControlOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-41d4d8b3' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-LOG-INVENTORY_CONTROL',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new InventoryControlOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-LOG-INVENTORY_CONTROL',
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
