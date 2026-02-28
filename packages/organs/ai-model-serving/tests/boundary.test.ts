/**
 * ModelServing Organ — Domain Boundary Tests
 * Organ ID: ORGX-AI-MODEL_SERVING
 */

import { ModelServingOrgan } from '../src/ModelServingOrgan';

describe('ModelServing Domain Boundary', () => {
  it('should enforce organ boundary for Artificial Intelligence and Machine Learning', () => {
    const organ = new ModelServingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-AI-MODEL_SERVING');
    expect(health.organId).toMatch(/^ORGX-AI/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ModelServingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-d971d254' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-AI-MODEL_SERVING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-AI-MODEL_SERVING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ModelServing');
  });
});
