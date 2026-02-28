/**
 * ShoppingCart Organ — Offline-First Tests
 * Organ ID: ORGX-COM-SHOPPING_CART
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ShoppingCartOrgan } from '../src/ShoppingCartOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ShoppingCart Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ShoppingCartOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-dfe8b03d' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-COM-SHOPPING_CART',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ShoppingCartOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-COM-SHOPPING_CART',
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
