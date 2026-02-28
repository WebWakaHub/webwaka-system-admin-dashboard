/**
 * Plugin Logger Unit Tests
 */

import { PluginLogger, LogLevel } from '../../src/plugin-system/utils/plugin-logger';

describe('PluginLogger', () => {
  let logger: PluginLogger;

  beforeEach(() => {
    logger = new PluginLogger();
  });

  describe('log', () => {
    it('should log a message with all details', () => {
      logger.log(LogLevel.INFO, 'TestComponent', 'Test message', {
        data: { key: 'value' },
        tenantId: 'tenant-1',
        pluginId: 'plugin-1',
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].component).toBe('TestComponent');
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].data).toEqual({ key: 'value' });
      expect(logs[0].tenantId).toBe('tenant-1');
      expect(logs[0].pluginId).toBe('plugin-1');
    });

    it('should include timestamp', () => {
      logger.log(LogLevel.DEBUG, 'Component', 'Message');

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp!)).toBeInstanceOf(Date);
    });

    it('should include error details', () => {
      const error = new Error('Test error');
      logger.log(LogLevel.ERROR, 'Component', 'Error occurred', { error });

      const logs = logger.getLogs();
      expect(logs[0].error).toBeDefined();
      expect(logs[0].error?.code).toBe('Error');
      expect(logs[0].error?.message).toBe('Test error');
      expect(logs[0].error?.stack).toBeDefined();
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('Component', 'Debug message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Component', 'Info message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Component', 'Warning message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Component', 'Error message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      logger.debug('Component1', 'Debug 1');
      logger.info('Component1', 'Info 1', { tenantId: 'tenant-1' });
      logger.warn('Component2', 'Warn 1', { tenantId: 'tenant-2' });
      logger.error('Component2', 'Error 1', { tenantId: 'tenant-1' });
    });

    it('should return all logs', () => {
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
    });

    it('should filter logs by level', () => {
      const logs = logger.getLogs({ level: LogLevel.INFO });
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Info 1');
    });

    it('should filter logs by component', () => {
      const logs = logger.getLogs({ component: 'Component2' });
      expect(logs).toHaveLength(2);
    });

    it('should filter logs by tenant', () => {
      const logs = logger.getLogs({ tenantId: 'tenant-1' });
      expect(logs).toHaveLength(2);
    });

    it('should combine multiple filters', () => {
      const logs = logger.getLogs({
        level: LogLevel.ERROR,
        component: 'Component2',
        tenantId: 'tenant-1',
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Error 1');
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      logger.debug('Component', 'Debug 1');
      logger.debug('Component', 'Debug 2');
      logger.info('Component', 'Info 1');
      logger.warn('Component', 'Warn 1');
      logger.error('Component', 'Error 1');
    });

    it('should return log statistics', () => {
      const stats = logger.getStatistics();

      expect(stats.total).toBe(5);
      expect(stats.byLevel[LogLevel.DEBUG]).toBe(2);
      expect(stats.byLevel[LogLevel.INFO]).toBe(1);
      expect(stats.byLevel[LogLevel.WARN]).toBe(1);
      expect(stats.byLevel[LogLevel.ERROR]).toBe(1);
    });

    it('should return zero statistics for empty logger', () => {
      const emptyLogger = new PluginLogger();
      const stats = emptyLogger.getStatistics();

      expect(stats.total).toBe(0);
      expect(stats.byLevel[LogLevel.DEBUG]).toBe(0);
      expect(stats.byLevel[LogLevel.INFO]).toBe(0);
      expect(stats.byLevel[LogLevel.WARN]).toBe(0);
      expect(stats.byLevel[LogLevel.ERROR]).toBe(0);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      logger.debug('Component', 'Message 1');
      logger.info('Component', 'Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('log storage limit', () => {
    it('should maintain bounded log storage', () => {
      // Add more logs than the max limit (10,000)
      for (let i = 0; i < 10050; i++) {
        logger.debug('Component', `Message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(10000);
      expect(logs.length).toBeGreaterThan(9900);
    });
  });

  describe('logging with different data types', () => {
    it('should log string data', () => {
      logger.info('Component', 'Message', { data: { text: 'hello' } });

      const logs = logger.getLogs();
      expect(logs[0].data?.text).toBe('hello');
    });

    it('should log numeric data', () => {
      logger.info('Component', 'Message', { data: { count: 42 } });

      const logs = logger.getLogs();
      expect(logs[0].data?.count).toBe(42);
    });

    it('should log boolean data', () => {
      logger.info('Component', 'Message', { data: { enabled: true } });

      const logs = logger.getLogs();
      expect(logs[0].data?.enabled).toBe(true);
    });

    it('should log object data', () => {
      logger.info('Component', 'Message', {
        data: { nested: { key: 'value' } },
      });

      const logs = logger.getLogs();
      expect(logs[0].data?.nested).toEqual({ key: 'value' });
    });

    it('should log array data', () => {
      logger.info('Component', 'Message', { data: { items: [1, 2, 3] } });

      const logs = logger.getLogs();
      expect(logs[0].data?.items).toEqual([1, 2, 3]);
    });
  });
});
