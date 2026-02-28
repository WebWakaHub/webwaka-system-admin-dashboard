/**
 * Unit tests for ContentEntryService
 */

import { ContentEntryService } from '../services/ContentEntryService';
import { ContentModelService } from '../services/ContentModelService';
import { ContentStatus, FieldType, HeadlessCMSConfig } from '../types';
import {
  EntryNotFoundError,
  ValidationError,
  PermissionDeniedError,
} from '../errors';

// Mock ContentModelService
jest.mock('../services/ContentModelService');

describe('ContentEntryService', () => {
  let service: ContentEntryService;
  let mockConfig: HeadlessCMSConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;
  let mockModelService: jest.Mocked<ContentModelService>;

  const tenantId = 'tenant-123';
  const userId = 'user-456';
  const modelId = 'model-789';
  const entryId = 'entry-101';

  const mockModel = {
    id: modelId,
    tenantId,
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
        id: 'views',
        name: 'views',
        type: FieldType.NUMBER,
        required: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
    updatedBy: userId,
  };

  beforeEach(() => {
    // Mock database
    mockDatabase = {
      query: jest.fn(),
    };

    // Mock event bus
    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    // Mock permission system
    mockPermissionSystem = {
      checkPermission: jest.fn().mockResolvedValue(true),
    };

    mockConfig = {
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
    };

    service = new ContentEntryService(mockConfig);

    // Mock the model service
    mockModelService = (service as any).modelService as jest.Mocked<ContentModelService>;
    mockModelService.getModel = jest.fn().mockResolvedValue(mockModel);
  });

  describe('createEntry', () => {
    const validEntryData = {
      title: 'My First Blog Post',
      body: '<p>This is the content.</p>',
    };

    it('should create a content entry successfully', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: entryId,
            tenant_id: tenantId,
            model_id: modelId,
            data: validEntryData,
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

      const result = await service.createEntry(
        tenantId,
        userId,
        modelId,
        validEntryData
      );

      expect(result).toMatchObject({
        id: entryId,
        tenantId,
        modelId,
        data: validEntryData,
        status: ContentStatus.DRAFT,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.created',
        expect.objectContaining({
          eventType: 'content.entry.created',
          entryId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.createEntry(tenantId, userId, modelId, validEntryData)
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw ValidationError if required field is missing', async () => {
      const invalidData = { body: '<p>Missing title</p>' };

      await expect(
        service.createEntry(tenantId, userId, modelId, invalidData)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if field type is incorrect', async () => {
      const invalidData = {
        title: 'Valid Title',
        body: '<p>Valid body</p>',
        views: 'not-a-number', // Should be number
      };

      await expect(
        service.createEntry(tenantId, userId, modelId, invalidData)
      ).rejects.toThrow(ValidationError);
    });

    it('should create entry with PUBLISHED status if specified', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: entryId,
            tenant_id: tenantId,
            model_id: modelId,
            data: validEntryData,
            status: ContentStatus.PUBLISHED,
            version: 1,
            created_at: new Date(),
            updated_at: new Date(),
            published_at: new Date(),
            created_by: userId,
            updated_by: userId,
          },
        ],
      });

      const result = await service.createEntry(
        tenantId,
        userId,
        modelId,
        validEntryData,
        ContentStatus.PUBLISHED
      );

      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });
  });

  describe('getEntry', () => {
    it('should retrieve a content entry by ID', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: entryId,
            tenant_id: tenantId,
            model_id: modelId,
            data: { title: 'Test', body: 'Test body' },
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

      const result = await service.getEntry(tenantId, entryId);

      expect(result.id).toBe(entryId);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.any(String),
        [entryId, tenantId]
      );
    });

    it('should throw EntryNotFoundError if entry does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(service.getEntry(tenantId, entryId)).rejects.toThrow(
        EntryNotFoundError
      );
    });
  });

  describe('queryEntries', () => {
    it('should query entries with filters', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] }) // count
        .mockResolvedValueOnce({
          // entries
          rows: [
            {
              id: 'entry-1',
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Post 1', body: 'Body 1' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
            {
              id: 'entry-2',
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Post 2', body: 'Body 2' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const result = await service.queryEntries(tenantId, modelId, {
        filters: { status: ContentStatus.PUBLISHED },
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should query entries with sorting', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Post', body: 'Body' },
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

      await service.queryEntries(tenantId, modelId, {
        sort: [{ field: 'createdAt', order: 'asc' }],
      });

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at ASC'),
        expect.any(Array)
      );
    });
  });

  describe('updateEntry', () => {
    it('should update a content entry successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        body: '<p>Updated body</p>',
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          // getEntry call
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Old Title', body: 'Old body' },
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
          // update call
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: updateData,
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

      const result = await service.updateEntry(tenantId, userId, entryId, updateData);

      expect(result.data).toEqual(updateData);
      expect(result.version).toBe(2);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.updated',
        expect.objectContaining({
          eventType: 'content.entry.updated',
          entryId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.updateEntry(tenantId, userId, entryId, {})
      ).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('publishEntry', () => {
    it('should publish a content entry successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // getEntry call
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Title', body: 'Body' },
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
          // update call
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Title', body: 'Body' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const result = await service.publishEntry(tenantId, userId, entryId);

      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.published',
        expect.objectContaining({
          eventType: 'content.entry.published',
          entryId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.publishEntry(tenantId, userId, entryId)
      ).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('archiveEntry', () => {
    it('should archive a content entry successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Title', body: 'Body' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Title', body: 'Body' },
              status: ContentStatus.ARCHIVED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const result = await service.archiveEntry(tenantId, userId, entryId);

      expect(result.status).toBe(ContentStatus.ARCHIVED);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.archived',
        expect.objectContaining({
          eventType: 'content.entry.archived',
          entryId,
        })
      );
    });
  });

  describe('deleteEntry', () => {
    it('should delete a content entry successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Title', body: 'Body' },
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
        .mockResolvedValueOnce({ rows: [] }); // delete call

      await service.deleteEntry(tenantId, userId, entryId);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM content_entries'),
        [entryId, tenantId]
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.entry.deleted',
        expect.objectContaining({
          eventType: 'content.entry.deleted',
          entryId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.deleteEntry(tenantId, userId, entryId)
      ).rejects.toThrow(PermissionDeniedError);
    });
  });
});
