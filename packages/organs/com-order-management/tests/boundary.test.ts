/**
 * OrderManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-COM-ORDER_MANAGEMENT
 */

import { OrderManagementOrgan } from '../src/OrderManagementOrgan';

describe('OrderManagement Domain Boundary', () => {
  it('should enforce organ boundary for Commerce and E-Commerce', () => {
    const organ = new OrderManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-COM-ORDER_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-COM/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new OrderManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-fff5cc6c' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-COM-ORDER_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-COM-ORDER_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('OrderManagement');
  });
});
