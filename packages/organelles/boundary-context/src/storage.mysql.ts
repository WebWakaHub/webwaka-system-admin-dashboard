/**
 * BOUNDARY CONTEXT ORGANELLE — MySQL Storage Adapter
 * Code: ORG-TB-BOUNDARY_CONTEXT-v0.1.0
 * Phase: 3 — Implementation (P3-T02: Storage Interfaces)
 * Agent: webwakaagent4
 *
 * Implements BoundaryContextStorage port using MySQL/TiDB.
 * Schema defined in BOUNDARY_CONTEXT_ORGANELLE_DESIGN.md §3.2
 */

import type {
  BoundaryContextStorage,
  ContextRecord,
  ContextMapRecord,
  BoundaryViolationRecord,
  ContextStatus,
  ContextMapStatus,
  RelationshipType,
  ViolationType,
} from './index.js';

/**
 * Minimal database connection interface — compatible with mysql2, TiDB, and
 * any MySQL-compatible driver that supports parameterised queries.
 */
export interface DbConnection {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number }>;
}

export class MySQLBoundaryContextStorage implements BoundaryContextStorage {
  constructor(private readonly db: DbConnection) {}

  // ─── ContextRecord ──────────────────────────────────────────────────────────

  async findContextById(context_id: string): Promise<ContextRecord | null> {
    const rows = await this.db.query<ContextRecord>(
      'SELECT * FROM context_records WHERE context_id = ?',
      [context_id]
    );
    if (rows.length === 0) return null;
    return this.deserializeContext(rows[0] as any);
  }

  async findContextByName(context_name: string): Promise<ContextRecord | null> {
    const rows = await this.db.query<any>(
      'SELECT * FROM context_records WHERE context_name = ?',
      [context_name]
    );
    if (rows.length === 0) return null;
    return this.deserializeContext(rows[0]);
  }

