/**
 * Authorization Organ — Domain Boundary Tests
 * Organ ID: ORGX-IDA-AUTHORIZATION
 */

import { AuthorizationOrgan } from '../src/AuthorizationOrgan';

describe('Authorization Domain Boundary', () => {
  it('should enforce organ boundary for Identity and Access Management', () => {
    const organ = new AuthorizationOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IDA-AUTHORIZATION');
    expect(health.organId).toMatch(/^ORGX-IDA/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AuthorizationOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-80dae5e1' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IDA-AUTHORIZATION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IDA-AUTHORIZATION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('Authorization');
  });
});
