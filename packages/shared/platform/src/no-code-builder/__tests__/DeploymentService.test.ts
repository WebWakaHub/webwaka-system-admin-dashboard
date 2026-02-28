/**
 * Unit tests for DeploymentService
 */

import { DeploymentService } from '../services/DeploymentService';
import {
  NoCodeBuilderConfig,
  DeploymentStatus,
  DeploymentError,
  PermissionDeniedError,
} from '../types';

describe('DeploymentService', () => {
  let service: DeploymentService;
  let mockConfig: NoCodeBuilderConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;
  let mockDeploymentProvider: any;

  const tenantId = 'tenant-123';
  const userId = 'user-456';
  const appId = 'app-789';
  const publicUrl = 'https://app-789.example.com';

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

    mockDeploymentProvider = {
      deploy: jest.fn().mockResolvedValue(publicUrl),
      undeploy: jest.fn().mockResolvedValue(undefined),
    };

    mockConfig = {
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
      deploymentProvider: mockDeploymentProvider,
    };

    service = new DeploymentService(mockConfig);
  });

  describe('deployApplication', () => {
    it('should deploy an application successfully', async () => {
      // Mock getApplication
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'Test App',
              description: null,
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
        })
        .mockResolvedValueOnce({ rows: [] }) // updateDeploymentStatus (DEPLOYING)
        .mockResolvedValueOnce({ rows: [] }); // updateDeploymentStatus (LIVE)

      const result = await service.deployApplication(tenantId, userId, appId);

      expect(result).toBe(publicUrl);
      expect(mockDeploymentProvider.deploy).toHaveBeenCalledWith(appId, expect.any(Object));
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.deployed',
        expect.any(Object)
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.deployApplication(tenantId, userId, appId)
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw DeploymentError if application has no pages', async () => {
      mockDatabase.query.mockResolvedValueOnce({
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

      await expect(
        service.deployApplication(tenantId, userId, appId)
      ).rejects.toThrow(DeploymentError);
    });

    it('should throw DeploymentError if deployment provider fails', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'Test App',
              description: null,
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
        })
        .mockResolvedValueOnce({ rows: [] }) // updateDeploymentStatus (DEPLOYING)
        .mockResolvedValueOnce({ rows: [] }); // updateDeploymentStatus (FAILED)

      mockDeploymentProvider.deploy.mockRejectedValue(new Error('Deployment failed'));

      await expect(
        service.deployApplication(tenantId, userId, appId)
      ).rejects.toThrow(DeploymentError);
    });
  });

  describe('undeployApplication', () => {
    it('should undeploy an application successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: appId,
              tenant_id: tenantId,
              created_by: userId,
              name: 'Test App',
              description: null,
              definition: JSON.stringify({
                pages: [{ id: 'page-1', name: 'Home', path: '/', components: [] }],
                globalStyles: {},
              }),
              deployment_status: DeploymentStatus.LIVE,
              public_url: publicUrl,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // updateDeploymentStatus (DRAFT)

      await service.undeployApplication(tenantId, userId, appId);

      expect(mockDeploymentProvider.undeploy).toHaveBeenCalledWith(appId);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.undeployed',
        expect.any(Object)
      );
    });

    it('should throw PermissionDeniedError if user lacks permission', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValue(false);

      await expect(
        service.undeployApplication(tenantId, userId, appId)
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should throw DeploymentError if application is not deployed', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: appId,
            tenant_id: tenantId,
            created_by: userId,
            name: 'Test App',
            description: null,
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

      await expect(
        service.undeployApplication(tenantId, userId, appId)
      ).rejects.toThrow(DeploymentError);
    });
  });
});
