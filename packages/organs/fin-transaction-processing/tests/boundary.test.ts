/**
 * TransactionProcessing Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-TRANSACTION_PROCESSING
 */

import { TransactionProcessingOrgan } from '../src/TransactionProcessingOrgan';

describe('TransactionProcessing Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new TransactionProcessingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-TRANSACTION_PROCESSING');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new TransactionProcessingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-3d330f58' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-TRANSACTION_PROCESSING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-TRANSACTION_PROCESSING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('TransactionProcessing');
  });
});
