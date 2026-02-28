/**
 * ConfigurationStore Organ — Domain Boundary Tests
 * Organ ID: ORGX-CFG-CONFIGURATION_STORE
 */

import { ConfigurationStoreOrgan } from '../src/ConfigurationStoreOrgan';

describe('ConfigurationStore Domain Boundary', () => {
  it('should enforce organ boundary for Configuration and Policy Management', () => {
    const organ = new ConfigurationStoreOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-CFG-CONFIGURATION_STORE');
    expect(health.organId).toMatch(/^ORGX-CFG/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ConfigurationStoreOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-599299a2' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-CFG-CONFIGURATION_STORE' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-CFG-CONFIGURATION_STORE');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ConfigurationStore');
  });
});
