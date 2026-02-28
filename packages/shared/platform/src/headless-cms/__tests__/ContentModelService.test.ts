/**
 * Unit tests for ContentModelService
 */

import { ContentModelService } from '../services/ContentModelService';
import { FieldType, HeadlessCMSConfig } from '../types';
import {
  ModelNotFoundError,
  ValidationError,
  PermissionDeniedError,
  DuplicateModelError,
} from '../errors';

describe('ContentModelService', () => {
  let service: ContentModelService;
  let mockConfig: HeadlessCMSConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;

  const tenantId = 'tenant-123';
  const userId = 'user-456';
  const modelId = 'model-789';

  beforeEach(() => {
    // Mock database
    mockDatabase = {
      query: jest.fn(),
    };

    // Mock event bus
    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
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

    service = new ContentModelService(mockConfig);
  });

  describe('createModel', () => {
    const validModelData = {
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
      ],
    };

    it('should create a content model successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] }) // Check for duplicate
        .mockResolvedValueOnce({
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: validModelData.name,
              plural_name: validModelData.pluralName,
              description: validModelData.description,
              fields: validModelData.fields,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const result = await service.createModel(tenantId, userId, validModelData);

      expect(result).toMatchObject({
        id: modelId,
        tenantId,
        name: validModelData.name,
        pluralName: validModelData.pluralName,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.model.created',
        expect.objectContaining({
          eventType: 'content.model.created',
          tenantId,
          modelId,
          userId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.createModel(tenantId, userId, validModelData)
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw ValidationError if model name is empty', async () => {
      const invalidData = { ...validModelData, name: '' };

      await expect(
        service.createModel(tenantId, userId, invalidData)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if fields array is empty', async () => {
      const invalidData = { ...validModelData, fields: [] };

      await expect(
        service.createModel(tenantId, userId, invalidData)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw DuplicateModelError if model name already exists', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-model-id' }],
      });

      await expect(
        service.createModel(tenantId, userId, validModelData)
      ).rejects.toThrow(DuplicateModelError);
    });

    it('should throw ValidationError if field names are not unique', async () => {
      const invalidData = {
        ...validModelData,
        fields: [
          {
            id: 'title',
            name: 'title',
            type: FieldType.TEXT,
            required: true,
          },
          {
            id: 'title2',
            name: 'title', // Duplicate name
            type: FieldType.TEXT,
            required: true,
          },
        ],
      };

      await expect(
        service.createModel(tenantId, userId, invalidData)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getModel', () => {
    it('should retrieve a content model by ID', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: modelId,
            tenant_id: tenantId,
            name: 'blog_post',
            plural_name: 'blog_posts',
            description: 'Blog post content type',
            fields: [],
            created_at: new Date(),
            updated_at: new Date(),
            created_by: userId,
            updated_by: userId,
          },
        ],
      });

      const result = await service.getModel(tenantId, modelId);

      expect(result.id).toBe(modelId);
      expect(result.tenantId).toBe(tenantId);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.any(String),
        [modelId, tenantId]
      );
    });

    it('should throw ModelNotFoundError if model does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(service.getModel(tenantId, modelId)).rejects.toThrow(
        ModelNotFoundError
      );
    });
  });

  describe('getModelByName', () => {
    it('should retrieve a content model by name', async () => {
      const modelName = 'blog_post';
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: modelId,
            tenant_id: tenantId,
            name: modelName,
            plural_name: 'blog_posts',
            description: 'Blog post content type',
            fields: [],
            created_at: new Date(),
            updated_at: new Date(),
            created_by: userId,
            updated_by: userId,
          },
        ],
      });

      const result = await service.getModelByName(tenantId, modelName);

      expect(result.name).toBe(modelName);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.any(String),
        [modelName, tenantId]
      );
    });

    it('should throw ModelNotFoundError if model does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(
        service.getModelByName(tenantId, 'nonexistent')
      ).rejects.toThrow(ModelNotFoundError);
    });
  });

  describe('listModels', () => {
    it('should list all content models for a tenant', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: 'model-1',
            tenant_id: tenantId,
            name: 'blog_post',
            plural_name: 'blog_posts',
            description: null,
            fields: [],
            created_at: new Date(),
            updated_at: new Date(),
            created_by: userId,
            updated_by: userId,
          },
          {
            id: 'model-2',
            tenant_id: tenantId,
            name: 'product',
            plural_name: 'products',
            description: null,
            fields: [],
            created_at: new Date(),
            updated_at: new Date(),
            created_by: userId,
            updated_by: userId,
          },
        ],
      });

      const result = await service.listModels(tenantId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('blog_post');
      expect(result[1].name).toBe('product');
    });

    it('should return empty array if no models exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      const result = await service.listModels(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('updateModel', () => {
    it('should update a content model successfully', async () => {
      const updateData = {
        name: 'updated_blog_post',
        description: 'Updated description',
      };

      mockDatabase.query
        .mockResolvedValueOnce({
          // getModel call
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: 'blog_post',
              plural_name: 'blog_posts',
              description: 'Old description',
              fields: [],
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({
          // update call
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: updateData.name,
              plural_name: 'blog_posts',
              description: updateData.description,
              fields: [],
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        });

      const result = await service.updateModel(tenantId, userId, modelId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.model.updated',
        expect.objectContaining({
          eventType: 'content.model.updated',
          modelId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.updateModel(tenantId, userId, modelId, { name: 'new_name' })
      ).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('deleteModel', () => {
    it('should delete a content model successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          // getModel call
          rows: [
            {
              id: modelId,
              tenant_id: tenantId,
              name: 'blog_post',
              plural_name: 'blog_posts',
              description: null,
              fields: [],
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
              updated_by: userId,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // delete call

      await service.deleteModel(tenantId, userId, modelId);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM content_models'),
        [modelId, tenantId]
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'content.model.deleted',
        expect.objectContaining({
          eventType: 'content.model.deleted',
          modelId,
        })
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.deleteModel(tenantId, userId, modelId)
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw ModelNotFoundError if model does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(
        service.deleteModel(tenantId, userId, modelId)
      ).rejects.toThrow(ModelNotFoundError);
    });
  });
});
