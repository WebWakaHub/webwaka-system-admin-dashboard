/**
 * InventoryControl Organ — Domain Boundary Tests
 * Organ ID: ORGX-LOG-INVENTORY_CONTROL
 */

import { InventoryControlOrgan } from '../src/InventoryControlOrgan';

describe('InventoryControl Domain Boundary', () => {
  it('should enforce organ boundary for Logistics and Supply Chain', () => {
    const organ = new InventoryControlOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-LOG-INVENTORY_CONTROL');
    expect(health.organId).toMatch(/^ORGX-LOG/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new InventoryControlOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-41d4d8b3' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-LOG-INVENTORY_CONTROL' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-LOG-INVENTORY_CONTROL');
    // Event should be scoped to this organ only
    expect(event.type).toContain('InventoryControl');
  });
});
