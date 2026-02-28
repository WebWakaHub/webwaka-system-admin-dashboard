/**
 * RegulatoryCompliance Organ — Offline-First Tests
 * Organ ID: ORGX-GOV-REGULATORY_COMPLIANCE
 * Nigeria-First: Designed for unreliable network conditions
 */

import { RegulatoryComplianceOrgan } from '../src/RegulatoryComplianceOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('RegulatoryCompliance Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new RegulatoryComplianceOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-bb2e2e3c' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-GOV-REGULATORY_COMPLIANCE',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new RegulatoryComplianceOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-GOV-REGULATORY_COMPLIANCE',
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
