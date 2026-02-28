/**
 * Mapping Organ — Verification Test Suite
 * Organ ID: ORGX-GEO-MAPPING
 * Domain: Geospatial and Location Services
 *
 * Tests cover:
 * - Business capability verification
 * - Domain boundary preservation
 * - Tissue integration validation
 * - Offline-first behavior
 * - Nigeria-first configuration
 * - Vendor neutral AI compliance
 */

import { MappingOrgan } from '../src/MappingOrgan';
import { NIGERIA_FIRST_CONFIG, MappingCommand, NetworkConfig } from '../src/types';

describe('MappingOrgan', () => {
  let organ: MappingOrgan;

  beforeEach(() => {
    organ = new MappingOrgan();
  });

  describe('Business Capability', () => {
    it('should execute commands within Mapping domain', async () => {
      const command: MappingCommand = {
        id: 'cmd-001',
        type: 'process',
        payload: { data: 'test-85c28086' },
        timestamp: Date.now(),
        idempotencyKey: 'idem-001',
        source: 'ORGX-GEO-MAPPING',
      };

      const event = await organ.execute(command);
      expect(event).toBeDefined();
      expect(event.organId).toBe('ORGX-GEO-MAPPING');
      expect(event.type).toContain('Mapping');
    });

    it('should reject commands from wrong source', async () => {
      const command: MappingCommand = {
        id: 'cmd-002',
        type: 'process',
        payload: {},
        timestamp: Date.now(),
        idempotencyKey: 'idem-002',
        source: 'WRONG-SOURCE' as any,
      };

      await expect(organ.execute(command)).rejects.toThrow('source mismatch');
    });
  });

  describe('Domain Boundary Preservation', () => {
    it('should scope all events to GEO domain', async () => {
      const command: MappingCommand = {
        id: 'cmd-003',
        type: 'boundary-test',
        payload: { boundary: 'GEO' },
        timestamp: Date.now(),
        idempotencyKey: 'idem-003',
        source: 'ORGX-GEO-MAPPING',
      };

      const event = await organ.execute(command);
      expect(event.organId).toBe('ORGX-GEO-MAPPING');
      expect(event.organId).toContain('GEO');
    });
  });

  describe('Offline-First Behavior', () => {
    it('should queue commands when offline', () => {
      const command: MappingCommand = {
        id: 'cmd-offline-001',
        type: 'offline-op',
        payload: { offline: true },
        timestamp: Date.now(),
        idempotencyKey: 'idem-offline-001',
        source: 'ORGX-GEO-MAPPING',
      };

      const event = organ.executeOffline(command);
      expect(event).toBeDefined();
      expect(event.type).toContain('queued');
      expect(event.payload).toHaveProperty('offline', true);
    });

    it('should maintain offline queue capacity', () => {
      for (let i = 0; i < 10; i++) {
        organ.executeOffline({
          id: `cmd-batch-${i}`,
          type: 'batch-op',
          payload: { index: i },
          timestamp: Date.now(),
          idempotencyKey: `idem-batch-${i}`,
          source: 'ORGX-GEO-MAPPING',
        });
      }

      const health = organ.getHealth();
      expect(health.offlineQueueSize).toBe(10);
      expect(health.status).toBe('offline');
    });
  });

  describe('Nigeria-First Configuration', () => {
    it('should use 30s timeout', () => {
      expect(NIGERIA_FIRST_CONFIG.timeout).toBe(30_000);
    });

    it('should use en-NG locale', () => {
      expect(NIGERIA_FIRST_CONFIG.locale).toBe('en-NG');
    });

    it('should use NGN currency', () => {
      expect(NIGERIA_FIRST_CONFIG.currency).toBe('NGN');
    });

    it('should use NG region', () => {
      expect(NIGERIA_FIRST_CONFIG.region).toBe('NG');
    });

    it('should have 1000 offline queue capacity', () => {
      expect(NIGERIA_FIRST_CONFIG.offlineQueueCapacity).toBe(1_000);
    });

    it('should use exponential backoff starting at 5s', () => {
      expect(NIGERIA_FIRST_CONFIG.retryBackoff).toBe(5_000);
      expect(NIGERIA_FIRST_CONFIG.maxBackoff).toBe(300_000);
    });
  });

  describe('Tissue Integration', () => {
    it('should report healthy tissue status', () => {
      const health = organ.getHealth();
      expect(health.tissueHealth).toBeDefined();
      expect(health.tissueHealth.commandCoordinator).toBe('healthy');
      expect(health.tissueHealth.stateStore).toBe('healthy');
      expect(health.tissueHealth.eventMesh).toBe('healthy');
      expect(health.tissueHealth.validation).toBe('healthy');
    });
  });

  describe('Vendor Neutral AI', () => {
    it('should accept any AI provider', () => {
      const mockProvider = {
        provider: 'test-provider',
        model: 'test-model',
        invoke: async (input: any) => ({ result: 'test' }),
        invokeOffline: (input: any) => ({ result: 'cached' }),
      };

      expect(() => organ.registerAIProvider(mockProvider)).not.toThrow();
    });
  });

  describe('Health Monitoring', () => {
    it('should return complete health status', () => {
      const health = organ.getHealth();
      expect(health.organId).toBe('ORGX-GEO-MAPPING');
      expect(health.status).toBeDefined();
      expect(health.offlineQueueSize).toBeDefined();
      expect(health.lastSyncTimestamp).toBeDefined();
      expect(health.networkConfig).toBeDefined();
    });
  });
});
