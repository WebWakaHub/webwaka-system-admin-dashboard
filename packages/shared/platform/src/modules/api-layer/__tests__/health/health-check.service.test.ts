/**
 * Unit Tests for Health Check Service
 * 
 * Tests health monitoring and dependency checks.
 */

import { HealthCheckService } from '../../health/health-check.service';

describe('HealthCheckService', () => {
  let healthCheck: HealthCheckService;

  beforeEach(() => {
    healthCheck = new HealthCheckService();
  });

  describe('registerCheck', () => {
    it('should register a health check', () => {
      const check = jest.fn().mockResolvedValue({
        status: 'healthy',
        message: 'Service is healthy',
      });

      healthCheck.registerCheck('test-service', check);

      // Check should be registered (verified by checkHealth)
      expect(check).not.toHaveBeenCalled();
    });
  });

  describe('checkHealth', () => {
    it('should return healthy when all checks pass', async () => {
      healthCheck.registerCheck('service1', async () => ({
        status: 'healthy',
        message: 'Service 1 is healthy',
      }));

      healthCheck.registerCheck('service2', async () => ({
        status: 'healthy',
        message: 'Service 2 is healthy',
      }));

      const result = await healthCheck.checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.checks.service1.status).toBe('healthy');
      expect(result.checks.service2.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded when some checks are degraded', async () => {
      healthCheck.registerCheck('service1', async () => ({
        status: 'healthy',
      }));

      healthCheck.registerCheck('service2', async () => ({
        status: 'degraded',
        message: 'Service 2 is slow',
      }));

      const result = await healthCheck.checkHealth();

      expect(result.status).toBe('degraded');
      expect(result.checks.service2.status).toBe('degraded');
    });

    it('should return unhealthy when any check is unhealthy', async () => {
      healthCheck.registerCheck('service1', async () => ({
        status: 'healthy',
      }));

      healthCheck.registerCheck('service2', async () => ({
        status: 'unhealthy',
        message: 'Service 2 is down',
      }));

      const result = await healthCheck.checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.service2.status).toBe('unhealthy');
    });

    it('should handle check failures', async () => {
      healthCheck.registerCheck('failing-service', async () => {
        throw new Error('Check failed');
      });

      const result = await healthCheck.checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.checks['failing-service'].status).toBe('unhealthy');
      expect(result.checks['failing-service'].message).toContain('Check failed');
    });

    it('should return healthy with no checks registered', async () => {
      const result = await healthCheck.checkHealth();

      expect(result.status).toBe('healthy');
      expect(Object.keys(result.checks)).toHaveLength(0);
    });
  });

  describe('checkReadiness', () => {
    it('should return true when healthy', async () => {
      healthCheck.registerCheck('service', async () => ({
        status: 'healthy',
      }));

      const ready = await healthCheck.checkReadiness();

      expect(ready).toBe(true);
    });

    it('should return true when degraded', async () => {
      healthCheck.registerCheck('service', async () => ({
        status: 'degraded',
      }));

      const ready = await healthCheck.checkReadiness();

      expect(ready).toBe(true);
    });

    it('should return false when unhealthy', async () => {
      healthCheck.registerCheck('service', async () => ({
        status: 'unhealthy',
      }));

      const ready = await healthCheck.checkReadiness();

      expect(ready).toBe(false);
    });
  });

  describe('checkLiveness', () => {
    it('should always return true', () => {
      const alive = healthCheck.checkLiveness();

      expect(alive).toBe(true);
    });
  });

  describe('getDefaultChecks', () => {
    it('should return default health checks', () => {
      const checks = HealthCheckService.getDefaultChecks();

      expect(checks.has('database')).toBe(true);
      expect(checks.has('redis')).toBe(true);
      expect(checks.has('weeg')).toBe(true);
    });

    it('should have working database check', async () => {
      const checks = HealthCheckService.getDefaultChecks();
      const dbCheck = checks.get('database');

      expect(dbCheck).toBeDefined();
      const result = await dbCheck!();
      expect(result.status).toBeDefined();
    });

    it('should have working redis check', async () => {
      const checks = HealthCheckService.getDefaultChecks();
      const redisCheck = checks.get('redis');

      expect(redisCheck).toBeDefined();
      const result = await redisCheck!();
      expect(result.status).toBeDefined();
    });

    it('should have working weeg check', async () => {
      const checks = HealthCheckService.getDefaultChecks();
      const weegCheck = checks.get('weeg');

      expect(weegCheck).toBeDefined();
      const result = await weegCheck!();
      expect(result.status).toBeDefined();
    });
  });
});
