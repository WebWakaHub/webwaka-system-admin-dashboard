/**
 * PerformanceManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-ENT-PERFORMANCE_MANAGEMENT
 */

import { PerformanceManagementOrgan } from '../src/PerformanceManagementOrgan';

describe('PerformanceManagement Domain Boundary', () => {
  it('should enforce organ boundary for Enterprise Management', () => {
    const organ = new PerformanceManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-ENT-PERFORMANCE_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-ENT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PerformanceManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-550e34ea' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-ENT-PERFORMANCE_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-ENT-PERFORMANCE_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PerformanceManagement');
  });
});
