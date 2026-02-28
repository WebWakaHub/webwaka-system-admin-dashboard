/**
 * HealthRecords Organ — Offline-First Tests
 * Organ ID: ORGX-HLT-HEALTH_RECORDS
 * Nigeria-First: Designed for unreliable network conditions
 */

import { HealthRecordsOrgan } from '../src/HealthRecordsOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('HealthRecords Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new HealthRecordsOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-612de931' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-HLT-HEALTH_RECORDS',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new HealthRecordsOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-HLT-HEALTH_RECORDS',
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
