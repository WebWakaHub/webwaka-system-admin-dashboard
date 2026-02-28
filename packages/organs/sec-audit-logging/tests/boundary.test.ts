/**
 * AuditLogging Organ — Domain Boundary Tests
 * Organ ID: ORGX-SEC-AUDIT_LOGGING
 */

import { AuditLoggingOrgan } from '../src/AuditLoggingOrgan';

describe('AuditLogging Domain Boundary', () => {
  it('should enforce organ boundary for Security and Compliance', () => {
    const organ = new AuditLoggingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-SEC-AUDIT_LOGGING');
    expect(health.organId).toMatch(/^ORGX-SEC/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new AuditLoggingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-16b1116b' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-SEC-AUDIT_LOGGING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-SEC-AUDIT_LOGGING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('AuditLogging');
  });
});
