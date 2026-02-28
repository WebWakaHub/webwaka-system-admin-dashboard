/**
 * Unit tests for AuditSystemConfig\n */

import { AuditSystemConfig } from '../../../src/audit-system/config/AuditSystemConfig';

describe('AuditSystemConfig', () => {
  let config: AuditSystemConfig;

  beforeEach(() => {
    config = new AuditSystemConfig();
  });

  describe('constructor', () => {
    it('should create config with default values', () => {
      expect(config.get('enabled')).toBe(true);
      expect(config.get('maxQueueSize')).toBe(10000);
      expect(config.get('validateEvents')).toBe(true);
    });

    it('should create config with custom values', () => {
      const customConfig = new AuditSystemConfig({
        enabled: false,
        maxQueueSize: 5000,
      });

      expect(customConfig.get('enabled')).toBe(false);
      expect(customConfig.get('maxQueueSize')).toBe(5000);
    });
  });

  describe('get', () => {
    it('should get a configuration value', () => {
      expect(config.get('enabled')).toBe(true);
      expect(config.get('maxQueueSize')).toBe(10000);
    });
  });

  describe('set', () => {
    it('should set a configuration value', () => {
      config.set('enabled', false);
      expect(config.get('enabled')).toBe(false);

      config.set('maxQueueSize', 5000);
      expect(config.get('maxQueueSize')).toBe(5000);
    });
  });

  describe('getAll', () => {
    it('should get all configuration values', () => {
      const all = config.getAll();

      expect(all.enabled).toBe(true);
      expect(all.maxQueueSize).toBe(10000);
      expect(all.validateEvents).toBe(true);
    });

    it('should return a copy of configuration', () => {
      const all1 = config.getAll();
      const all2 = config.getAll();

      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('validate', () => {
    it('should validate correct configuration', () => {
      const result = config.validate();

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid maxQueueSize', () => {
      config.set('maxQueueSize', 0);
      const result = config.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxQueueSize must be greater than 0');
    });

    it('should detect invalid maxStorageSize', () => {
      config.set('maxStorageSize', -1);
      const result = config.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxStorageSize must be greater than 0');
    });

    it('should detect invalid defaultPageSize', () => {
      config.set('defaultPageSize', 0);
      const result = config.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('defaultPageSize must be greater than 0');
    });

    it('should detect maxPageSize less than defaultPageSize', () => {
      config.set('defaultPageSize', 200);
      config.set('maxPageSize', 100);
      const result = config.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('maxPageSize must be greater than or equal to defaultPageSize');
    });

    it('should detect invalid retentionDays', () => {
      config.set('retentionDays', -1);
      const result = config.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('retentionDays must be greater than or equal to 0');
    });
  });
});
