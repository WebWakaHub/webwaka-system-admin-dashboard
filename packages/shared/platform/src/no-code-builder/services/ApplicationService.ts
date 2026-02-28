/**
 * ApplicationService
 * Manages application definitions (CRUD operations)
 */

import {
  ApplicationDefinition,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  DeploymentStatus,
  NoCodeBuilderConfig,
  ApplicationNotFoundError,
  ValidationError,
  PermissionDeniedError,
} from '../types';

export class ApplicationService {
  private config: NoCodeBuilderConfig;

  constructor(config: NoCodeBuilderConfig) {
    this.config = config;
  }

  /**
   * Create a new application
   */
  async createApplication(
    tenantId: string,
    userId: string,
    request: CreateApplicationRequest
  ): Promise<ApplicationDefinition> {
    // Check permission
    const hasPermission = await this.config.permissionSystem.checkPermission(
      tenantId,
      userId,
      'builder.app.create'
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to create applications');
    }

    // Validate request
    if (!request.name || request.name.trim() === '') {
      throw new ValidationError('Application name is required');
    }

    // Create application in database
    const query = `
      INSERT INTO builder_apps (tenant_id, created_by, name, description, definition, deployment_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const defaultDefinition = {
      pages: [
        {
          id: 'page-1',
          name: 'Home',
          path: '/',
          components: [],
        },
      ],
      globalStyles: {},
    };

    const result = await this.config.database.query(query, [
      tenantId,
      userId,
      request.name,
      request.description || null,
      JSON.stringify(defaultDefinition),
      DeploymentStatus.DRAFT,
    ]);

    const row = result.rows[0];
    const app = this.mapRowToApplication(row);

    // Emit event
    await this.config.eventBus.publish('builder.app.created', {
      eventType: 'builder.app.created',
      tenantId,
      appId: app.id,
      userId,
      timestamp: new Date().toISOString(),
    });

    return app;
  }

  /**
   * Get an application by ID
   */
  async getApplication(tenantId: string, appId: string): Promise<ApplicationDefinition> {
    const query = `
      SELECT * FROM builder_apps
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await this.config.database.query(query, [appId, tenantId]);

    if (result.rows.length === 0) {
      throw new ApplicationNotFoundError(appId);
    }

    return this.mapRowToApplication(result.rows[0]);
  }

  /**
   * List all applications for a tenant
   */
  async listApplications(tenantId: string): Promise<ApplicationDefinition[]> {
    const query = `
      SELECT * FROM builder_apps
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.config.database.query(query, [tenantId]);

    return result.rows.map((row: any) => this.mapRowToApplication(row));
  }

  /**
   * Update an application
   */
  async updateApplication(
    tenantId: string,
    userId: string,
    appId: string,
    request: UpdateApplicationRequest
  ): Promise<ApplicationDefinition> {
    // Check permission
    const hasPermission = await this.config.permissionSystem.checkPermission(
      tenantId,
      userId,
      'builder.app.update'
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to update applications');
    }

    // Get existing application
    const app = await this.getApplication(tenantId, appId);

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(request.name);
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(request.description);
    }

    if (request.pages !== undefined || request.globalStyles !== undefined) {
      const definition = {
        pages: request.pages || app.pages,
        globalStyles: request.globalStyles || app.globalStyles,
      };
      updates.push(`definition = $${paramIndex++}`);
      values.push(JSON.stringify(definition));
    }

    updates.push(`updated_at = NOW()`);

    values.push(appId, tenantId);

    const query = `
      UPDATE builder_apps
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING *
    `;

    const result = await this.config.database.query(query, values);
    const updatedApp = this.mapRowToApplication(result.rows[0]);

    // Emit event
    await this.config.eventBus.publish('builder.app.updated', {
      eventType: 'builder.app.updated',
      tenantId,
      appId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return updatedApp;
  }

  /**
   * Delete an application
   */
  async deleteApplication(tenantId: string, userId: string, appId: string): Promise<void> {
    // Check permission
    const hasPermission = await this.config.permissionSystem.checkPermission(
      tenantId,
      userId,
      'builder.app.delete'
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to delete applications');
    }

    // Verify application exists
    await this.getApplication(tenantId, appId);

    // Delete from database
    const query = `
      DELETE FROM builder_apps
      WHERE id = $1 AND tenant_id = $2
    `;

    await this.config.database.query(query, [appId, tenantId]);

    // Emit event
    await this.config.eventBus.publish('builder.app.deleted', {
      eventType: 'builder.app.deleted',
      tenantId,
      appId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    tenantId: string,
    appId: string,
    status: DeploymentStatus,
    publicUrl?: string
  ): Promise<void> {
    const query = `
      UPDATE builder_apps
      SET deployment_status = $1, public_url = $2, updated_at = NOW()
      WHERE id = $3 AND tenant_id = $4
    `;

    await this.config.database.query(query, [status, publicUrl || null, appId, tenantId]);
  }

  /**
   * Map database row to ApplicationDefinition
   */
  private mapRowToApplication(row: any): ApplicationDefinition {
    const definition = typeof row.definition === 'string'
      ? JSON.parse(row.definition)
      : row.definition;

    return {
      id: row.id,
      tenantId: row.tenant_id,
      createdBy: row.created_by,
      name: row.name,
      description: row.description,
      pages: definition.pages || [],
      globalStyles: definition.globalStyles || {},
      deploymentStatus: row.deployment_status,
      publicUrl: row.public_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
