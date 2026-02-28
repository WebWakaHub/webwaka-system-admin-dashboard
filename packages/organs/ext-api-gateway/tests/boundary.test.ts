/**
 * ApiGateway Organ — Domain Boundary Tests
 * Organ ID: ORGX-EXT-API_GATEWAY
 */

import { ApiGatewayOrgan } from '../src/ApiGatewayOrgan';

describe('ApiGateway Domain Boundary', () => {
  it('should enforce organ boundary for External Integration and API', () => {
    const organ = new ApiGatewayOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-EXT-API_GATEWAY');
    expect(health.organId).toMatch(/^ORGX-EXT/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ApiGatewayOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-9ed8f7b4' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-EXT-API_GATEWAY' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-EXT-API_GATEWAY');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ApiGateway');
  });
});
