/**
 * LogAggregation Organ — Offline-First Tests
 * Organ ID: ORGX-IN-LOG_AGGREGATION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { LogAggregationOrgan } from '../src/LogAggregationOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('LogAggregation Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new LogAggregationOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-17014125' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-IN-LOG_AGGREGATION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new LogAggregationOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-IN-LOG_AGGREGATION',
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
