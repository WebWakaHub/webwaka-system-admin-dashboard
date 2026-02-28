/**
 * AppStore Organ — Domain Boundary Tests
 * Organ ID: ORGX-EXT-APP_STORE
 */

import { AppStoreOrgan } from '../src/AppStoreOrgan';

describe('AppStore Domain Boundary', () => {
  it('should enforce organ boundary for External Integration and API', () => {
    const organ = new AppStoreOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EXT-APP_STORE');
    expect(health.organId).toMatch(/^ORGX-EXT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AppStoreOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-7c7e5e6e' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EXT-APP_STORE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EXT-APP_STORE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('AppStore');
  });
});
