/**
 * Integration tests for the No-Code/Low-Code Builder module
 */

import { NoCodeBuilder } from '../NoCodeBuilder';
import {
  NoCodeBuilderConfig,
  DeploymentStatus,
  ComponentType,
} from '../types';

describe('NoCodeBuilder Integration Tests', () => {
  let builder: NoCodeBuilder;
  let mockConfig: NoCodeBuilderConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;
  let mockDeploymentProvider: any;

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

    mockDeploymentProvider = {
      deploy: jest.fn().mockImplementation((appId) => {
        return Promise.resolve(`https://${appId}.example.com`);
      }),
      undeploy: jest.fn().mockResolvedValue(undefined),
    };

    mockConfig = {
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
      deploymentProvider: mockDeploymentProvider,
    };

    // Mock database responses for table creation
    mockDatabase.query.mockResolvedValue({ rows: [] });

    builder = new NoCodeBuilder(mockConfig);
    await builder.initialize();
  });

  afterAll(async () => {
    await builder.shutdown();
  });

  describe('Complete Application Lifecycle', () => {
    it('should create, update, deploy, and delete an application', async () => {
      const appService = builder.getApplicationService();
      const deploymentService = builder.getDeploymentService();

      // Step 1: Create application
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'app-lifecycle-test',
            tenant_id: tenantId,
            created_by: userId,
            name: 'Lifecycle Test App',
            description: 'Testing complete lifecycle',
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

      const app = await appService.createApplication(tenantId, userId, {
        name: 'Lifecycle Test App',
        description: 'Testing complete lifecycle',
      });

      expect(app.id).toBe('app-lifecycle-test');
      expect(app.deploymentStatus).toBe(DeploymentStatus.DRAFT);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.created',
        expect.any(Object)
      );

      // Step 2: Update application with components
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-lifecycle-test',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Lifecycle Test App',
              description: 'Testing complete lifecycle',
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
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-lifecycle-test',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Lifecycle Test App',
              description: 'Testing complete lifecycle',
              definition: JSON.stringify({
                pages: [
                  {
                    id: 'page-1',
                    name: 'Home',
                    path: '/',
                    components: [
                      {
                        id: 'text-1',
                        type: ComponentType.TEXT,
                        properties: { content: 'Welcome!' },
                      },
                    ],
                  },
                ],
                globalStyles: {},
              }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });

      const updatedApp = await appService.updateApplication(
        tenantId,
        userId,
        app.id,
        {
          pages: [
            {
              id: 'page-1',
              name: 'Home',
              path: '/',
              components: [
                {
                  id: 'text-1',
                  type: ComponentType.TEXT,
                  properties: { content: 'Welcome!' },
                },
              ],
            },
          ],
        }
      );

      expect(updatedApp.pages[0].components).toHaveLength(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.updated',
        expect.any(Object)
      );

      // Step 3: Deploy application
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-lifecycle-test',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Lifecycle Test App',
              description: 'Testing complete lifecycle',
              definition: JSON.stringify({
                pages: [
                  {
                    id: 'page-1',
                    name: 'Home',
                    path: '/',
                    components: [
                      {
                        id: 'text-1',
                        type: ComponentType.TEXT,
                        properties: { content: 'Welcome!' },
                      },
                    ],
                  },
                ],
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

      const publicUrl = await deploymentService.deployApplication(
        tenantId,
        userId,
        app.id
      );

      expect(publicUrl).toBe('https://app-lifecycle-test.example.com');
      expect(mockDeploymentProvider.deploy).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.deployed',
        expect.any(Object)
      );

      // Step 4: Delete application
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-lifecycle-test',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Lifecycle Test App',
              description: 'Testing complete lifecycle',
              definition: JSON.stringify({
                pages: [
                  {
                    id: 'page-1',
                    name: 'Home',
                    path: '/',
                    components: [],
                  },
                ],
                globalStyles: {},
              }),
              deployment_status: DeploymentStatus.LIVE,
              public_url: publicUrl,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      await appService.deleteApplication(tenantId, userId, app.id);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'builder.app.deleted',
        expect.any(Object)
      );
    });
  });

  describe('Multi-Page Application', () => {
    it('should create and deploy a multi-page application', async () => {
      const appService = builder.getApplicationService();
      const deploymentService = builder.getDeploymentService();

      // Create application with multiple pages
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'app-multipage',
            tenant_id: tenantId,
            created_by: userId,
            name: 'Multi-Page App',
            description: null,
            definition: JSON.stringify({
              pages: [
                { id: 'page-1', name: 'Home', path: '/', components: [] },
                { id: 'page-2', name: 'About', path: '/about', components: [] },
                { id: 'page-3', name: 'Contact', path: '/contact', components: [] },
              ],
              globalStyles: {},
            }),
            deployment_status: DeploymentStatus.DRAFT,
            public_url: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const app = await appService.createApplication(tenantId, userId, {
        name: 'Multi-Page App',
      });

      // Update with multiple pages
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-multipage',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Multi-Page App',
              description: null,
              definition: JSON.stringify({
                pages: [
                  { id: 'page-1', name: 'Home', path: '/', components: [] },
                ],
                globalStyles: {},
              }),
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
              id: 'app-multipage',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Multi-Page App',
              description: null,
              definition: JSON.stringify({
                pages: [
                  { id: 'page-1', name: 'Home', path: '/', components: [] },
                  { id: 'page-2', name: 'About', path: '/about', components: [] },
                  { id: 'page-3', name: 'Contact', path: '/contact', components: [] },
                ],
                globalStyles: {},
              }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });

      const updatedApp = await appService.updateApplication(
        tenantId,
        userId,
        app.id,
        {
          pages: [
            { id: 'page-1', name: 'Home', path: '/', components: [] },
            { id: 'page-2', name: 'About', path: '/about', components: [] },
            { id: 'page-3', name: 'Contact', path: '/contact', components: [] },
          ],
        }
      );

      expect(updatedApp.pages).toHaveLength(3);

      // Deploy the multi-page application
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'app-multipage',
              tenant_id: tenantId,
              created_by: userId,
              name: 'Multi-Page App',
              description: null,
              definition: JSON.stringify({
                pages: [
                  { id: 'page-1', name: 'Home', path: '/', components: [] },
                  { id: 'page-2', name: 'About', path: '/about', components: [] },
                  { id: 'page-3', name: 'Contact', path: '/contact', components: [] },
                ],
                globalStyles: {},
              }),
              deployment_status: DeploymentStatus.DRAFT,
              public_url: null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const publicUrl = await deploymentService.deployApplication(
        tenantId,
        userId,
        app.id
      );

      expect(publicUrl).toBe('https://app-multipage.example.com');
    });
  });

  describe('Tenant Isolation', () => {
    it('should maintain strict tenant isolation', async () => {
      const appService = builder.getApplicationService();
      const tenant1 = 'tenant-1';
      const tenant2 = 'tenant-2';

      // Create app for tenant 1
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'app-tenant1',
            tenant_id: tenant1,
            created_by: userId,
            name: 'Tenant 1 App',
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

      await appService.createApplication(tenant1, userId, {
        name: 'Tenant 1 App',
      });

      // Try to access tenant 1's app from tenant 2
      mockDatabase.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        appService.getApplication(tenant2, 'app-tenant1')
      ).rejects.toThrow();
    });
  });
});
