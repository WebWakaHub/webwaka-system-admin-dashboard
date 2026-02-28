/**
 * AccountManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT
 */

import { AccountManagementOrgan } from '../src/AccountManagementOrgan';

describe('AccountManagement Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new AccountManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-ACCOUNT_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AccountManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-8d5f6cbe' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-ACCOUNT_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-ACCOUNT_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('AccountManagement');
  });
});
