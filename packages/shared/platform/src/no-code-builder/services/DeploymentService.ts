/**
 * DeploymentService
 * Handles the deployment of applications to a public URL
 */

import {
  ApplicationDefinition,
  DeploymentStatus,
  NoCodeBuilderConfig,
  DeploymentError,
  PermissionDeniedError,
} from '../types';
import { ApplicationService } from './ApplicationService';

export class DeploymentService {
  private config: NoCodeBuilderConfig;
  private appService: ApplicationService;

  constructor(config: NoCodeBuilderConfig) {
    this.config = config;
    this.appService = new ApplicationService(config);
  }

  /**
   * Deploy an application
   */
  async deployApplication(
    tenantId: string,
    userId: string,
    appId: string
  ): Promise<string> {
    // Check permission
    const hasPermission = await this.config.permissionSystem.checkPermission(
      tenantId,
      userId,
      'builder.app.deploy'
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to deploy applications');
    }

    // Get application
    const app = await this.appService.getApplication(tenantId, appId);

    // Validate application
    this.validateApplication(app);

    // Update status to DEPLOYING
    await this.appService.updateDeploymentStatus(
      tenantId,
      appId,
      DeploymentStatus.DEPLOYING
    );

    try {
      // Deploy using the deployment provider
      const publicUrl = await this.config.deploymentProvider.deploy(appId, app);

      // Update status to LIVE
      await this.appService.updateDeploymentStatus(
        tenantId,
        appId,
        DeploymentStatus.LIVE,
        publicUrl
      );

      // Emit event
      await this.config.eventBus.publish('builder.app.deployed', {
        eventType: 'builder.app.deployed',
        tenantId,
        appId,
        userId,
        publicUrl,
        timestamp: new Date().toISOString(),
      });

      return publicUrl;
    } catch (error: any) {
      // Update status to FAILED
      await this.appService.updateDeploymentStatus(
        tenantId,
        appId,
        DeploymentStatus.FAILED
      );

      throw new DeploymentError(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Undeploy an application
   */
  async undeployApplication(
    tenantId: string,
    userId: string,
    appId: string
  ): Promise<void> {
    // Check permission
    const hasPermission = await this.config.permissionSystem.checkPermission(
      tenantId,
      userId,
      'builder.app.deploy'
    );

    if (!hasPermission) {
      throw new PermissionDeniedError('User does not have permission to undeploy applications');
    }

    // Get application
    const app = await this.appService.getApplication(tenantId, appId);

    if (app.deploymentStatus !== DeploymentStatus.LIVE) {
      throw new DeploymentError('Application is not currently deployed');
    }

    try {
      // Undeploy using the deployment provider
      await this.config.deploymentProvider.undeploy(appId);

      // Update status to DRAFT
      await this.appService.updateDeploymentStatus(
        tenantId,
        appId,
        DeploymentStatus.DRAFT
      );

      // Emit event
      await this.config.eventBus.publish('builder.app.undeployed', {
        eventType: 'builder.app.undeployed',
        tenantId,
        appId,
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      throw new DeploymentError(`Undeployment failed: ${error.message}`);
    }
  }

  /**
   * Validate application before deployment
   */
  private validateApplication(app: ApplicationDefinition): void {
    // Check if application has at least one page
    if (!app.pages || app.pages.length === 0) {
      throw new DeploymentError('Application must have at least one page');
    }

    // Check if all pages have valid paths
    for (const page of app.pages) {
      if (!page.path || page.path.trim() === '') {
        throw new DeploymentError(`Page "${page.name}" must have a valid path`);
      }
    }

    // Check for duplicate paths
    const paths = app.pages.map(p => p.path);
    const uniquePaths = new Set(paths);
    if (paths.length !== uniquePaths.size) {
      throw new DeploymentError('Application has duplicate page paths');
    }
  }
}
