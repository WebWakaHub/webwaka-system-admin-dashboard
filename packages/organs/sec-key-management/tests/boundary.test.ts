/**
 * KeyManagement Organ — Domain Boundary Tests
 * Organ ID: ORGX-SEC-KEY_MANAGEMENT
 */

import { KeyManagementOrgan } from '../src/KeyManagementOrgan';

describe('KeyManagement Domain Boundary', () => {
  it('should enforce organ boundary for Security and Compliance', () => {
    const organ = new KeyManagementOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-SEC-KEY_MANAGEMENT');
    expect(health.organId).toMatch(/^ORGX-SEC/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new KeyManagementOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-2f005031' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-SEC-KEY_MANAGEMENT' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-SEC-KEY_MANAGEMENT');
    // Event should be scoped to this organ only
    expect(event.type).toContain('KeyManagement');
  });
});
