/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * IEngineDriver — Engine-Specific Driver Contract
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { ConnectionConfig } from '../types/config';
import { IConnection } from './IConnectionPoolPort';
import { DatabaseError } from '../types/errors';

/**
 * Engine-specific query representation.
 */
export interface EngineQuery {
  sql: string;
  params: unknown[];
}

/**
 * Engine driver interface — Strategy pattern.
 * Each supported database engine implements this interface.
 */
export interface IEngineDriver {
  readonly engineName: string;

  /**
   * Create a new connection to the database.
   */
  connect(config: ConnectionConfig): Promise<IConnection>;

  /**
   * Compile an abstract query into engine-specific SQL.
   */
  compileQuery(abstract: Record<string, unknown>): EngineQuery;

  /**
   * Map an engine-specific error to a canonical DatabaseError.
   */
  mapError(engineError: unknown): DatabaseError;

  /**
   * Execute a health check query.
   */
  healthCheckQuery(): string;

  /**
   * Get the engine-specific migration dialect.
   */
  getMigrationDialect(): string;
}
