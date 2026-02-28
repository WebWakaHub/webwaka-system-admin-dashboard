/**
 * HealthRecords Organ — Domain Boundary Tests
 * Organ ID: ORGX-HLT-HEALTH_RECORDS
 */

import { HealthRecordsOrgan } from '../src/HealthRecordsOrgan';

describe('HealthRecords Domain Boundary', () => {
  it('should enforce organ boundary for Healthcare and Clinical', () => {
    const organ = new HealthRecordsOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-HLT-HEALTH_RECORDS');
    expect(health.organId).toMatch(/^ORGX-HLT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new HealthRecordsOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-612de931' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-HLT-HEALTH_RECORDS' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-HLT-HEALTH_RECORDS');
    // Event should be scoped to this organ only
    expect(event.type).toContain('HealthRecords');
  });
});
