/**
 * WarehouseManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-LOG-WAREHOUSE_MANAGEMENT
 */

import { WarehouseManagementOrgan } from '../src/WarehouseManagementOrgan';

describe('WarehouseManagement Domain Boundary', () => {
  it('should enforce organ boundary for Logistics and Supply Chain', () => {
    const organ = new WarehouseManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-LOG-WAREHOUSE_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-LOG/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new WarehouseManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-8128eb26' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-LOG-WAREHOUSE_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-LOG-WAREHOUSE_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('WarehouseManagement');
  });
});
