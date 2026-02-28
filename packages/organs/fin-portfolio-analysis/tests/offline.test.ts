/**
 * PortfolioAnalysis Organ — Offline-First Tests
 * Organ ID: ORGX-FIN-PORTFOLIO_ANALYSIS
 * Nigeria-First: Designed for unreliable network conditions
 */

import { PortfolioAnalysisOrgan } from '../src/PortfolioAnalysisOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('PortfolioAnalysis Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new PortfolioAnalysisOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-352a822f' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-FIN-PORTFOLIO_ANALYSIS',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new PortfolioAnalysisOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-FIN-PORTFOLIO_ANALYSIS',
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
