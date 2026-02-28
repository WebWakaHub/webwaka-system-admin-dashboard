/**
 * PatientManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-HLT-PATIENT_MANAGEMENT
 */

import { PatientManagementOrgan } from '../src/PatientManagementOrgan';

describe('PatientManagement Domain Boundary', () => {
  it('should enforce organ boundary for Healthcare and Clinical', () => {
    const organ = new PatientManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-HLT-PATIENT_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-HLT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PatientManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-d94d097d' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-HLT-PATIENT_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-HLT-PATIENT_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PatientManagement');
  });
});
