/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * HealthMonitor — Database health monitoring
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { DatabaseHealthStatus, PoolStats } from '../types/context';
import { IConnectionPoolPort, IConnection } from '../ports/IConnectionPoolPort';
import { IEngineDriver } from '../ports/IEngineDriver';
import { ExecutionContext } from '../types/context';

export class HealthMonitor {
  private readonly pool: IConnectionPoolPort;
  private readonly driver: IEngineDriver;
  private lastStatus: DatabaseHealthStatus | null = null;

  constructor(pool: IConnectionPoolPort, driver: IEngineDriver) {
    this.pool = pool;
    this.driver = driver;
  }

  /**
   * Perform a health check against the database.
   */
  async check(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now();
    const poolStats = this.pool.getStats();

    const systemContext: ExecutionContext = {
      tenantId: '__system__',
      correlationId: `health-${Date.now()}`,
      actorId: 'health-monitor',
      actorType: 'system',
      timestamp: new Date().toISOString(),
    };

    let connection: IConnection | null = null;

    try {
      connection = await this.pool.acquire(systemContext);
      const healthQuery = this.driver.healthCheckQuery();
      await connection.execute(healthQuery, []);
      const latency = Date.now() - startTime;

      this.lastStatus = {
        status: latency > 5000 ? 'degraded' : 'healthy',
        engine: this.driver.engineName,
        latency_ms: latency,
        activeConnections: poolStats.activeConnections,
        idleConnections: poolStats.idleConnections,
        lastCheckedAt: new Date().toISOString(),
      };

      return this.lastStatus;
    } catch (error) {
      const latency = Date.now() - startTime;

      this.lastStatus = {
        status: 'unhealthy',
        engine: this.driver.engineName,
        latency_ms: latency,
        activeConnections: poolStats.activeConnections,
        idleConnections: poolStats.idleConnections,
        lastCheckedAt: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };

      return this.lastStatus;
    } finally {
      if (connection) {
        await this.pool.release(connection);
      }
    }
  }

  /**
   * Get the last cached health status without performing a new check.
   */
  getLastStatus(): DatabaseHealthStatus | null {
    return this.lastStatus;
  }
}
