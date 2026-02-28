/**
 * Unit tests for ContentDeliveryService
 */

import { ContentDeliveryService } from '../services/ContentDeliveryService';
import { ContentModelService } from '../services/ContentModelService';
import { ContentStatus, HeadlessCMSConfig } from '../types';
import { ModelNotFoundError } from '../errors';

// Mock ContentModelService
jest.mock('../services/ContentModelService');

describe('ContentDeliveryService', () => {
  let service: ContentDeliveryService;
  let mockConfig: HeadlessCMSConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;

  const tenantId = 'tenant-123';
  const modelId = 'model-789';
  const entryId = 'entry-101';

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

    service = new ContentDeliveryService(mockConfig);
  });

  describe('getContentByModel', () => {
    it('should retrieve published content by model plural name', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Get model by plural name
          rows: [{ id: modelId }],
        })
        .mockResolvedValueOnce({
          // Count query
          rows: [{ total: '2' }],
        })
        .mockResolvedValueOnce({
          // Get entries
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
              created_by: 'user-1',
              updated_by: 'user-1',
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
              created_by: 'user-1',
              updated_by: 'user-1',
            },
          ],
        });

      const result = await service.getContentByModel(tenantId, 'blog_posts');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].status).toBe(ContentStatus.PUBLISHED);
    });

    it('should throw ModelNotFoundError if model does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(
        service.getContentByModel(tenantId, 'nonexistent')
      ).rejects.toThrow(ModelNotFoundError);
    });

    it('should apply filters to query', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ id: modelId }] })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Filtered Post', category: 'tech' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: 'user-1',
              updated_by: 'user-1',
            },
          ],
        });

      await service.getContentByModel(tenantId, 'blog_posts', {
        filters: { category: 'tech' },
      });

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining("data->>'category'"),
        expect.arrayContaining(['tech'])
      );
    });

    it('should apply sorting to query', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ id: modelId }] })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: entryId,
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'Post' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: 'user-1',
              updated_by: 'user-1',
            },
          ],
        });

      await service.getContentByModel(tenantId, 'blog_posts', {
        sort: [{ field: 'publishedAt', order: 'asc' }],
      });

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY published_at ASC'),
        expect.any(Array)
      );
    });

    it('should apply pagination to query', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ id: modelId }] })
        .mockResolvedValueOnce({ rows: [{ total: '100' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.getContentByModel(tenantId, 'blog_posts', {
        limit: 20,
        offset: 40,
      });

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.arrayContaining([20, 40])
      );
    });

    it('should only return published content', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ id: modelId }] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.getContentByModel(tenantId, 'blog_posts');

      // Verify that the query includes status = 'published'
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $3'),
        expect.arrayContaining([ContentStatus.PUBLISHED])
      );
    });
  });

  describe('getContentById', () => {
    it('should retrieve a published content entry by ID', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: entryId,
            tenant_id: tenantId,
            model_id: modelId,
            data: { title: 'Post', body: 'Body' },
            status: ContentStatus.PUBLISHED,
            version: 1,
            created_at: new Date(),
            updated_at: new Date(),
            published_at: new Date(),
            created_by: 'user-1',
            updated_by: 'user-1',
          },
        ],
      });

      const result = await service.getContentById(tenantId, entryId);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(entryId);
      expect(result!.status).toBe(ContentStatus.PUBLISHED);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $3'),
        [entryId, tenantId, ContentStatus.PUBLISHED]
      );
    });

    it('should return null if entry does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      const result = await service.getContentById(tenantId, entryId);

      expect(result).toBeNull();
    });

    it('should return null if entry is not published', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      const result = await service.getContentById(tenantId, entryId);

      expect(result).toBeNull();
    });
  });

  describe('searchContent', () => {
    it('should search content across all models', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // Count query
          rows: [{ total: '2' }],
        })
        .mockResolvedValueOnce({
          // Search query
          rows: [
            {
              id: 'entry-1',
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'JavaScript Tutorial', body: 'Learn JavaScript' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: 'user-1',
              updated_by: 'user-1',
            },
            {
              id: 'entry-2',
              tenant_id: tenantId,
              model_id: modelId,
              data: { title: 'JavaScript Best Practices', body: 'Tips for JS' },
              status: ContentStatus.PUBLISHED,
              version: 1,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: new Date(),
              created_by: 'user-1',
              updated_by: 'user-1',
            },
          ],
        });

      const result = await service.searchContent(tenantId, 'JavaScript');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%JavaScript%'])
      );
    });

    it('should only search published content', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await service.searchContent(tenantId, 'test');

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $2'),
        expect.arrayContaining([ContentStatus.PUBLISHED])
      );
    });

    it('should apply pagination to search results', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ total: '50' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.searchContent(tenantId, 'test', {
        limit: 10,
        offset: 20,
      });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $4 OFFSET $5'),
        expect.arrayContaining([10, 20])
      );
    });
  });
});
