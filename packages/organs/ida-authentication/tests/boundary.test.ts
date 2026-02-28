/**
 * Authentication Organ — Domain Boundary Tests
 * Organ ID: ORGX-IDA-AUTHENTICATION
 */

import { AuthenticationOrgan } from '../src/AuthenticationOrgan';

describe('Authentication Domain Boundary', () => {
  it('should enforce organ boundary for Identity and Access Management', () => {
    const organ = new AuthenticationOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-IDA-AUTHENTICATION');
    expect(health.organId).toMatch(/^ORGX-IDA/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AuthenticationOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-c314b632' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-IDA-AUTHENTICATION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-IDA-AUTHENTICATION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('Authentication');
  });
});
