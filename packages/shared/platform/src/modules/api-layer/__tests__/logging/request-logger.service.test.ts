/**
 * Unit Tests for Request Logger Service
 * 
 * Tests structured logging with different log levels.
 */

import { RequestLoggerService, LogLevel } from '../../logging/request-logger.service';
import { ApiRequestContext } from '../../types';

describe('RequestLoggerService', () => {
  let logger: RequestLoggerService;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  const mockContext: ApiRequestContext = {
    tenantId: 'tenant-123',
    userId: 'user-456',
    requestId: 'req-789',
    timestamp: new Date(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(() => {
    logger = new RequestLoggerService(LogLevel.DEBUG);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('logRequest', () => {
    it('should log request with context', () => {
      logger.logRequest(mockContext, 'GET', '/api/v1/test', { page: '1' });

      expect(consoleSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.type).toBe('REQUEST');
      expect(logEntry.method).toBe('GET');
      expect(logEntry.path).toBe('/api/v1/test');
      expect(logEntry.requestId).toBe('req-789');
    });

    it('should not log when level is too high', () => {
      logger.setLogLevel(LogLevel.ERROR);
      logger.logRequest(mockContext, 'GET', '/api/v1/test');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('logResponse', () => {
    it('should log response with status and duration', () => {
      logger.logResponse(mockContext, 200, 45);

      expect(consoleSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.type).toBe('RESPONSE');
      expect(logEntry.statusCode).toBe(200);
      expect(logEntry.duration).toBe(45);
    });
  });

  describe('logError', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logger.logError(mockContext, error, 500);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.type).toBe('ERROR');
      expect(logEntry.error).toBe('Test error');
      expect(logEntry.stack).toBeDefined();
    });

    it('should log error with string message', () => {
      logger.logError(mockContext, 'String error', 400);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.error).toBe('String error');
      expect(logEntry.stack).toBeUndefined();
    });

    it('should handle undefined context', () => {
      logger.logError(undefined, 'Error without context', 500);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(logEntry.requestId).toBe('unknown');
    });
  });

  describe('logAuthentication', () => {
    it('should log successful authentication', () => {
      logger.logAuthentication(true, 'user-123', 'tenant-456');

      expect(consoleSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.type).toBe('AUTHENTICATION');
      expect(logEntry.success).toBe(true);
      expect(logEntry.userId).toBe('user-123');
    });

    it('should log failed authentication with reason', () => {
      logger.logAuthentication(false, undefined, undefined, 'Invalid token');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.success).toBe(false);
      expect(logEntry.reason).toBe('Invalid token');
    });
  });

  describe('logAuthorization', () => {
    it('should log allowed authorization', () => {
      logger.logAuthorization(
        true,
        'user-123',
        'tenant-456',
        'users',
        'read'
      );

      expect(consoleSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.type).toBe('AUTHORIZATION');
      expect(logEntry.allowed).toBe(true);
      expect(logEntry.resource).toBe('users');
      expect(logEntry.action).toBe('read');
    });

    it('should log denied authorization with reason', () => {
      logger.logAuthorization(
        false,
        'user-123',
        'tenant-456',
        'users',
        'delete',
        'Insufficient permissions'
      );

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.allowed).toBe(false);
      expect(logEntry.reason).toBe('Insufficient permissions');
    });
  });

  describe('logRateLimit', () => {
    it('should log rate limit exceeded as warning', () => {
      const resetAt = new Date();
      logger.logRateLimit(true, 'user-123', 'tenant-456', 0, resetAt);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.type).toBe('RATE_LIMIT');
      expect(logEntry.exceeded).toBe(true);
    });

    it('should log rate limit allowed as debug', () => {
      const resetAt = new Date();
      logger.logRateLimit(false, 'user-123', 'tenant-456', 50, resetAt);

      expect(consoleDebugSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.exceeded).toBe(false);
      expect(logEntry.remaining).toBe(50);
    });
  });

  describe('logMetric', () => {
    it('should log performance metric', () => {
      logger.logMetric('request_duration', 45, 'ms', mockContext);

      expect(consoleDebugSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.type).toBe('METRIC');
      expect(logEntry.metric).toBe('request_duration');
      expect(logEntry.value).toBe(45);
      expect(logEntry.unit).toBe('ms');
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('Debug message', { key: 'value' });

      expect(consoleDebugSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toBe('Debug message');
      expect(logEntry.data).toEqual({ key: 'value' });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Warning message', { issue: 'deprecated' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe('Warning message');
    });
  });

  describe('setLogLevel', () => {
    it('should change log level', () => {
      logger.setLogLevel(LogLevel.ERROR);
      logger.logRequest(mockContext, 'GET', '/test');

      expect(consoleSpy).not.toHaveBeenCalled();

      logger.logError(mockContext, 'Error', 500);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
