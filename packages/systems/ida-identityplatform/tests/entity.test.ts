// IdentityPlatformSystem — Unit Tests
// System ID: SYS-IDA-IDENTITYPLATFORM
// Test Hash: 100ccf0e-test

import { IdentityPlatformSystem } from '../src/entity';
import { SYSTEM_ID, NIGERIA_FIRST_CONFIG, NetworkConfig } from '../src/types';

describe('IdentityPlatformSystem', () => {
  let system: IdentityPlatformSystem;

  beforeEach(() => {
    system = new IdentityPlatformSystem();
  });

  describe('initialization', () => {
    it('should initialize with Nigeria-First config', () => {
      expect(system).toBeDefined();
      expect(NIGERIA_FIRST_CONFIG.defaultLocale).toBe('en-NG');
      expect(NIGERIA_FIRST_CONFIG.defaultCurrency).toBe('NGN');
      expect(NIGERIA_FIRST_CONFIG.defaultTimezone).toBe('Africa/Lagos');
      expect(NIGERIA_FIRST_CONFIG.networkTimeout).toBe(30000);
    });

    it('should have correct system ID', () => {
      expect(SYSTEM_ID).toBe('SYS-IDA-IDENTITYPLATFORM');
    });
  });

  describe('offline operations', () => {
    it('should queue operations when offline', async () => {
      const result = await system.coordinateOffline('testOrgan', { type: 'test' });
      expect(result).toBeDefined();
      expect((result as any).syncStatus).toBe('pending');
    });

    it('should track offline queue status', () => {
      const status = system.getOfflineQueueStatus();
      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('oldestEntry');
    });

    it('should sync queued operations', async () => {
      await system.coordinateOffline('testOrgan', { type: 'test' });
      const syncResult = await system.sync();
      expect(syncResult).toHaveProperty('synced');
      expect(syncResult).toHaveProperty('failed');
      expect(syncResult).toHaveProperty('pending');
    });
  });

  describe('Nigeria-First compliance', () => {
    it('should use en-NG locale', () => {
      expect(NIGERIA_FIRST_CONFIG.defaultLocale).toBe('en-NG');
    });

    it('should use NGN currency', () => {
      expect(NIGERIA_FIRST_CONFIG.defaultCurrency).toBe('NGN');
    });

    it('should use Africa/Lagos timezone', () => {
      expect(NIGERIA_FIRST_CONFIG.defaultTimezone).toBe('Africa/Lagos');
    });

    it('should have 30s network timeout for Nigerian networks', () => {
      expect(NIGERIA_FIRST_CONFIG.networkTimeout).toBe(30000);
    });
  });

  describe('capabilities', () => {
    it('should expose all system capabilities', () => {
      const caps = system.getCapabilities();
      expect(caps.length).toBe(5);
      caps.forEach(cap => {
        expect(cap.offlineSupport).toBe(true);
      });
    });
  });

  describe('organ health', () => {
    it('should report health for all organs', async () => {
      const health = await system.getHealth();
      expect(health).toBeDefined();
    });
  });
});
