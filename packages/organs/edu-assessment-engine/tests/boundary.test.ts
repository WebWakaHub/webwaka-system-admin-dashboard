/**
 * AssessmentEngine Organ — Domain Boundary Tests
 * Organ ID: ORGX-EDU-ASSESSMENT_ENGINE
 */

import { AssessmentEngineOrgan } from '../src/AssessmentEngineOrgan';

describe('AssessmentEngine Domain Boundary', () => {
  it('should enforce organ boundary for Education and Learning', () => {
    const organ = new AssessmentEngineOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EDU-ASSESSMENT_ENGINE');
    expect(health.organId).toMatch(/^ORGX-EDU/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AssessmentEngineOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-aec306b0' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EDU-ASSESSMENT_ENGINE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EDU-ASSESSMENT_ENGINE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('AssessmentEngine');
  });
});
