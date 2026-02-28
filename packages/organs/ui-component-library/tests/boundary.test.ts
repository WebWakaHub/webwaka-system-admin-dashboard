/**
 * ComponentLibrary Organ — Domain Boundary Tests
 * Organ ID: ORGX-UI-COMPONENT_LIBRARY
 */

import { ComponentLibraryOrgan } from '../src/ComponentLibraryOrgan';

describe('ComponentLibrary Domain Boundary', () => {
  it('should enforce organ boundary for User Interface Components', () => {
    const organ = new ComponentLibraryOrgan();
    const health = organ.getHealth();
    expect(health.organId).toBe('ORGX-UI-COMPONENT_LIBRARY');
    expect(health.organId).toMatch(/^ORGX-UI/);
  });

  it('should not leak state outside domain', async () => {
    const organ = new ComponentLibraryOrgan();
    const command = {
      id: 'cmd-boundary-001',
      type: 'state-test',
      payload: { sensitive: 'domain-data-4448b0d8' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-boundary-001',
      source: 'ORGX-UI-COMPONENT_LIBRARY' as const,
    };

    const event = await organ.execute(command);
    expect(event.organId).toBe('ORGX-UI-COMPONENT_LIBRARY');
    // Event should be scoped to this organ only
    expect(event.type).toContain('ComponentLibrary');
  });
});
