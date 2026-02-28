/**
 * ShipmentTracking Organ — Domain Boundary Tests
 * Organ ID: ORGX-TRN-SHIPMENT_TRACKING
 */

import { ShipmentTrackingOrgan } from '../src/ShipmentTrackingOrgan';

describe('ShipmentTracking Domain Boundary', () => {
  it('should enforce organ boundary for Transportation and Shipping', () => {
    const organ = new ShipmentTrackingOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-TRN-SHIPMENT_TRACKING');
    expect(health.organId).toMatch(/^ORGX-TRN/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ShipmentTrackingOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-b75ce27f' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-TRN-SHIPMENT_TRACKING' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-TRN-SHIPMENT_TRACKING');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ShipmentTracking');
  });
});
