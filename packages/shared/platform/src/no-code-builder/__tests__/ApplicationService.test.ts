/**
 * Unit tests for ApplicationService
 */

import { ApplicationService } from '../services/ApplicationService';
import {
  NoCodeBuilderConfig,
  DeploymentStatus,
  ApplicationNotFoundError,
  ValidationError,
  PermissionDeniedError,
} from '../types';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockConfig: NoCodeBuilderConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;

  const tenantId = 'tenant-123';
  const userId = 'user-456';
  const appId = 'app-789';

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mockPermissionSystem = {
      checkPermission: jest.fn().mockResolvedValue(true),
    };

    mockConfig = {
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
      deploymentProvider: {} as any,
    };

    service = new ApplicationService(mockConfig);
  });

  describe('createApplication', () => {
    it('should create an application successfully', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: appId,
            tenant_id: tenantId,
            created_by: userId,
            name: 'Test App',
            description: 'Test Description',
            definition: JSON.stringify({
              pages: [{ id: 'page-1', name: 'Home', path: '/', components: [] }],
              globalStyles: {},
            }),
            deployment_status: DeploymentStatus.DRAFT,
            public_url: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const result = await service.createApplication(tenantId, userId, {
        name: 'Test App',
        description: 'Test Description',
      });

      expect(result.id).toBe(appId);
      expect(result.name).toBe('Test App');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.created',
        expect.any(Object)
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.createApplication(tenantId, userId, { name: 'Test App' })
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw ValidationError if name is empty', async () => {
      await expect(
        service.createApplication(tenantId, userId, { name: '' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getApplication', () => {
    it('should retrieve an application by ID', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: appId,
            tenant_id: tenantId,
            created_by: userId,
            name: 'Test App',
            description: null,
            definition: JSON.stringify({
              pages: [],
              globalStyles: {},
            }),
            deployment_status: DeploymentStatus.DRAFT,
            public_url: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const result = await service.getApplication(tenantId, appId);

      expect(result.id).toBe(appId);
    });

    it('should throw ApplicationNotFoundError if app does not exist', async () => {
      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(service.getApplication(tenantId, appId)).rejects.toThrow(
        ApplicationNotFoundError
      );
    });
  });

  describe('listApplications', () => {
    it('should list all applications for a tenant', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [
          {
            id: 'app-1',
            tenant_id: tenantId,
            created_by: userId,
            name: 'App 1',
            description: null,
            definition: JSON.stringify({ pages: [], globalStyles: {} }),
            deployment_status: DeploymentStatus.DRAFT,
            public_url: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'app-2',
            tenant_id: tenantId,
            created_by: userId,
            name: 'App 2',
            description: null,
            definition: JSON.stringify({ pages: [], globalStyles: {} }),
            deployment_status: DeploymentStatus.LIVE,
            public_url: 'https://app2.example.com',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const result = await service.listApplications(tenantId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('App 1');
      expect(result[1].name).toBe('App 2');
    });
  });

  describe('updateApplication', () => {
    it('should update an application successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'Old Name',
              description: null,
              definition: JSON.stringify({ pages: [], globalStyles: {} }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'New Name',
              description: null,
              definition: JSON.stringify({ pages: [], globalStyles: {} }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });

      const result = await service.updateApplication(tenantId, userId, appId, {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.updated',
        expect.any(Object)
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.updateApplication(tenantId, userId, appId, { name: 'New Name' })
      ).rejects.toThrow(PermissionDeniedError);
    });
  });

  describe('deleteApplication', () => {
    it('should delete an application successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'Test App',
              description: null,
              definition: JSON.stringify({ pages: [], globalStyles: {} }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      await service.deleteApplication(tenantId, userId, appId);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.deleted',
        expect.any(Object)
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.deleteApplication(tenantId, userId, appId)
      ).rejects.toThrow(PermissionDeniedError);
    });
  });
});
