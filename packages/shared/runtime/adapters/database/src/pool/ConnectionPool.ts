/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * ConnectionPool — Connection lifecycle management with tenant isolation
 *
 * Issue: webwaka-runtime-universe#20 (P3-T03)
 */

import { IConnectionPoolPort, IConnection } from '../ports/IConnectionPoolPort';
import { IEngineDriver } from '../ports/IEngineDriver';
import { ExecutionContext, PoolStats } from '../types/context';
import { PoolConfig, ConnectionConfig } from '../types/config';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';
import { CircuitBreaker } from '../core/CircuitBreaker';

export class ConnectionPool implements IConnectionPoolPort {
  private idle: IConnection[] = [];
  private active: Set<IConnection> = new Set();
  private waiting: Array<{
    resolve: (conn: IConnection) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];
  private readonly driver: IEngineDriver;
  private readonly config: PoolConfig;
  private readonly connectionConfig: ConnectionConfig;
  private readonly circuitBreaker: CircuitBreaker;
  private draining: boolean = false;
  private validationTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    driver: IEngineDriver,
    poolConfig: PoolConfig,
    connectionConfig: ConnectionConfig,
    circuitBreaker: CircuitBreaker,
  ) {
    this.driver = driver;
    this.config = poolConfig;
    this.connectionConfig = connectionConfig;
    this.circuitBreaker = circuitBreaker;
  }

  /**
   * Initialize the pool with minimum connections.
   */
  async initialize(): Promise<void> {
    for (let i = 0; i < this.config.minConnections; i++) {
      try {
        const conn = await this.createConnection();
        this.idle.push(conn);
      } catch (error) {
        // Log but don't fail — pool can start with fewer connections
        console.warn(`Failed to create initial connection ${i + 1}: ${error}`);
      }
    }

    // Start validation interval
    this.validationTimer = setInterval(
      () => this.validateConnections(),
      this.config.validationInterval,
    );
  }

  async acquire(context: ExecutionContext): Promise<IConnection> {
    if (this.draining) {
      throw new DatabaseError(
        DatabaseErrorCode.POOL_EXHAUSTED,
        'Connection pool is draining. No new connections can be acquired.',
      );
    }

    // Try to get an idle connection
    while (this.idle.length > 0) {
      const conn = this.idle.pop()!;

      // Check if connection is still alive
      if (await conn.isAlive()) {
        this.active.add(conn);
        return conn;
      } else {
        // Dead connection — discard
        await conn.close();
      }
    }

    // No idle connections — try to create a new one
    const totalConnections = this.idle.length + this.active.size;
    if (totalConnections < this.config.maxConnections) {
      try {
        const conn = await this.circuitBreaker.execute(() =>
          this.createConnection(),
        );
        this.active.add(conn);
        return conn;
      } catch (error) {
        // Fall through to waiting queue
      }
    }

    // Pool exhausted — wait in queue
    return new Promise<IConnection>((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waiting.findIndex((w) => w.resolve === resolve);
        if (idx !== -1) this.waiting.splice(idx, 1);
        reject(
          new DatabaseError(
            DatabaseErrorCode.POOL_EXHAUSTED,
            `Connection acquire timeout after ${this.config.acquireTimeout}ms`,
            undefined,
            { activeConnections: this.active.size, idleConnections: this.idle.length },
          ),
        );
      }, this.config.acquireTimeout);

      this.waiting.push({ resolve, reject, timer });
    });
  }

  async release(connection: IConnection): Promise<void> {
    this.active.delete(connection);

    // Check if connection has exceeded max lifetime
    if (Date.now() - connection.createdAt > this.config.maxLifetime) {
      await connection.close();
      return;
    }

    // Check if there are waiting requests
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      clearTimeout(waiter.timer);
      this.active.add(connection);
      waiter.resolve(connection);
      return;
    }

    // Return to idle pool
    this.idle.push(connection);
  }

  getStats(): PoolStats {
    return {
      totalConnections: this.idle.length + this.active.size,
      activeConnections: this.active.size,
      idleConnections: this.idle.length,
      waitingRequests: this.waiting.length,
      acquireLatency_ms: 0, // Would need tracking
    };
  }

  async drain(): Promise<void> {
    this.draining = true;

    // Stop validation
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }

    // Reject all waiting requests
    for (const waiter of this.waiting) {
      clearTimeout(waiter.timer);
      waiter.reject(
        new DatabaseError(
          DatabaseErrorCode.POOL_EXHAUSTED,
          'Pool is draining',
        ),
      );
    }
    this.waiting = [];

    // Wait for active connections to be released (max 30s)
    const drainTimeout = 30000;
    const startTime = Date.now();
    while (this.active.size > 0 && Date.now() - startTime < drainTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Close all connections
    await this.destroy();
  }

  async destroy(): Promise<void> {
    // Close idle connections
    for (const conn of this.idle) {
      await conn.close();
    }
    this.idle = [];

    // Force close active connections
    for (const conn of this.active) {
      await conn.close();
    }
    this.active.clear();
  }

  private async createConnection(): Promise<IConnection> {
    return this.driver.connect(this.connectionConfig);
  }

  private async validateConnections(): Promise<void> {
    const toRemove: IConnection[] = [];

    for (const conn of this.idle) {
      // Check idle timeout
      if (
        Date.now() - conn.lastUsedAt > this.config.idleTimeout &&
        this.idle.length > this.config.minConnections
      ) {
        toRemove.push(conn);
        continue;
      }

      // Check if alive
      if (!(await conn.isAlive())) {
        toRemove.push(conn);
      }
    }

    for (const conn of toRemove) {
      const idx = this.idle.indexOf(conn);
      if (idx !== -1) {
        this.idle.splice(idx, 1);
        await conn.close();
      }
    }
  }
}
