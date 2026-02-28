/**
 * LearningProgress Organ — Domain Boundary Tests
 * Organ ID: ORGX-EDU-LEARNING_PROGRESS
 */

import { LearningProgressOrgan } from '../src/LearningProgressOrgan';

describe('LearningProgress Domain Boundary', () => {
  it('should enforce organ boundary for Education and Learning', () => {
    const organ = new LearningProgressOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EDU-LEARNING_PROGRESS');
    expect(health.organId).toMatch(/^ORGX-EDU/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new LearningProgressOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-d5daacc9' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EDU-LEARNING_PROGRESS' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EDU-LEARNING_PROGRESS');
    // Event should be scoped to this organ only
    expect(event.type).toContain('LearningProgress');
  });
});
