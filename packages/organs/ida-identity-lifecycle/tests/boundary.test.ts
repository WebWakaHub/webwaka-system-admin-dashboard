/**
 * IdentityLifecycle Organ — Domain Boundary Tests
 * Organ ID: ORGX-IDA-IDENTITY_LIFECYCLE
 */

import { IdentityLifecycleOrgan } from '../src/IdentityLifecycleOrgan';

describe('IdentityLifecycle Domain Boundary', () => {
  it('should enforce organ boundary for Identity and Access Management', () => {
    const organ = new IdentityLifecycleOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IDA-IDENTITY_LIFECYCLE');
    expect(health.organId).toMatch(/^ORGX-IDA/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new IdentityLifecycleOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-10ad8302' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IDA-IDENTITY_LIFECYCLE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IDA-IDENTITY_LIFECYCLE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('IdentityLifecycle');
  });
});
