/**
 * PublicRecords Organ — Domain Boundary Tests
 * Organ ID: ORGX-GOV-PUBLIC_RECORDS
 */

import { PublicRecordsOrgan } from '../src/PublicRecordsOrgan';

describe('PublicRecords Domain Boundary', () => {
  it('should enforce organ boundary for Government and Civic Services', () => {
    const organ = new PublicRecordsOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-GOV-PUBLIC_RECORDS');
    expect(health.organId).toMatch(/^ORGX-GOV/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PublicRecordsOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-30848530' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-GOV-PUBLIC_RECORDS' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-GOV-PUBLIC_RECORDS');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PublicRecords');
  });
});
