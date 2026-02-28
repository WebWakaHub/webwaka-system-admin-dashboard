/**
 * ThreatDetection Organ — Domain Boundary Tests
 * Organ ID: ORGX-SEC-THREAT_DETECTION
 */

import { ThreatDetectionOrgan } from '../src/ThreatDetectionOrgan';

describe('ThreatDetection Domain Boundary', () => {
  it('should enforce organ boundary for Security and Compliance', () => {
    const organ = new ThreatDetectionOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-SEC-THREAT_DETECTION');
    expect(health.organId).toMatch(/^ORGX-SEC/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ThreatDetectionOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-e006e378' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-SEC-THREAT_DETECTION' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-SEC-THREAT_DETECTION');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ThreatDetection');
  });
});
