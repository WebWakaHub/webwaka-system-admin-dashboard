/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * IConnectionPoolPort — Connection Lifecycle Contract
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { ExecutionContext, PoolStats } from '../types/context';

/**
 * Represents a single database connection.
 */
export interface IConnection {
  readonly id: string;
  readonly engine: string;
  readonly createdAt: number;
  readonly lastUsedAt: number;

  /**
   * Execute a raw parameterized query.
   * Only used internally by engine drivers — never exposed to consumers.
   */
  execute<T>(sql: string, params: unknown[]): Promise<T[]>;

  /**
   * Check if the connection is still alive.
   */
  isAlive(): Promise<boolean>;

  /**
   * Close the connection.
   */
  close(): Promise<void>;
}

/**
 * Connection pool management port.
 */
export interface IConnectionPoolPort {
  /**
   * Acquire a connection from the pool.
   * Blocks until available or timeout.
   */
  acquire(context: ExecutionContext): Promise<IConnection>;

  /**
   * Release a connection back to the pool.
   */
  release(connection: IConnection): Promise<void>;

  /**
   * Get current pool statistics.
   */
  getStats(): PoolStats;

  /**
   * Gracefully drain the pool (for shutdown).
   */
  drain(): Promise<void>;

  /**
   * Destroy the pool and all connections.
   */
  destroy(): Promise<void>;
}
