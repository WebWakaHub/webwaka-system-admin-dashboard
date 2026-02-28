/**
 * NoCodeBuilder
 * Main entry point for the No-Code/Low-Code Builder module
 */

import { NoCodeBuilderConfig } from './types';
import { ApplicationService } from './services/ApplicationService';
import { DeploymentService } from './services/DeploymentService';

export class NoCodeBuilder {
  private config: NoCodeBuilderConfig;
  private appService: ApplicationService;
  private deploymentService: DeploymentService;
  private initialized: boolean = false;

  constructor(config: NoCodeBuilderConfig) {
    this.config = config;
    this.appService = new ApplicationService(config);
    this.deploymentService = new DeploymentService(config);
  }

  /**
   * Initialize the module
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Create database tables
    await this.createTables();

    // Subscribe to tenant deletion events
    await this.config.eventBus.subscribe('tenant.deleted', async (event: any) => {
      await this.handleTenantDeletion(event.tenantId);
    });

    this.initialized = true;
  }

  /**
   * Shutdown the module
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Unsubscribe from events
    await this.config.eventBus.unsubscribe('tenant.deleted');

    this.initialized = false;
  }

  /**
   * Get the ApplicationService
   */
  getApplicationService(): ApplicationService {
    return this.appService;
  }

  /**
   * Get the DeploymentService
   */
  getDeploymentService(): DeploymentService {
    return this.deploymentService;
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS builder_apps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        created_by UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        definition JSONB NOT NULL,
        deployment_status VARCHAR(50) NOT NULL DEFAULT 'draft',
        public_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_builder_apps_tenant_id ON builder_apps(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_builder_apps_deployment_status ON builder_apps(deployment_status);
    `;

    await this.config.database.query(createTableQuery);
  }

  /**
   * Handle tenant deletion
   */
  private async handleTenantDeletion(tenantId: string): Promise<void> {
    // Delete all applications for the tenant
    const query = `
      DELETE FROM builder_apps
      WHERE tenant_id = $1
    `;

    await this.config.database.query(query, [tenantId]);
  }
}
