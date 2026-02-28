/**
 * Headless CMS Module
 * 
 * Main class that orchestrates content management functionality
 */

import { HeadlessCMSConfig } from './types';
import { ContentModelService } from './services/ContentModelService';
import { ContentEntryService } from './services/ContentEntryService';
import { ContentDeliveryService } from './services/ContentDeliveryService';

export class HeadlessCMS {
  private config: HeadlessCMSConfig;
  private modelService: ContentModelService;
  private entryService: ContentEntryService;
  private deliveryService: ContentDeliveryService;
  private initialized: boolean = false;

  constructor(config: HeadlessCMSConfig) {
    this.config = config;
    this.modelService = new ContentModelService(config);
    this.entryService = new ContentEntryService(config);
    this.deliveryService = new ContentDeliveryService(config);
  }

  /**
   * Initialize the Headless CMS module
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize database schema
    await this.initializeSchema();

    // Subscribe to relevant events
    await this.subscribeToEvents();

    this.initialized = true;
  }

  /**
   * Initialize database schema for content models and entries
   */
  private async initializeSchema(): Promise<void> {
    const { database } = this.config;

    // Create content_models table
    await database.query(`
      CREATE TABLE IF NOT EXISTS content_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        plural_name VARCHAR(255) NOT NULL,
        description TEXT,
        fields JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID NOT NULL,
        updated_by UUID NOT NULL,
        UNIQUE(tenant_id, name)
      );
    `);

    // Create content_entries table
    await database.query(`
      CREATE TABLE IF NOT EXISTS content_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        model_id UUID NOT NULL REFERENCES content_models(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        published_at TIMESTAMP,
        created_by UUID NOT NULL,
        updated_by UUID NOT NULL
      );
    `);

    // Create indexes
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_content_models_tenant_id ON content_models(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_content_entries_tenant_id ON content_entries(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_content_entries_model_id ON content_entries(model_id);
      CREATE INDEX IF NOT EXISTS idx_content_entries_status ON content_entries(status);
    `);
  }

  /**
   * Subscribe to relevant events from other modules
   */
  private async subscribeToEvents(): Promise<void> {
    const { eventBus } = this.config;

    // Subscribe to tenant deletion events to clean up content
    await eventBus.subscribe('tenant.deleted', async (event: any) => {
      const { tenantId } = event.data;
      await this.cleanupTenantContent(tenantId);
    });
  }

  /**
   * Clean up all content for a deleted tenant
   */
  private async cleanupTenantContent(tenantId: string): Promise<void> {
    const { database } = this.config;

    // Delete all entries for this tenant
    await database.query(
      'DELETE FROM content_entries WHERE tenant_id = $1',
      [tenantId]
    );

    // Delete all models for this tenant
    await database.query(
      'DELETE FROM content_models WHERE tenant_id = $1',
      [tenantId]
    );
  }

  /**
   * Get the content model service
   */
  getModelService(): ContentModelService {
    return this.modelService;
  }

  /**
   * Get the content entry service
   */
  getEntryService(): ContentEntryService {
    return this.entryService;
  }

  /**
   * Get the content delivery service
   */
  getDeliveryService(): ContentDeliveryService {
    return this.deliveryService;
  }

  /**
   * Shutdown the Headless CMS module
   */
  async shutdown(): Promise<void> {
    // Unsubscribe from events
    const { eventBus } = this.config;
    await eventBus.unsubscribe('tenant.deleted');

    this.initialized = false;
  }
}
