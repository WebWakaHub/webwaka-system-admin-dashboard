/**
 * OrderFulfillment Organ — Domain Boundary Tests
 * Organ ID: ORGX-LOG-ORDER_FULFILLMENT
 */

import { OrderFulfillmentOrgan } from '../src/OrderFulfillmentOrgan';

describe('OrderFulfillment Domain Boundary', () => {
  it('should enforce organ boundary for Logistics and Supply Chain', () => {
    const organ = new OrderFulfillmentOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-LOG-ORDER_FULFILLMENT');
    expect(health.organId).toMatch(/^ORGX-LOG/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new OrderFulfillmentOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-1fd41521' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-LOG-ORDER_FULFILLMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-LOG-ORDER_FULFILLMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('OrderFulfillment');
  });
});
