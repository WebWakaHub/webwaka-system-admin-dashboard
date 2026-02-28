/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * SQLite Engine Driver — Mobile-First, Offline-First
 *
 * Issue: webwaka-runtime-universe#19 (P3-T02)
 */

import { IEngineDriver, EngineQuery } from '../ports/IEngineDriver';
import { IConnection } from '../ports/IConnectionPoolPort';
import { ConnectionConfig } from '../types/config';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';
import { ErrorMapper } from '../core/ErrorMapper';

class SQLiteConnection implements IConnection {
  readonly id: string;
  readonly engine = 'sqlite';
  readonly createdAt: number;
  lastUsedAt: number;
  private db: unknown;

  constructor(id: string, db: unknown) {
    this.id = id;
    this.db = db;
    this.createdAt = Date.now();
    this.lastUsedAt = Date.now();
  }

  async execute<T>(sql: string, params: unknown[]): Promise<T[]> {
    this.lastUsedAt = Date.now();
    try {
      const stmt = (this.db as any).prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT') || sql.includes('RETURNING')) {
        return stmt.all(...params) as T[];
      } else {
        stmt.run(...params);
        return [] as T[];
      }
    } catch (error) {
      throw ErrorMapper.map('sqlite', error);
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
      (this.db as any).close?.();
    } catch {
      // Swallow close errors
    }
  }
}

export class SQLiteDriver implements IEngineDriver {
  readonly engineName = 'sqlite';

  async connect(config: ConnectionConfig): Promise<IConnection> {
    try {
      const Database = (await import('better-sqlite3')).default;
      const db = new Database(config.database, {
        // WAL mode for better concurrent read performance
        // Critical for offline-first mobile usage
      });

      // Enable WAL mode for concurrent reads
      db.pragma('journal_mode = WAL');
      // Enable foreign keys
      db.pragma('foreign_keys = ON');

      const id = `sqlite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return new SQLiteConnection(id, db);
    } catch (error) {
      throw ErrorMapper.map('sqlite', error);
    }
  }

  compileQuery(abstract: Record<string, unknown>): EngineQuery {
    const { table, operation, where, orderBy, limit, offset } = abstract;
    const params: unknown[] = [];

    let sql = '';

    switch (operation) {
      case 'SELECT':
        sql = `SELECT * FROM "${table}"`;
        break;
      case 'INSERT':
        const insertData = abstract.data as Record<string, unknown>;
        const columns = Object.keys(insertData);
        const placeholders = columns.map(() => '?');
        columns.forEach((col) => params.push(insertData[col]));
        sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`;
        break;
      case 'UPDATE':
        const updateData = abstract.data as Record<string, unknown>;
        const setClauses = Object.keys(updateData).map((col) => {
          params.push(updateData[col]);
          return `"${col}" = ?`;
        });
        sql = `UPDATE "${table}" SET ${setClauses.join(', ')}`;
        break;
      case 'DELETE':
        sql = `UPDATE "${table}" SET "deleted_at" = datetime('now')`;
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
      const whereParts = this.compileWhere(where as Record<string, unknown>, params);
      if (whereParts) {
        sql += ` WHERE ${whereParts}`;
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
      sql += ` LIMIT ?`;
    }
    if (offset) {
      params.push(offset);
      sql += ` OFFSET ?`;
    }

    return { sql, params };
  }

  private compileWhere(where: Record<string, unknown>, params: unknown[]): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(where)) {
      if (key === 'AND' && Array.isArray(value)) {
        const subParts = value.map((sub: any) => `(${this.compileWhere(sub, params)})`);
        parts.push(subParts.join(' AND '));
      } else if (key === 'OR' && Array.isArray(value)) {
        const subParts = value.map((sub: any) => `(${this.compileWhere(sub, params)})`);
        parts.push(`(${subParts.join(' OR ')})`);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const filter = value as Record<string, unknown>;
        for (const [op, val] of Object.entries(filter)) {
          switch (op) {
            case 'eq':
              params.push(val);
              parts.push(`"${key}" = ?`);
              break;
            case 'neq':
              params.push(val);
              parts.push(`"${key}" != ?`);
              break;
            case 'gt':
              params.push(val);
              parts.push(`"${key}" > ?`);
              break;
            case 'gte':
              params.push(val);
              parts.push(`"${key}" >= ?`);
              break;
            case 'lt':
              params.push(val);
              parts.push(`"${key}" < ?`);
              break;
            case 'lte':
              params.push(val);
              parts.push(`"${key}" <= ?`);
              break;
            case 'in':
              const arr = val as unknown[];
              const inPlaceholders = arr.map(() => '?').join(', ');
              arr.forEach((v) => params.push(v));
              parts.push(`"${key}" IN (${inPlaceholders})`);
              break;
            case 'contains':
              params.push(`%${val}%`);
              parts.push(`"${key}" LIKE ?`);
              break;
            case 'startsWith':
              params.push(`${val}%`);
              parts.push(`"${key}" LIKE ?`);
              break;
            case 'isNull':
              parts.push(val ? `"${key}" IS NULL` : `"${key}" IS NOT NULL`);
              break;
          }
        }
      } else {
        params.push(value);
        parts.push(`"${key}" = ?`);
      }
    }

    return parts.join(' AND ');
  }

  mapError(engineError: unknown): DatabaseError {
    return ErrorMapper.map('sqlite', engineError);
  }

  healthCheckQuery(): string {
    return 'SELECT 1';
  }

  getMigrationDialect(): string {
    return 'sqlite';
  }
}
