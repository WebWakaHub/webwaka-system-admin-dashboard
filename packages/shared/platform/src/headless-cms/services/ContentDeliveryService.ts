/**
 * Content Delivery Service
 * 
 * Provides public read-only API for delivering content to front-end applications
 */

import {
  ContentEntry,
  ContentStatus,
  ContentQueryOptions,
  ContentQueryResult,
  HeadlessCMSConfig,
} from '../types';
import { ModelNotFoundError } from '../errors';
import { ContentModelService } from './ContentModelService';

export class ContentDeliveryService {
  private config: HeadlessCMSConfig;
  private modelService: ContentModelService;

  constructor(config: HeadlessCMSConfig) {
    this.config = config;
    this.modelService = new ContentModelService(config);
  }

  /**
   * Get published content entries by model name
   */
  async getContentByModel(
    tenantId: string,
    modelPluralName: string,
    options: ContentQueryOptions = {}
  ): Promise<ContentQueryResult<ContentEntry>> {
    const { database } = this.config;

    // Get model by plural name
    const modelResult = await database.query(
      'SELECT id FROM content_models WHERE tenant_id = $1 AND plural_name = $2',
      [tenantId, modelPluralName]
    );

    if (modelResult.rows.length === 0) {
      throw new ModelNotFoundError(modelPluralName);
    }

    const modelId = modelResult.rows[0].id;

    // Build query - only return published content
    const conditions: string[] = [
      'tenant_id = $1',
      'model_id = $2',
      'status = $3',
    ];
    const values: any[] = [tenantId, modelId, ContentStatus.PUBLISHED];
    let paramIndex = 4;

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        conditions.push(`data->>'${key}' = $${paramIndex++}`);
        values.push(value);
      }
    }

    // Build ORDER BY clause
    let orderBy = 'published_at DESC';
    if (options.sort && options.sort.length > 0) {
      const sortClauses = options.sort.map((s) => {
        if (s.field === 'publishedAt') return `published_at ${s.order.toUpperCase()}`;
        if (s.field === 'createdAt') return `created_at ${s.order.toUpperCase()}`;
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
   * Get a single published content entry by ID
   */
  async getContentById(
    tenantId: string,
    entryId: string
  ): Promise<ContentEntry | null> {
    const { database } = this.config;

    const result = await database.query(
      `SELECT * FROM content_entries 
       WHERE id = $1 AND tenant_id = $2 AND status = $3`,
      [entryId, tenantId, ContentStatus.PUBLISHED]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntry(result.rows[0]);
  }

  /**
   * Search content across all models
   */
  async searchContent(
    tenantId: string,
    searchTerm: string,
    options: ContentQueryOptions = {}
  ): Promise<ContentQueryResult<ContentEntry>> {
    const { database } = this.config;

    // Build search query - search in JSONB data field
    const conditions: string[] = [
      'tenant_id = $1',
      'status = $2',
      `data::text ILIKE $3`,
    ];
    const values: any[] = [tenantId, ContentStatus.PUBLISHED, `%${searchTerm}%`];

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
       ORDER BY published_at DESC
       LIMIT $4 OFFSET $5`,
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
}
