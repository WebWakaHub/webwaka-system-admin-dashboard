/**
 * RiskAssessment Organ — Offline-First Tests
 * Organ ID: ORGX-FIN-RISK_ASSESSMENT
 * Nigeria-First: Designed for unreliable network conditions
 */

import { RiskAssessmentOrgan } from '../src/RiskAssessmentOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('RiskAssessment Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new RiskAssessmentOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-373b2591' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-FIN-RISK_ASSESSMENT',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new RiskAssessmentOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-FIN-RISK_ASSESSMENT',
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
