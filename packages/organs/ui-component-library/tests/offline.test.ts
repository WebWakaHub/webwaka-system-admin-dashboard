/**
 * ComponentLibrary Organ — Offline-First Tests
 * Organ ID: ORGX-UI-COMPONENT_LIBRARY
 * Nigeria-First: Designed for unreliable network conditions
 */

import { ComponentLibraryOrgan } from '../src/ComponentLibraryOrgan';
import { NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ComponentLibrary Offline-First', () => {
  it('should handle offline command execution', () => {
    const organ = new ComponentLibraryOrgan();
    const event = organ.executeOffline({
      id: 'cmd-offline-test',
      type: 'offline-process',
      payload: { data: 'offline-4448b0d8' },
      timestamp: Date.now(),
      idempotencyKey: 'idem-offline-test',
      source: 'ORGX-UI-COMPONENT_LIBRARY',
    });

    expect(event.payload).toHaveProperty('offline', true);
  });

  it('should sync when network is restored', async () => {
    const organ = new ComponentLibraryOrgan();
    // Queue offline operations
    organ.executeOffline({
      id: 'cmd-sync-test',
      type: 'sync-process',
      payload: { sync: true },
      timestamp: Date.now(),
      idempotencyKey: 'idem-sync-test',
      source: 'ORGX-UI-COMPONENT_LIBRARY',
    });

    // Sync
    await organ.sync();
    const health = organ.getHealth();
    expect(health.offlineQueueSize).toBe(0);
  });

  it('should respect Nigeria-first timeout of 30s', () => {
    expect(NIGERIA_FIRST_CONFIG.timeout).toBe(30_000);
  });
});
