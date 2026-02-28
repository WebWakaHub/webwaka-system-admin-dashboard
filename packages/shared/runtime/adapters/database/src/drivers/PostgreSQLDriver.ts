/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * PostgreSQL Engine Driver
 *
 * Issue: webwaka-runtime-universe#19 (P3-T02)
 */

import { IEngineDriver, EngineQuery } from '../ports/IEngineDriver';
import { IConnection } from '../ports/IConnectionPoolPort';
import { ConnectionConfig } from '../types/config';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';
import { ErrorMapper } from '../core/ErrorMapper';

class PostgreSQLConnection implements IConnection {
  readonly id: string;
  readonly engine = 'postgresql';
  readonly createdAt: number;
  lastUsedAt: number;
  private client: unknown;

  constructor(id: string, client: unknown) {
    this.id = id;
    this.client = client;
    this.createdAt = Date.now();
    this.lastUsedAt = Date.now();
  }

  async execute<T>(sql: string, params: unknown[]): Promise<T[]> {
    this.lastUsedAt = Date.now();
    try {
      // pg client.query returns { rows: T[] }
      const result = await (this.client as any).query(sql, params);
      return result.rows as T[];
    } catch (error) {
      throw ErrorMapper.map('postgresql', error);
    }
  }

  async isAlive(): Promise<boolean> {
    try {
      await this.execute('SELECT 1', []);
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      await (this.client as any).end?.();
    } catch {
      // Swallow close errors
    }
  }
}

export class PostgreSQLDriver implements IEngineDriver {
  readonly engineName = 'postgresql';

  async connect(config: ConnectionConfig): Promise<IConnection> {
    try {
      // Dynamic import to avoid hard dependency
      const { Client } = await import('pg');
      const password = config.passwordRef
        ? process.env[config.passwordRef]
        : undefined;

      const client = new Client({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.username,
        password,
        ssl: config.tls?.enabled
          ? { rejectUnauthorized: config.tls.rejectUnauthorized }
          : undefined,
      });

      await client.connect();
      const id = `pg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return new PostgreSQLConnection(id, client);
    } catch (error) {
      throw ErrorMapper.map('postgresql', error);
    }
  }

  compileQuery(abstract: Record<string, unknown>): EngineQuery {
    // Compile abstract query to PostgreSQL-specific SQL
    // Uses $1, $2, ... parameter placeholders
    const { table, operation, where, orderBy, limit, offset } = abstract;
    const params: unknown[] = [];
    let paramIndex = 1;

    let sql = '';

    switch (operation) {
      case 'SELECT':
        sql = `SELECT * FROM "${table}"`;
        break;
      case 'INSERT':
        const insertData = abstract.data as Record<string, unknown>;
        const columns = Object.keys(insertData);
        const values = columns.map((col) => {
          params.push(insertData[col]);
          return `$${paramIndex++}`;
        });
        sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
        break;
      case 'UPDATE':
        const updateData = abstract.data as Record<string, unknown>;
        const setClauses = Object.keys(updateData).map((col) => {
          params.push(updateData[col]);
          return `"${col}" = $${paramIndex++}`;
        });
        sql = `UPDATE "${table}" SET ${setClauses.join(', ')}`;
        break;
      case 'DELETE':
        sql = `UPDATE "${table}" SET "deleted_at" = NOW()`;
        break;
      case 'COUNT':
        sql = `SELECT COUNT(*) as count FROM "${table}"`;
        break;
      default:
        throw new DatabaseError(
          DatabaseErrorCode.VALIDATION_ERROR,
          `Unknown operation: ${operation}`,
        );
    }

    // Append WHERE clause
    if (where && typeof where === 'object') {
      const whereParts = this.compileWhere(where as Record<string, unknown>, params, paramIndex);
      if (whereParts.sql) {
        sql += ` WHERE ${whereParts.sql}`;
        paramIndex = whereParts.paramIndex;
      }
    }

    // Append ORDER BY
    if (orderBy && Array.isArray(orderBy)) {
      const orderParts = orderBy.map(
        (o: any) => `"${o.field}" ${o.direction === 'desc' ? 'DESC' : 'ASC'}`,
      );
      sql += ` ORDER BY ${orderParts.join(', ')}`;
    }

    // Append LIMIT/OFFSET
    if (limit) {
      params.push(limit);
      sql += ` LIMIT $${paramIndex++}`;
    }
    if (offset) {
      params.push(offset);
      sql += ` OFFSET $${paramIndex++}`;
    }

    return { sql, params };
  }

  private compileWhere(
    where: Record<string, unknown>,
    params: unknown[],
    paramIndex: number,
  ): { sql: string; paramIndex: number } {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(where)) {
      if (key === 'AND' && Array.isArray(value)) {
        const subParts = value.map((sub: any) => {
          const result = this.compileWhere(sub, params, paramIndex);
          paramIndex = result.paramIndex;
          return `(${result.sql})`;
        });
        parts.push(subParts.join(' AND '));
      } else if (key === 'OR' && Array.isArray(value)) {
        const subParts = value.map((sub: any) => {
          const result = this.compileWhere(sub, params, paramIndex);
          paramIndex = result.paramIndex;
          return `(${result.sql})`;
        });
        parts.push(`(${subParts.join(' OR ')})`);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const filter = value as Record<string, unknown>;
        for (const [op, val] of Object.entries(filter)) {
          switch (op) {
            case 'eq':
              params.push(val);
              parts.push(`"${key}" = $${paramIndex++}`);
              break;
            case 'neq':
              params.push(val);
              parts.push(`"${key}" != $${paramIndex++}`);
              break;
            case 'gt':
              params.push(val);
              parts.push(`"${key}" > $${paramIndex++}`);
              break;
            case 'gte':
              params.push(val);
              parts.push(`"${key}" >= $${paramIndex++}`);
              break;
            case 'lt':
              params.push(val);
              parts.push(`"${key}" < $${paramIndex++}`);
              break;
            case 'lte':
              params.push(val);
              parts.push(`"${key}" <= $${paramIndex++}`);
              break;
            case 'in':
              params.push(val);
              parts.push(`"${key}" = ANY($${paramIndex++})`);
              break;
            case 'contains':
              params.push(`%${val}%`);
              parts.push(`"${key}" ILIKE $${paramIndex++}`);
              break;
            case 'startsWith':
              params.push(`${val}%`);
              parts.push(`"${key}" ILIKE $${paramIndex++}`);
              break;
            case 'isNull':
              parts.push(val ? `"${key}" IS NULL` : `"${key}" IS NOT NULL`);
              break;
          }
        }
      } else {
        // Direct equality
        params.push(value);
        parts.push(`"${key}" = $${paramIndex++}`);
      }
    }

    return { sql: parts.join(' AND '), paramIndex };
  }

  mapError(engineError: unknown): DatabaseError {
    return ErrorMapper.map('postgresql', engineError);
  }

  healthCheckQuery(): string {
    return 'SELECT 1';
  }

  getMigrationDialect(): string {
    return 'postgresql';
  }
}
