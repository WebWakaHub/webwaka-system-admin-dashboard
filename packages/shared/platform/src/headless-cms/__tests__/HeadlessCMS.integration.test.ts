/**
 * Integration tests for Headless CMS Module
 * 
 * These tests verify that the module works correctly with real dependencies
 * (database, event bus, permission system).
 */

import { HeadlessCMS } from '../HeadlessCMS';
import { ContentStatus, FieldType } from '../types';

describe('HeadlessCMS Integration Tests', () => {
  let cms: HeadlessCMS;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;

  const tenantId = 'tenant-integration-test';
  const userId = 'user-integration-test';

  beforeAll(async () => {
    // Setup mock dependencies
    mockDatabase = {
      query: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
    };

    mockPermissionSystem = {
      checkPermission: jest.fn().mockResolvedValue(true),
    };

    // Mock database schema initialization
    mockDatabase.query.mockResolvedValue({ rows: [] });

    // Initialize CMS
    cms = new HeadlessCMS({
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
    });

    await cms.initialize();
  });

  afterAll(async () => {
    await cms.shutdown();
  });

  describe('Complete Content Management Workflow', () => {
    let modelId: string;
    let entryId: string;

    it('should create a content model', async () => {
      const modelData = {
        name: 'blog_post',
        pluralName: 'blog_posts',
        description: 'Blog post content type',
        fields: [
          {
            id: 'title',
            name: 'title',
            type: FieldType.TEXT,
            required: true,
          },
          {
            id: 'body',
            name: 'body',
            type: FieldType.RICH_TEXT,
            required: true,
          },
          {
            id: 'published',
            name: 'published',
            type: FieldType.BOOLEAN,
            required: false,
          },
        ],
      };

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] }) // Check for duplicate
        .mockResolvedValueOnce({
          // Insert model
          rows: [
            {
              id: 'model-integration-1',
              tenant_id: tenantId,
              name: modelData.name,
              plural_name: modelData.pluralName,
              description: modelData.description,
              fields: modelData.fields,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const modelService = cms.getModelService();
      const model = await modelService.createModel(tenantId, userId, modelData);

      modelId = model.id;

      expect(model.name).toBe('blog_post');
      expect(model.fields).toHaveLength(3);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.model.created',
        expect.any(Object)
      );
    });

    it('should create a draft content entry', async () => {
      const entryData = {
        title: 'My First Blog Post',
        body: '<p>This is the content of my first blog post.</p>',
        published: false,
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          // Get model
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: 'blog_post',
              plural_name: 'blog_posts',
              description: 'Blog post content type',
              fields: [
                {
                  id: 'title',
                  name: 'title',
                  type: FieldType.TEXT,
                  required: true,
                },
                {
                  id: 'body',
                  name: 'body',
                  type: FieldType.RICH_TEXT,
                  required: true,
                },
                {
                  id: 'published',
                  name: 'published',
                  type: FieldType.BOOLEAN,
                  required: false,
                },
              ],
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // Insert entry
          rows: [
            {
              id: 'entry-integration-1',
              tenant_id: tenantId,
              model_id: modelId,
              data: entryData,
              status: ContentStatus.DRAFT,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: null,
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const entryService = cms.getEntryService();
      const entry = await entryService.createEntry(
        tenantId,
        userId,
        modelId,
        entryData
      );

      entryId = entry.id;

      expect(entry.data.title).toBe('My First Blog Post');
      expect(entry.status).toBe(ContentStatus.DRAFT);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.created',
        expect.any(Object)
      );
    });

    it('should update the content entry', async () => {
      const updatedData = {
        title: 'My First Blog Post (Updated)',
        body: '<p>This is the updated content.</p>',
        published: false,
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          // Get entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post',
                body: '<p>This is the content of my first blog post.</p>',
                published: false,
              },
              status: ContentStatus.DRAFT,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: null,
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // Get model
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: 'blog_post',
              plural_name: 'blog_posts',
              description: 'Blog post content type',
              fields: [
                {
                  id: 'title',
                  name: 'title',
                  type: FieldType.TEXT,
                  required: true,
                },
                {
                  id: 'body',
                  name: 'body',
                  type: FieldType.RICH_TEXT,
                  required: true,
                },
                {
                  id: 'published',
                  name: 'published',
                  type: FieldType.BOOLEAN,
                  required: false,
                },
              ],
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // Update entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: updatedData,
              status: ContentStatus.DRAFT,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: null,
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const entryService = cms.getEntryService();
      const entry = await entryService.updateEntry(
        tenantId,
        userId,
        entryId,
        updatedData
      );

      expect(entry.data.title).toBe('My First Blog Post (Updated)');
      expect(entry.version).toBe(2);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.updated',
        expect.any(Object)
      );
    });

    it('should publish the content entry', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Get entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post (Updated)',
                body: '<p>This is the updated content.</p>',
                published: false,
              },
              status: ContentStatus.DRAFT,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: null,
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // Publish entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post (Updated)',
                body: '<p>This is the updated content.</p>',
                published: false,
              },
              status: ContentStatus.PUBLISHED,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const entryService = cms.getEntryService();
      const entry = await entryService.publishEntry(tenantId, userId, entryId);

      expect(entry.status).toBe(ContentStatus.PUBLISHED);
      expect(entry.publishedAt).toBeDefined();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.published',
        expect.any(Object)
      );
    });

    it('should retrieve published content via delivery API', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Get model by plural name
          rows: [{ id: modelId }],
        })
        .mockResolvedValueOnce({
          // Count query
          rows: [{ total: '1' }],
        })
        .mockResolvedValueOnce({
          // Get entries
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post (Updated)',
                body: '<p>This is the updated content.</p>',
                published: false,
              },
              status: ContentStatus.PUBLISHED,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const deliveryService = cms.getDeliveryService();
      const result = await deliveryService.getContentByModel(
        tenantId,
        'blog_posts'
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(entryId);
      expect(result.data[0].status).toBe(ContentStatus.PUBLISHED);
    });

    it('should archive the content entry', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Get entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post (Updated)',
                body: '<p>This is the updated content.</p>',
                published: false,
              },
              status: ContentStatus.PUBLISHED,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // Archive entry
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: {
                title: 'My First Blog Post (Updated)',
                body: '<p>This is the updated content.</p>',
                published: false,
              },
              status: ContentStatus.ARCHIVED,
              version: 2,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const entryService = cms.getEntryService();
      const entry = await entryService.archiveEntry(tenantId, userId, entryId);

      expect(entry.status).toBe(ContentStatus.ARCHIVED);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.archived',
        expect.any(Object)
      );
    });

    it('should not return archived content via delivery API', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Get model by plural name
          rows: [{ id: modelId }],
        })
        .mockResolvedValueOnce({
          // Count query - no published entries
          rows: [{ total: '0' }],
        })
        .mockResolvedValueOnce({
          // Get entries - empty
          rows: [],
        });

      const deliveryService = cms.getDeliveryService();
      const result = await deliveryService.getContentByModel(
        tenantId,
        'blog_posts'
      );

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Event System Integration', () => {
    it('should subscribe to tenant deletion events', async () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(
        'tenant.deleted',
        expect.any(Function)
      );
    });

    it('should emit events for all content operations', async () => {
      // Verify that events were emitted during the workflow
      const publishCalls = mockEventBus.publish.mock.calls;
      const eventTypes = publishCalls.map((call: any) => call[0]);

      expect(eventTypes).toContain('content.model.created');
      expect(eventTypes).toContain('content.entry.created');
      expect(eventTypes).toContain('content.entry.updated');
      expect(eventTypes).toContain('content.entry.published');
      expect(eventTypes).toContain('content.entry.archived');
    });
  });

  describe('Permission System Integration', () => {
    it('should check permissions for all protected operations', async () => {
      // Verify that permission checks were performed
      expect(mockPermissionSystem.checkPermission).toHaveBeenCalled();

      const permissionCalls = mockPermissionSystem.checkPermission.mock.calls;
      const permissions = permissionCalls.map((call: any) => call[2]);

      expect(permissions).toContain('content.model.create');
      expect(permissions).toContain('content.entry.create');
      expect(permissions).toContain('content.entry.update');
      expect(permissions).toContain('content.entry.publish');
      expect(permissions).toContain('content.entry.archive');
    });
  });
});
