/**
 * PublicRecords Organ — Offline-First Tests
 * Organ ID: ORGX-GOV-PUBLIC_RECORDS
 * Nigeria-First: Designed for unreliable network conditions
 */

import { PublicRecordsOrgan } from '../src/PublicRecordsOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('PublicRecords Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new PublicRecordsOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-30848530' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-GOV-PUBLIC_RECORDS',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new PublicRecordsOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-GOV-PUBLIC_RECORDS',
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
