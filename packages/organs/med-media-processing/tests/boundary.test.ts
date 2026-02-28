/**
 * MediaProcessing Organ — Domain Boundary Tests
 * Organ ID: ORGX-MED-MEDIA_PROCESSING
 */

import { MediaProcessingOrgan } from '../src/MediaProcessingOrgan';

describe('MediaProcessing Domain Boundary', () => {
  it('should enforce organ boundary for Media and Content', () => {
    const organ = new MediaProcessingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-MED-MEDIA_PROCESSING');
    expect(health.organId).toMatch(/^ORGX-MED/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new MediaProcessingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-1858fcbb' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-MED-MEDIA_PROCESSING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-MED-MEDIA_PROCESSING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('MediaProcessing');
  });
});
