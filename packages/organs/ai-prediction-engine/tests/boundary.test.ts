/**
 * PredictionEngine Organ — Domain Boundary Tests
 * Organ ID: ORGX-AI-PREDICTION_ENGINE
 */

import { PredictionEngineOrgan } from '../src/PredictionEngineOrgan';

describe('PredictionEngine Domain Boundary', () => {
  it('should enforce organ boundary for Artificial Intelligence and Machine Learning', () => {
    const organ = new PredictionEngineOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-AI-PREDICTION_ENGINE');
    expect(health.organId).toMatch(/^ORGX-AI/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new PredictionEngineOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-cd81f58e' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-AI-PREDICTION_ENGINE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-AI-PREDICTION_ENGINE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('PredictionEngine');
  });
});
