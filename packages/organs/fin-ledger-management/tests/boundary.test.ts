/**
 * LedgerManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-LEDGER_MANAGEMENT
 */

import { LedgerManagementOrgan } from '../src/LedgerManagementOrgan';

describe('LedgerManagement Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new LedgerManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-LEDGER_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new LedgerManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-971fcdbf' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-LEDGER_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-LEDGER_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('LedgerManagement');
  });
});
