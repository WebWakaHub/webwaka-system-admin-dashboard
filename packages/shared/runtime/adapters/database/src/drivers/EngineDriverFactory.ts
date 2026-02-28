/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * EngineDriverFactory — Strategy pattern for engine selection
 *
 * Issue: webwaka-runtime-universe#19 (P3-T02)
 */

import { IEngineDriver } from '../ports/IEngineDriver';
import { DatabaseEngine } from '../types/config';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';
import { PostgreSQLDriver } from './PostgreSQLDriver';
import { SQLiteDriver } from './SQLiteDriver';
import { MySQLDriver } from './MySQLDriver';
import { TiDBDriver } from './TiDBDriver';

/**
 * Factory for creating engine-specific drivers.
 * Engine selection is determined at startup from configuration.
 */
export class EngineDriverFactory {
  private static readonly drivers: Record<DatabaseEngine, () => IEngineDriver> = {
    postgresql: () => new PostgreSQLDriver(),
    sqlite: () => new SQLiteDriver(),
    mysql: () => new MySQLDriver(),
    tidb: () => new TiDBDriver(),
  };

  /**
   * Create an engine driver based on the configured engine type.
   * @throws DatabaseError if engine is not supported
   */
  static create(engine: DatabaseEngine): IEngineDriver {
    const factory = EngineDriverFactory.drivers[engine];

    if (!factory) {
      throw new DatabaseError(
        DatabaseErrorCode.VALIDATION_ERROR,
        `Unsupported database engine: ${engine}. Supported engines: ${Object.keys(EngineDriverFactory.drivers).join(', ')}`,
      );
    }

    return factory();
  }

  /**
   * Get list of supported engines.
   */
  static getSupportedEngines(): DatabaseEngine[] {
    return Object.keys(EngineDriverFactory.drivers) as DatabaseEngine[];
  }
}
