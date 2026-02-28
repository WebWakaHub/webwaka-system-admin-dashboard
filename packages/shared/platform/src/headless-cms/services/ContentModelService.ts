/**
 * Content Model Service
 * 
 * Manages content models (content type definitions)
 */

import {
  ContentModel,
  ContentField,
  HeadlessCMSConfig,
  ContentEventType,
  ContentEventPayload,
} from '../types';
import {
  ModelNotFoundError,
  ValidationError,
  PermissionDeniedError,
  DuplicateModelError,
} from '../errors';

export class ContentModelService {
  private config: HeadlessCMSConfig;

  constructor(config: HeadlessCMSConfig) {
    this.config = config;
  }

  /**
   * Create a new content model
   */
  async createModel(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      pluralName: string;
      description?: string;
      fields: ContentField[];
    }
  ): Promise<ContentModel> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.model.create'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('create', 'content model');
    }

    // Validate model data
    this.validateModelData(data);

    // Check for duplicate model name
    const existingModel = await database.query(
      'SELECT id FROM content_models WHERE tenant_id = $1 AND name = $2',
      [tenantId, data.name]
    );
    if (existingModel.rows.length > 0) {
      throw new DuplicateModelError(data.name);
    }

    // Insert model
    const result = await database.query(
      `INSERT INTO content_models (tenant_id, name, plural_name, description, fields, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenantId,
        data.name,
        data.pluralName,
        data.description || null,
        JSON.stringify(data.fields),
        userId,
        userId,
      ]
    );

    const model = this.mapRowToModel(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.MODEL_CREATED,
      tenantId,
      modelId: model.id,
      userId,
      timestamp: new Date(),
      data: model,
    });

    return model;
  }

  /**
   * Get a content model by ID
   */
  async getModel(tenantId: string, modelId: string): Promise<ContentModel> {
    const { database } = this.config;

    const result = await database.query(
      'SELECT * FROM content_models WHERE id = $1 AND tenant_id = $2',
      [modelId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new ModelNotFoundError(modelId);
    }

    return this.mapRowToModel(result.rows[0]);
  }

  /**
   * Get a content model by name
   */
  async getModelByName(tenantId: string, name: string): Promise<ContentModel> {
    const { database } = this.config;

    const result = await database.query(
      'SELECT * FROM content_models WHERE name = $1 AND tenant_id = $2',
      [name, tenantId]
    );

    if (result.rows.length === 0) {
      throw new ModelNotFoundError(name);
    }

    return this.mapRowToModel(result.rows[0]);
  }

  /**
   * List all content models for a tenant
   */
  async listModels(tenantId: string): Promise<ContentModel[]> {
    const { database } = this.config;

    const result = await database.query(
      'SELECT * FROM content_models WHERE tenant_id = $1 ORDER BY name ASC',
      [tenantId]
    );

    return result.rows.map((row: any) => this.mapRowToModel(row));
  }

  /**
   * Update a content model
   */
  async updateModel(
    tenantId: string,
    userId: string,
    modelId: string,
    data: {
      name?: string;
      pluralName?: string;
      description?: string;
      fields?: ContentField[];
    }
  ): Promise<ContentModel> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.model.update'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('update', 'content model');
    }

    // Get existing model
    const existingModel = await this.getModel(tenantId, modelId);

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.pluralName !== undefined) {
      updates.push(`plural_name = $${paramIndex++}`);
      values.push(data.pluralName);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.fields !== undefined) {
      updates.push(`fields = $${paramIndex++}`);
      values.push(JSON.stringify(data.fields));
    }

    updates.push(`updated_by = $${paramIndex++}`);
    values.push(userId);
    updates.push(`updated_at = NOW()`);

    values.push(modelId, tenantId);

    const result = await database.query(
      `UPDATE content_models SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
       RETURNING *`,
      values
    );

    const model = this.mapRowToModel(result.rows[0]);

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.MODEL_UPDATED,
      tenantId,
      modelId: model.id,
      userId,
      timestamp: new Date(),
      data: model,
    });

    return model;
  }

  /**
   * Delete a content model
   */
  async deleteModel(
    tenantId: string,
    userId: string,
    modelId: string
  ): Promise<void> {
    const { database, eventBus, permissionSystem } = this.config;

    // Check permissions
    const hasPermission = await permissionSystem.checkPermission(
      userId,
      tenantId,
      'content.model.delete'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('delete', 'content model');
    }

    // Verify model exists
    await this.getModel(tenantId, modelId);

    // Delete model (cascade will delete entries)
    await database.query(
      'DELETE FROM content_models WHERE id = $1 AND tenant_id = $2',
      [modelId, tenantId]
    );

    // Emit event
    await this.emitEvent({
      eventType: ContentEventType.MODEL_DELETED,
      tenantId,
      modelId,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Validate model data
   */
  private validateModelData(data: {
    name: string;
    pluralName: string;
    fields: ContentField[];
  }): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Model name is required');
    }
    if (!data.pluralName || data.pluralName.trim().length === 0) {
      throw new ValidationError('Model plural name is required');
    }
    if (!data.fields || data.fields.length === 0) {
      throw new ValidationError('At least one field is required');
    }

    // Validate field names are unique
    const fieldNames = new Set<string>();
    for (const field of data.fields) {
      if (fieldNames.has(field.name)) {
        throw new ValidationError(`Duplicate field name: ${field.name}`);
      }
      fieldNames.add(field.name);
    }
  }

  /**
   * Map database row to ContentModel
   */
  private mapRowToModel(row: any): ContentModel {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      pluralName: row.plural_name,
      description: row.description,
      fields: row.fields,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
