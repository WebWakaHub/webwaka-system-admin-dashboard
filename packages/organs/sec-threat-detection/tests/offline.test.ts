/**
 * ThreatDetection Organ — Offline-First Tests
 * Organ ID: ORGX-SEC-THREAT_DETECTION
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ThreatDetectionOrgan } from '../src/ThreatDetectionOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ThreatDetection Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ThreatDetectionOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-e006e378' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-SEC-THREAT_DETECTION',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ThreatDetectionOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-SEC-THREAT_DETECTION',
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
