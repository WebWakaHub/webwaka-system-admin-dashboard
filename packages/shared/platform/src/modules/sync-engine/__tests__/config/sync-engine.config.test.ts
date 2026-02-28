/**
 * Sync Engine Configuration Tests
 */

import {
  defaultSyncEngineConfig,
  loadSyncEngineConfig,
  validateSyncEngineConfig,
} from '../../config/sync-engine.config';

describe('Sync Engine Configuration', () => {
  describe('defaultSyncEngineConfig', () => {
    it('should have correct default values', () => {
      expect(defaultSyncEngineConfig.syncIntervalMs).toBe(30000);
      expect(defaultSyncEngineConfig.maxRetries).toBe(3);
      expect(defaultSyncEngineConfig.conflictResolutionStrategy).toBe('last-write-wins');
      expect(defaultSyncEngineConfig.enableRealTimeSync).toBe(true);
    });
  });

  describe('loadSyncEngineConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should load configuration from environment variables', () => {
      process.env.SYNC_INTERVAL_MS = '60000';
      process.env.SYNC_MAX_RETRIES = '5';
      process.env.SYNC_CONFLICT_STRATEGY = 'custom';
      process.env.SYNC_ENABLE_REALTIME = 'true';

      const config = loadSyncEngineConfig();

      expect(config.syncIntervalMs).toBe(60000);
      expect(config.maxRetries).toBe(5);
      expect(config.conflictResolutionStrategy).toBe('custom');
      expect(config.enableRealTimeSync).toBe(true);
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.SYNC_INTERVAL_MS;
      delete process.env.SYNC_MAX_RETRIES;
      delete process.env.SYNC_CONFLICT_STRATEGY;
      delete process.env.SYNC_ENABLE_REALTIME;

      const config = loadSyncEngineConfig();

      expect(config.syncIntervalMs).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.conflictResolutionStrategy).toBe('last-write-wins');
      expect(config.enableRealTimeSync).toBe(true);
    });

    it('should disable real-time sync when SYNC_ENABLE_REALTIME is false', () => {
      process.env.SYNC_ENABLE_REALTIME = 'false';

      const config = loadSyncEngineConfig();

      expect(config.enableRealTimeSync).toBe(false);
    });
  });

  describe('validateSyncEngineConfig', () => {
    it('should return true for valid configuration', () => {
      const config = {
        syncIntervalMs: 30000,
        maxRetries: 3,
        conflictResolutionStrategy: 'last-write-wins' as const,
        enableRealTimeSync: true,
      };

      expect(validateSyncEngineConfig(config)).toBe(true);
    });

    it('should throw error when sync interval is less than 1000ms', () => {
      const config = {
        syncIntervalMs: 500,
        maxRetries: 3,
        conflictResolutionStrategy: 'last-write-wins' as const,
        enableRealTimeSync: true,
      };

      expect(() => validateSyncEngineConfig(config)).toThrow('Sync interval must be at least 1000ms');
    });

    it('should throw error when max retries is less than 1', () => {
      const config = {
        syncIntervalMs: 30000,
        maxRetries: 0,
        conflictResolutionStrategy: 'last-write-wins' as const,
        enableRealTimeSync: true,
      };

      expect(() => validateSyncEngineConfig(config)).toThrow('Max retries must be at least 1');
    });

    it('should throw error for invalid conflict resolution strategy', () => {
      const config = {
        syncIntervalMs: 30000,
        maxRetries: 3,
        conflictResolutionStrategy: 'invalid' as any,
        enableRealTimeSync: true,
      };

      expect(() => validateSyncEngineConfig(config)).toThrow('Invalid conflict resolution strategy');
    });
  });
});
