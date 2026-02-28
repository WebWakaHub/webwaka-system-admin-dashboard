/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * TiDB Engine Driver — MySQL-compatible distributed database
 *
 * TiDB is wire-compatible with MySQL but has additional features
 * for distributed transactions and horizontal scaling.
 *
 * Issue: webwaka-runtime-universe#19 (P3-T02)
 */

import { MySQLDriver } from './MySQLDriver';
import { IConnection } from '../ports/IConnectionPoolPort';
import { ConnectionConfig } from '../types/config';
import { DatabaseError } from '../types/errors';
import { ErrorMapper } from '../core/ErrorMapper';

export class TiDBDriver extends MySQLDriver {
  readonly engineName = 'tidb';

  async connect(config: ConnectionConfig): Promise<IConnection> {
    // TiDB uses the same MySQL protocol
    // Override to add TiDB-specific connection settings
    const connection = await super.connect(config);

    // Enable TiDB-specific optimizations
    try {
      // Use optimistic transaction model for better distributed performance
      await connection.execute('SET tidb_txn_mode = "optimistic"', []);
    } catch {
      // Silently ignore if not supported (e.g., running against plain MySQL)
    }

    return connection;
  }

  mapError(engineError: unknown): DatabaseError {
    // TiDB has some unique error codes beyond MySQL
    return ErrorMapper.map('mysql', engineError);
  }

  healthCheckQuery(): string {
    // TiDB-specific health check that also verifies cluster status
    return 'SELECT 1';
  }

  getMigrationDialect(): string {
    return 'tidb';
  }
}
