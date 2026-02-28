/**
 * Utility Components Unit Tests
 * Tests for RateLimiter, ErrorHandler, and RetryPolicy
 */

import RateLimiter from '../../utils/RateLimiter';
import ErrorHandler, { ErrorType } from '../../utils/ErrorHandler';
import RetryPolicy from '../../utils/RetryPolicy';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });
  });

  describe('isAllowed', () => {
    test('should allow requests within limit', () => {
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    test('should deny requests exceeding limit', () => {
      for (let i = 0; i < 10; i++) {
        expect(limiter.isAllowed('user2')).toBe(true);
      }
      expect(limiter.isAllowed('user2')).toBe(false);
    });

    test('should track different users separately', () => {
      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed('user3')).toBe(true);
      }
      for (let i = 0; i < 10; i++) {
        expect(limiter.isAllowed('user4')).toBe(true);
      }
      expect(limiter.isAllowed('user3')).toBe(true);
      expect(limiter.isAllowed('user4')).toBe(false);
    });
  });

  describe('getStatus', () => {
    test('should return correct status', () => {
      limiter.isAllowed('user5');
      const status = limiter.getStatus('user5');
      expect(status.remaining).toBe(9);
      expect(status.limit).toBe(10);
      expect(status.isLimited).toBe(false);
    });

    test('should mark as limited when exhausted', () => {
      for (let i = 0; i < 10; i++) {
        limiter.isAllowed('user6');
      }
      const status = limiter.getStatus('user6');
      expect(status.isLimited).toBe(true);
    });
  });

  describe('reset', () => {
    test('should reset bucket for user', () => {
      for (let i = 0; i < 10; i++) {
        limiter.isAllowed('user7');
      }
      limiter.reset('user7');
      expect(limiter.isAllowed('user7')).toBe(true);
    });
  });

  describe('resetAll', () => {
    test('should reset all buckets', () => {
      for (let i = 0; i < 10; i++) {
        limiter.isAllowed('user8');
        limiter.isAllowed('user9');
      }
      limiter.resetAll();
      expect(limiter.isAllowed('user8')).toBe(true);
      expect(limiter.isAllowed('user9')).toBe(true);
    });
  });

  describe('getStatistics', () => {
    test('should return statistics', () => {
      limiter.isAllowed('user10');
      const stats = limiter.getStatistics();
      expect(stats.activeBuckets).toBeGreaterThan(0);
      expect(stats.config.maxRequests).toBe(10);
    });
  });

  describe('events', () => {
    test('should emit request:allowed event', (done) => {
      limiter.on('request:allowed', (data) => {
        expect(data.key).toBe('user11');
        done();
      });
      limiter.isAllowed('user11');
    });

    test('should emit request:limited event', (done) => {
      limiter.on('request:limited', (data) => {
        expect(data.key).toBe('user12');
        done();
      });
      for (let i = 0; i < 10; i++) {
        limiter.isAllowed('user12');
      }
      limiter.isAllowed('user12');
    });
  });
});

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  describe('handleError', () => {
    test('should categorize 401 error as AUTHENTICATION', () => {
      const error = new Error('401 Unauthorized');
      const aiError = handler.handleError(error, 'openrouter', 'gpt-4');
      expect(aiError.type).toBe(ErrorType.AUTHENTICATION);
      expect(aiError.retryable).toBe(false);
    });

    test('should categorize 429 error as RATE_LIMIT', () => {
      const error = new Error('429 Too Many Requests');
      const aiError = handler.handleError(error, 'openrouter');
      expect(aiError.type).toBe(ErrorType.RATE_LIMIT);
      expect(aiError.retryable).toBe(true);
    });

    test('should categorize 500 error as SERVER_ERROR', () => {
      const error = new Error('500 Internal Server Error');
      const aiError = handler.handleError(error);
      expect(aiError.type).toBe(ErrorType.SERVER_ERROR);
      expect(aiError.retryable).toBe(true);
    });

    test('should categorize timeout error', () => {
      const error = new Error('timeout');
      const aiError = handler.handleError(error);
      expect(aiError.type).toBe(ErrorType.TIMEOUT);
      expect(aiError.retryable).toBe(true);
    });
  });

  describe('getErrorLog', () => {
    test('should return error log', () => {
      handler.handleError(new Error('test1'));
      handler.handleError(new Error('test2'));
      const log = handler.getErrorLog();
      expect(log.length).toBe(2);
    });

    test('should limit log size', () => {
      const log = handler.getErrorLog(1);
      expect(log.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getErrorsByType', () => {
    test('should filter errors by type', () => {
      handler.handleError(new Error('401 Unauthorized'));
      handler.handleError(new Error('429 Too Many'));
      const authErrors = handler.getErrorsByType(ErrorType.AUTHENTICATION);
      expect(authErrors.length).toBeGreaterThan(0);
    });
  });

  describe('getErrorsByProvider', () => {
    test('should filter errors by provider', () => {
      handler.handleError(new Error('test'), 'openrouter');
      handler.handleError(new Error('test'), 'openai');
      const orErrors = handler.getErrorsByProvider('openrouter');
      expect(orErrors.length).toBeGreaterThan(0);
    });
  });

  describe('getRetryableErrors', () => {
    test('should return only retryable errors', () => {
      handler.handleError(new Error('401 Unauthorized'));
      handler.handleError(new Error('429 Too Many'));
      const retryable = handler.getRetryableErrors();
      expect(retryable.every((e) => e.retryable)).toBe(true);
    });
  });

  describe('getStatistics', () => {
    test('should return error statistics', () => {
      handler.handleError(new Error('401 Unauthorized'));
      handler.handleError(new Error('429 Too Many'));
      const stats = handler.getStatistics();
      expect(stats.totalErrors).toBe(2);
      expect(Object.keys(stats.errorsByType).length).toBeGreaterThan(0);
    });
  });

  describe('shouldRetry', () => {
    test('should return true for retryable errors within limit', () => {
      const error = { type: ErrorType.RATE_LIMIT, retryable: true } as any;
      expect(handler.shouldRetry(error, 0, 3)).toBe(true);
    });

    test('should return false for non-retryable errors', () => {
      const error = { type: ErrorType.AUTHENTICATION, retryable: false } as any;
      expect(handler.shouldRetry(error, 0, 3)).toBe(false);
    });

    test('should return false when max attempts exceeded', () => {
      const error = { type: ErrorType.RATE_LIMIT, retryable: true } as any;
      expect(handler.shouldRetry(error, 3, 3)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    test('should calculate exponential backoff', () => {
      const delay0 = handler.getRetryDelay(0, 1000);
      const delay1 = handler.getRetryDelay(1, 1000);
      expect(delay1).toBeGreaterThan(delay0);
    });

    test('should include jitter', () => {
      const delays = [
        handler.getRetryDelay(1, 1000),
        handler.getRetryDelay(1, 1000),
      ];
      expect(delays[0]).not.toBe(delays[1]);
    });
  });

  describe('clearErrorLog', () => {
    test('should clear error log', () => {
      handler.handleError(new Error('test'));
      handler.clearErrorLog();
      const log = handler.getErrorLog();
      expect(log.length).toBe(0);
    });
  });

  describe('events', () => {
    test('should emit error:handled event', (done) => {
      handler.on('error:handled', (error) => {
        expect(error.message).toBeDefined();
        done();
      });
      handler.handleError(new Error('test'));
    });
  });
});

describe('RetryPolicy', () => {
  let policy: RetryPolicy;

  beforeEach(() => {
    policy = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
    });
  });

  describe('execute', () => {
    test('should execute function successfully on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await policy.execute(fn);
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');
      const result = await policy.execute(fn);
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should fail after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const result = await policy.execute(fn);
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should track total time', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await policy.execute(fn);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getConfig', () => {
    test('should return configuration', () => {
      const config = policy.getConfig();
      expect(config.maxAttempts).toBe(3);
      expect(config.baseDelay).toBe(10);
    });
  });

  describe('updateConfig', () => {
    test('should update configuration', () => {
      policy.updateConfig({ maxAttempts: 5 });
      const config = policy.getConfig();
      expect(config.maxAttempts).toBe(5);
    });
  });

  describe('calculateMaxTime', () => {
    test('should calculate maximum time', () => {
      const maxTime = policy.calculateMaxTime();
      expect(maxTime).toBeGreaterThan(0);
    });
  });

  describe('events', () => {
    test('should emit attempt:start event', (done) => {
      policy.on('attempt:start', (data) => {
        expect(data.attempt).toBe(1);
        done();
      });
      policy.execute(() => Promise.resolve('success'));
    });

    test('should emit attempt:success event', (done) => {
      policy.on('attempt:success', (data) => {
        expect(data.attempt).toBe(1);
        done();
      });
      policy.execute(() => Promise.resolve('success'));
    });

    test('should emit attempt:failed event', (done) => {
      policy.on('attempt:failed', (data) => {
        expect(data.attempt).toBe(1);
        done();
      });
      policy.execute(() => Promise.reject(new Error('fail')));
    });
  });
});
