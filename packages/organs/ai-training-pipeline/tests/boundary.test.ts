/**
 * TrainingPipeline Organ — Domain Boundary Tests
 * Organ ID: ORGX-AI-TRAINING_PIPELINE
 */

import { TrainingPipelineOrgan } from '../src/TrainingPipelineOrgan';

describe('TrainingPipeline Domain Boundary', () => {
  it('should enforce organ boundary for Artificial Intelligence and Machine Learning', () => {
    const organ = new TrainingPipelineOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-AI-TRAINING_PIPELINE');
    expect(health.organId).toMatch(/^ORGX-AI/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new TrainingPipelineOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-80ffa819' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-AI-TRAINING_PIPELINE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-AI-TRAINING_PIPELINE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('TrainingPipeline');
  });
});
