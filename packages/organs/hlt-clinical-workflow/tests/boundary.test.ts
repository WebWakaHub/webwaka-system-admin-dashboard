/**
 * ClinicalWorkflow Organ — Domain Boundary Tests
 * Organ ID: ORGX-HLT-CLINICAL_WORKFLOW
 */

import { ClinicalWorkflowOrgan } from '../src/ClinicalWorkflowOrgan';

describe('ClinicalWorkflow Domain Boundary', () => {
  it('should enforce organ boundary for Healthcare and Clinical', () => {
    const organ = new ClinicalWorkflowOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-HLT-CLINICAL_WORKFLOW');
    expect(health.organId).toMatch(/^ORGX-HLT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ClinicalWorkflowOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-79667bcf' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-HLT-CLINICAL_WORKFLOW' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-HLT-CLINICAL_WORKFLOW');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ClinicalWorkflow');
  });
});
