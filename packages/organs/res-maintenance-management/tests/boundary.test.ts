/**
 * MaintenanceManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-RES-MAINTENANCE_MANAGEMENT
 */

import { MaintenanceManagementOrgan } from '../src/MaintenanceManagementOrgan';

describe('MaintenanceManagement Domain Boundary', () => {
  it('should enforce organ boundary for Resource and Asset Management', () => {
    const organ = new MaintenanceManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-RES-MAINTENANCE_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-RES/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new MaintenanceManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-96a49fb2' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-RES-MAINTENANCE_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-RES-MAINTENANCE_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('MaintenanceManagement');
  });
});
