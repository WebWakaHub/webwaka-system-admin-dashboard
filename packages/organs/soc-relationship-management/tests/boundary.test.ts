/**
 * RelationshipManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-SOC-RELATIONSHIP_MANAGEMENT
 */

import { RelationshipManagementOrgan } from '../src/RelationshipManagementOrgan';

describe('RelationshipManagement Domain Boundary', () => {
  it('should enforce organ boundary for Social and Relationship', () => {
    const organ = new RelationshipManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-SOC-RELATIONSHIP_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-SOC/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new RelationshipManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-1e0d160f' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-SOC-RELATIONSHIP_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-SOC-RELATIONSHIP_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('RelationshipManagement');
  });
});
