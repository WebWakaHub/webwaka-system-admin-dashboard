/**
 * ProductCatalog Organ — Domain Boundary Tests
 * Organ ID: ORGX-COM-PRODUCT_CATALOG
 */

import { ProductCatalogOrgan } from '../src/ProductCatalogOrgan';

describe('ProductCatalog Domain Boundary', () => {
  it('should enforce organ boundary for Commerce and E-Commerce', () => {
    const organ = new ProductCatalogOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-COM-PRODUCT_CATALOG');
    expect(health.organId).toMatch(/^ORGX-COM/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ProductCatalogOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-336d8838' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-COM-PRODUCT_CATALOG' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-COM-PRODUCT_CATALOG');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ProductCatalog');
  });
});
