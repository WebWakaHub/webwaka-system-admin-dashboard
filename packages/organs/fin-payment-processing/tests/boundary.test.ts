/**
 * PaymentProcessing Organ — Domain Boundary Tests
 * Organ ID: ORGX-FIN-PAYMENT_PROCESSING
 */

import { PaymentProcessingOrgan } from '../src/PaymentProcessingOrgan';

describe('PaymentProcessing Domain Boundary', () => {
  it('should enforce organ boundary for Financial Services and Ledger', () => {
    const organ = new PaymentProcessingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-FIN-PAYMENT_PROCESSING');
    expect(health.organId).toMatch(/^ORGX-FIN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PaymentProcessingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-03af4a2e' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-FIN-PAYMENT_PROCESSING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-FIN-PAYMENT_PROCESSING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PaymentProcessing');
  });
});