  async listContexts(opts: {
    status_filter?: ContextStatus[];
    page: number;
    page_size: number;
  }): Promise<{ contexts: ContextRecord[]; total_count: number }> {
    const offset = (opts.page - 1) * opts.page_size;
    let where = '';
    const params: unknown[] = [];

    if (opts.status_filter && opts.status_filter.length > 0) {
      where = `WHERE status IN (${opts.status_filter.map(() => '?').join(',')})`;
      params.push(...opts.status_filter);
    }

    const countRows = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM context_records ${where}`,
      params
    );
    const total_count = countRows[0]?.total ?? 0;

    const rows = await this.db.query<any>(
      `SELECT * FROM context_records ${where} ORDER BY registered_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.page_size, offset]
    );

    return { contexts: rows.map(this.deserializeContext), total_count };
  }

  async insertContext(record: ContextRecord): Promise<void> {
    await this.db.execute(
      `INSERT INTO context_records
        (context_id, context_name, domain_scope, owned_aggregates, owned_events,
         version, status, registered_at, registered_by, updated_at, record_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.context_id,
        record.context_name,
        record.domain_scope,
        JSON.stringify(record.owned_aggregates),
        JSON.stringify(record.owned_events),
        record.version,
        record.status,
        record.registered_at,
        record.registered_by,
        record.updated_at,
        record.record_version,
      ]
    );
  }

  async updateContextStatus(
    context_id: string,
    new_status: ContextStatus,
    record_version: number,
    updated_at: number
  ): Promise<boolean> {
    // CON-BC-05: Optimistic concurrency — only update if record_version matches
    const result = await this.db.execute(
      `UPDATE context_records
         SET status = ?, updated_at = ?, record_version = record_version + 1
       WHERE context_id = ? AND record_version = ?`,
      [new_status, updated_at, context_id, record_version]
    );
    return result.affectedRows === 1;
  }

  async findActiveContextsOwningAggregate(aggregate_name: string): Promise<ContextRecord[]> {
    // JSON_CONTAINS for MySQL 5.7+ / TiDB
    const rows = await this.db.query<any>(
      `SELECT * FROM context_records
       WHERE status = 'ACTIVE'
         AND JSON_CONTAINS(owned_aggregates, ?)`,
      [JSON.stringify(aggregate_name)]
    );
    return rows.map(this.deserializeContext);
  }

  async findActiveContextsOwningEvent(event_name: string): Promise<ContextRecord[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM context_records
       WHERE status = 'ACTIVE'
         AND JSON_CONTAINS(owned_events, ?)`,
      [JSON.stringify(event_name)]
    );
    return rows.map(this.deserializeContext);
  }

  private deserializeContext(row: any): ContextRecord {
    return {
      ...row,
      owned_aggregates: typeof row.owned_aggregates === 'string'
        ? JSON.parse(row.owned_aggregates)
        : row.owned_aggregates,
      owned_events: typeof row.owned_events === 'string'
        ? JSON.parse(row.owned_events)
        : row.owned_events,
    };
  }

  // ─── ContextMapRecord ───────────────────────────────────────────────────────

  async findMapById(map_id: string): Promise<ContextMapRecord | null> {
    const rows = await this.db.query<any>(
      'SELECT * FROM context_maps WHERE map_id = ?',
      [map_id]
    );
    if (rows.length === 0) return null;
    return this.deserializeMap(rows[0]);
  }

  async findActiveMap(
    source: string,
    target: string,
    type: RelationshipType
  ): Promise<ContextMapRecord | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM context_maps
       WHERE source_context_id = ? AND target_context_id = ?
         AND relationship_type = ? AND status = 'ACTIVE'`,
      [source, target, type]
    );
    if (rows.length === 0) return null;
    return this.deserializeMap(rows[0]);
  }

  async listMaps(opts: {
    source_context_id?: string;
    target_context_id?: string;
    status_filter?: ContextMapStatus[];
    page: number;
    page_size: number;
  }): Promise<{ maps: ContextMapRecord[]; total_count: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (opts.source_context_id) { conditions.push('source_context_id = ?'); params.push(opts.source_context_id); }
    if (opts.target_context_id) { conditions.push('target_context_id = ?'); params.push(opts.target_context_id); }
    if (opts.status_filter?.length) {
      conditions.push(`status IN (${opts.status_filter.map(() => '?').join(',')})`);
      params.push(...opts.status_filter);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.page_size;

    const countRows = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM context_maps ${where}`, params
    );
    const total_count = countRows[0]?.total ?? 0;

    const rows = await this.db.query<any>(
      `SELECT * FROM context_maps ${where} ORDER BY declared_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.page_size, offset]
    );

    return { maps: rows.map(this.deserializeMap), total_count };
  }

  async insertMap(record: ContextMapRecord): Promise<void> {
    await this.db.execute(
      `INSERT INTO context_maps
        (map_id, source_context_id, target_context_id, relationship_type,
         integration_points, status, declared_at, declared_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.map_id,
        record.source_context_id,
        record.target_context_id,
        record.relationship_type,
        JSON.stringify(record.integration_points),
        record.status,
        record.declared_at,
        record.declared_by,
      ]
    );
  }

  async revokeMapsByContextId(context_id: string, revoked_at: number): Promise<number> {
    // Cascade revocation when a context is retired
    const result = await this.db.execute(
      `UPDATE context_maps SET status = 'REVOKED'
       WHERE (source_context_id = ? OR target_context_id = ?) AND status = 'ACTIVE'`,
      [context_id, context_id]
    );
    return result.affectedRows;
  }

  async updateMapStatus(map_id: string, new_status: ContextMapStatus): Promise<void> {
    await this.db.execute(
      'UPDATE context_maps SET status = ? WHERE map_id = ?',
      [new_status, map_id]
    );
  }

  private deserializeMap(row: any): ContextMapRecord {
    return {
      ...row,
      integration_points: typeof row.integration_points === 'string'
        ? JSON.parse(row.integration_points)
        : row.integration_points,
    };
  }

  // ─── BoundaryViolationRecord ────────────────────────────────────────────────

  async findViolationById(violation_id: string): Promise<BoundaryViolationRecord | null> {
    const rows = await this.db.query<BoundaryViolationRecord>(
      'SELECT * FROM boundary_violations WHERE violation_id = ?',
      [violation_id]
    );
    return rows[0] ?? null;
  }

  async insertViolation(record: BoundaryViolationRecord): Promise<void> {
    // INV-BC-08: This is the ONLY write operation on boundary_violations.
    // No UPDATE or DELETE is ever issued by this storage adapter.
    await this.db.execute(
      `INSERT INTO boundary_violations
        (violation_id, violating_context, target_context, violation_type,
         violation_detail, detected_at, detected_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        record.violation_id,
        record.violating_context,
        record.target_context,
        record.violation_type,
        record.violation_detail,
        record.detected_at,
        record.detected_by,
      ]
    );
  }

  async listViolations(opts: {
    violating_context_id?: string;
    target_context_id?: string;
    violation_type?: ViolationType;
    from_timestamp?: number;
    to_timestamp?: number;
    page: number;
    page_size: number;
  }): Promise<{ violations: BoundaryViolationRecord[]; total_count: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (opts.violating_context_id) { conditions.push('violating_context = ?'); params.push(opts.violating_context_id); }
    if (opts.target_context_id) { conditions.push('target_context = ?'); params.push(opts.target_context_id); }
    if (opts.violation_type) { conditions.push('violation_type = ?'); params.push(opts.violation_type); }
    if (opts.from_timestamp) { conditions.push('detected_at >= ?'); params.push(opts.from_timestamp); }
    if (opts.to_timestamp) { conditions.push('detected_at <= ?'); params.push(opts.to_timestamp); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.page_size;

    const countRows = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM boundary_violations ${where}`, params
    );
    const total_count = countRows[0]?.total ?? 0;

    const rows = await this.db.query<BoundaryViolationRecord>(
      `SELECT * FROM boundary_violations ${where} ORDER BY detected_at DESC LIMIT ? OFFSET ?`,
      [...params, opts.page_size, offset]
    );

    return { violations: rows, total_count };
  }
}
