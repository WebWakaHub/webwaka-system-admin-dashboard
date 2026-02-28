/**
 * Content Entry Service
 * 
 * Manages content entries (actual content data)
 */

import {
  ContentEntry,
  ContentStatus,
  ContentQueryOptions,
  ContentQueryResult,
  HeadlessCMSConfig,
  ContentEventType,
  ContentEventPayload,
} from '../types';
import {
  EntryNotFoundError,
  ModelNotFoundError,
  ValidationError,
  PermissionDeniedError,
} from '../errors';
import { ContentModelService } from './ContentModelService';

export class ContentEntryService {
  private config: HeadlessCMSConfig;
  private modelService: ContentModelService;

  constructor(config: HeadlessCMSConfig) {
    this.config = config;
    this.modelService = new ContentModelService(config);
  }

  /**
   * Create a new content entry
   */
  async createEntry(
    tenantId: string,
    userId: string,
    modelId: string,
    data: Record<string, any>,
    status: ContentStatus = ContentStatus.DRAFT
  ): Promise<ContentEntry> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.entry.create'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('create', 'content entry');
    }

    // Verify model exists and get it
    const model = await this.modelService.getModel(tenantId, modelId);

    // Validate entry data against model
    this.validateEntryData(model.fields, data);

    // Insert entry
    const result = await database.query(
      `INSERT INTO content_entries (tenant_id, model_id, data, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, modelId, JSON.stringify(data), status, userId, userId]
    );

    const entry = this.mapRowToEntry(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.ENTRY_CREATED,
      tenantId,
      modelId,
      entryId: entry.id,
      userId,
      timestamp: new Date(),
      data: entry,
    });

    return entry;
  }

  /**
   * Get a content entry by ID
   */
  async getEntry(
    tenantId: string,
    entryId: string
  ): Promise<ContentEntry> {
    const { database } = this.config;

    const result = await database.query(
      'SELECT * FROM content_entries WHERE id = $1 AND tenant_id = $2',
      [entryId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new EntryNotFoundError(entryId);
    }

    return this.mapRowToEntry(result.rows[0]);
  }

  /**
   * Query content entries
   */
  async queryEntries(
    tenantId: string,
    modelId: string,
    options: ContentQueryOptions = {}
  ): Promise<ContentQueryResult<ContentEntry>> {
    const { database } = this.config;

    // Build query
    const conditions: string[] = ['tenant_id = $1', 'model_id = $2'];
    const values: any[] = [tenantId, modelId];
    let paramIndex = 3;

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (key === 'status') {
          conditions.push(`status = $${paramIndex++}`);
          values.push(value);
        } else {
          // Filter by data field
          conditions.push(`data->>'${key}' = $${paramIndex++}`);
          values.push(value);
        }
      }
    }

    // Build ORDER BY clause
    let orderBy = 'created_at DESC';
    if (options.sort && options.sort.length > 0) {
      const sortClauses = options.sort.map((s) => {
        if (s.field === 'createdAt') return `created_at ${s.order.toUpperCase()}`;
        if (s.field === 'updatedAt') return `updated_at ${s.order.toUpperCase()}`;
        return `data->>'${s.field}' ${s.order.toUpperCase()}`;
      });
      orderBy = sortClauses.join(', ');
    }

    // Get total count
    const countResult = await database.query(
      `SELECT COUNT(*) as total FROM content_entries WHERE ${conditions.join(' AND ')}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    // Get entries
    const result = await database.query(
      `SELECT * FROM content_entries 
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    const data = result.rows.map((row: any) => this.mapRowToEntry(row));

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Update a content entry
   */
  async updateEntry(
    tenantId: string,
    userId: string,
    entryId: string,
    data: Record<string, any>
  ): Promise<ContentEntry> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.entry.update'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('update', 'content entry');
    }

    // Get existing entry
    const existingEntry = await this.getEntry(tenantId, entryId);

    // Get model to validate data
    const model = await this.modelService.getModel(tenantId, existingEntry.modelId);

    // Validate entry data against model
    this.validateEntryData(model.fields, data);

    // Update entry
    const result = await database.query(
      `UPDATE content_entries 
       SET data = $1, updated_by = $2, updated_at = NOW(), version = version + 1
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [JSON.stringify(data), userId, entryId, tenantId]
    );

    const entry = this.mapRowToEntry(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.ENTRY_UPDATED,
      tenantId,
      modelId: entry.modelId,
      entryId: entry.id,
      userId,
      timestamp: new Date(),
      data: entry,
    });

    return entry;
  }

  /**
   * Publish a content entry
   */
  async publishEntry(
    tenantId: string,
    userId: string,
    entryId: string
  ): Promise<ContentEntry> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.entry.publish'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('publish', 'content entry');
    }

    // Get existing entry
    const existingEntry = await this.getEntry(tenantId, entryId);

    // Update status to published
    const result = await database.query(
      `UPDATE content_entries 
       SET status = $1, published_at = NOW(), updated_by = $2, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [ContentStatus.PUBLISHED, userId, entryId, tenantId]
    );

    const entry = this.mapRowToEntry(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.ENTRY_PUBLISHED,
      tenantId,
      modelId: entry.modelId,
      entryId: entry.id,
      userId,
      timestamp: new Date(),
      data: entry,
    });

    return entry;
  }

  /**
   * Archive a content entry
   */
  async archiveEntry(
    tenantId: string,
    userId: string,
    entryId: string
  ): Promise<ContentEntry> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.entry.archive'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('archive', 'content entry');
    }

    // Get existing entry
    const existingEntry = await this.getEntry(tenantId, entryId);

    // Update status to archived
    const result = await database.query(
      `UPDATE content_entries 
       SET status = $1, updated_by = $2, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [ContentStatus.ARCHIVED, userId, entryId, tenantId]
    );

    const entry = this.mapRowToEntry(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.ENTRY_ARCHIVED,
      tenantId,
      modelId: entry.modelId,
      entryId: entry.id,
      userId,
      timestamp: new Date(),
      data: entry,
    });

    return entry;
  }

  /**
   * Delete a content entry
   */
  async deleteEntry(
    tenantId: string,
    userId: string,
    entryId: string
  ): Promise<void> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.entry.delete'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('delete', 'content entry');
    }

    // Get entry to get modelId before deletion
    const entry = await this.getEntry(tenantId, entryId);

    // Delete entry
    await database.query(
      'DELETE FROM content_entries WHERE id = $1 AND tenant_id = $2',
      [entryId, tenantId]
    );

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.ENTRY_DELETED,
      tenantId,
      modelId: entry.modelId,
      entryId,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Validate entry data against model fields
   */
  private validateEntryData(
    fields: any[],
    data: Record<string, any>
  ): void {
    // Check required fields
    for (const field of fields) {
      if (field.required && (data[field.name] === undefined || data[field.name] === null)) {
        throw new ValidationError(`Required field missing: ${field.name}`);
      }
    }

    // Validate field types (basic validation)
    for (const field of fields) {
      const value = data[field.name];
      if (value === undefined || value === null) continue;

      switch (field.type) {
        case 'number':
          if (typeof value !== 'number') {
            throw new ValidationError(`Field ${field.name} must be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new ValidationError(`Field ${field.name} must be a boolean`);
          }
          break;
        // Add more type validations as needed
      }
    }
  }

  /**
   * Map database row to ContentEntry
   */
  private mapRowToEntry(row: any): ContentEntry {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      modelId: row.model_id,
      data: row.data,
      status: row.status,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  /**
   * Emit a content event
   */
  private async emitEvent(payload: ContentEventPayload): Promise<void> {
    const { eventBus } = this.config;
    await eventBus.publish(payload.eventType, payload);
  }
}
