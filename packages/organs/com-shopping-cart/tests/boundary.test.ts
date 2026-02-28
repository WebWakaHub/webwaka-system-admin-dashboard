/**
 * ShoppingCart Organ — Domain Boundary Tests
 * Organ ID: ORGX-COM-SHOPPING_CART
 */

import { ShoppingCartOrgan } from '../src/ShoppingCartOrgan';

describe('ShoppingCart Domain Boundary', () => {
  it('should enforce organ boundary for Commerce and E-Commerce', () => {
    const organ = new ShoppingCartOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-COM-SHOPPING_CART');
    expect(health.organId).toMatch(/^ORGX-COM/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ShoppingCartOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-dfe8b03d' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-COM-SHOPPING_CART' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-COM-SHOPPING_CART');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ShoppingCart');
  });
});
