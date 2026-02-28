/**
 * ApiGateway Organ — Offline-First Tests
 * Organ ID: ORGX-EXT-API_GATEWAY
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ApiGatewayOrgan } from '../src/ApiGatewayOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ApiGateway Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ApiGatewayOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-9ed8f7b4' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-EXT-API_GATEWAY',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ApiGatewayOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-EXT-API_GATEWAY',
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
