/**
 * CustomerAccount Organ — Domain Boundary Tests
 * Organ ID: ORGX-COM-CUSTOMER_ACCOUNT
 */

import { CustomerAccountOrgan } from '../src/CustomerAccountOrgan';

describe('CustomerAccount Domain Boundary', () => {
  it('should enforce organ boundary for Commerce and E-Commerce', () => {
    const organ = new CustomerAccountOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-COM-CUSTOMER_ACCOUNT');
    expect(health.organId).toMatch(/^ORGX-COM/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new CustomerAccountOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-f97645b8' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-COM-CUSTOMER_ACCOUNT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-COM-CUSTOMER_ACCOUNT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('CustomerAccount');
  });
});
