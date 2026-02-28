/**
 * OperationsManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-ENT-OPERATIONS_MANAGEMENT
 */

import { OperationsManagementOrgan } from '../src/OperationsManagementOrgan';

describe('OperationsManagement Domain Boundary', () => {
  it('should enforce organ boundary for Enterprise Management', () => {
    const organ = new OperationsManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-ENT-OPERATIONS_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-ENT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new OperationsManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-2c6d418d' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-ENT-OPERATIONS_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-ENT-OPERATIONS_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('OperationsManagement');
  });
});
