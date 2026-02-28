/**
 * CognitivefabricSystem Test Suite
 * System ID: SYSX-AI-COGNITIVE_FABRIC
 * Hash: 92672c08
 */

import { CognitivefabricSystem } from '../src/cognitivefabricsystem';
import { NIGERIA_FIRST_CONFIG, SYSTEM_ID } from '../src/types';

describe('CognitivefabricSystem', () => {
  let system: CognitivefabricSystem;

  beforeEach(() => {
    system = new CognitivefabricSystem();
  });

  describe('coordinate', () => {
    it('should process commands with Nigeria-first config', async () => {
      const command = {
        id: 'test-1',
        type: 'process',
        payload: { data: 'test' },
        locale: NIGERIA_FIRST_CONFIG.locale,
        timezone: NIGERIA_FIRST_CONFIG.timezone,
        createdAt: Date.now(),
      };
      const result = await system.coordinate(command);
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('offline support', () => {
    it('should queue commands when offline', async () => {
      const command = {
        id: 'offline-1',
        type: 'process',
        payload: { data: 'offline-test' },
        locale: NIGERIA_FIRST_CONFIG.locale,
        timezone: NIGERIA_FIRST_CONFIG.timezone,
        createdAt: Date.now(),
      };
      const result = await system.coordinateOffline(command);
      expect(result.success).toBe(true);
      expect(result.offlineQueued).toBe(true);
    });

    it('should sync offline queue', async () => {
      const result = await system.sync();
      expect(result).toHaveProperty('synced');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('remaining');
    });
  });

  describe('Nigeria-first compliance', () => {
    it('should use en-NG locale', () => {
      expect(NIGERIA_FIRST_CONFIG.locale).toBe('en-NG');
    });

    it('should use Africa/Lagos timezone', () => {
      expect(NIGERIA_FIRST_CONFIG.timezone).toBe('Africa/Lagos');
    });

    it('should use 30s network timeout', () => {
      expect(NIGERIA_FIRST_CONFIG.networkTimeout).toBe(30000);
    });

    it('should use NGN currency', () => {
      expect(NIGERIA_FIRST_CONFIG.currency).toBe('NGN');
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const health = await system.getHealth();
      expect(health.systemId).toBe(SYSTEM_ID);
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('queueDepth');
    });
  });
});
