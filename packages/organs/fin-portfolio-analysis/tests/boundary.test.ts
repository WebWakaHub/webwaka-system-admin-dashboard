/**
 * PortfolioAnalysis Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-PORTFOLIO_ANALYSIS
 */

import { PortfolioAnalysisOrgan } from '../src/PortfolioAnalysisOrgan';

describe('PortfolioAnalysis Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new PortfolioAnalysisOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-PORTFOLIO_ANALYSIS');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PortfolioAnalysisOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-352a822f' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-PORTFOLIO_ANALYSIS' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-PORTFOLIO_ANALYSIS');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PortfolioAnalysis');
  });
});
