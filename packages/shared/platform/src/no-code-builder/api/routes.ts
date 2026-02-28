/**
 * API routes for the No-Code/Low-Code Builder
 */

import { NoCodeBuilder } from '../NoCodeBuilder';
import {
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from '../types';

export function registerBuilderRoutes(app: any, builder: NoCodeBuilder) {
  const appService = builder.getApplicationService();
  const deploymentService = builder.getDeploymentService();

  /**
   * POST /api/v1/builder/apps
   * Create a new application
   */
  app.post('/api/v1/builder/apps', async (req: any, res: any) => {
    try {
      const { tenantId, userId } = req.auth;
      const request: CreateApplicationRequest = req.body;

      const application = await appService.createApplication(
        tenantId,
        userId,
        request
      );

      res.status(201).json({
        status: 'success',
        data: application,
      });
    } catch (error: any) {
      res.status(error.name === 'ValidationError' ? 400 : 500).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/builder/apps
   * List all applications for the tenant
   */
  app.get('/api/v1/builder/apps', async (req: any, res: any) => {
    try {
      const { tenantId } = req.auth;

      const applications = await appService.listApplications(tenantId);

      res.status(200).json({
        status: 'success',
        data: applications,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/builder/apps/:appId
   * Get a specific application
   */
  app.get('/api/v1/builder/apps/:appId', async (req: any, res: any) => {
    try {
      const { tenantId } = req.auth;
      const { appId } = req.params;

      const application = await appService.getApplication(tenantId, appId);

      res.status(200).json({
        status: 'success',
        data: application,
      });
    } catch (error: any) {
      const statusCode = error.name === 'ApplicationNotFoundError' ? 404 : 500;
      res.status(statusCode).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * PUT /api/v1/builder/apps/:appId
   * Update an application
   */
  app.put('/api/v1/builder/apps/:appId', async (req: any, res: any) => {
    try {
      const { tenantId, userId } = req.auth;
      const { appId } = req.params;
      const request: UpdateApplicationRequest = req.body;

      const application = await appService.updateApplication(
        tenantId,
        userId,
        appId,
        request
      );

      res.status(200).json({
        status: 'success',
        data: application,
      });
    } catch (error: any) {
      const statusCode = error.name === 'ApplicationNotFoundError' ? 404 :
                         error.name === 'PermissionDeniedError' ? 403 :
                         error.name === 'ValidationError' ? 400 : 500;
      res.status(statusCode).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * DELETE /api/v1/builder/apps/:appId
   * Delete an application
   */
  app.delete('/api/v1/builder/apps/:appId', async (req: any, res: any) => {
    try {
      const { tenantId, userId } = req.auth;
      const { appId } = req.params;

      await appService.deleteApplication(tenantId, userId, appId);

      res.status(200).json({
        status: 'success',
        message: 'Application deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.name === 'ApplicationNotFoundError' ? 404 :
                         error.name === 'PermissionDeniedError' ? 403 : 500;
      res.status(statusCode).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/builder/apps/:appId/deploy
   * Deploy an application
   */
  app.post('/api/v1/builder/apps/:appId/deploy', async (req: any, res: any) => {
    try {
      const { tenantId, userId } = req.auth;
      const { appId } = req.params;

      const publicUrl = await deploymentService.deployApplication(
        tenantId,
        userId,
        appId
      );

      res.status(200).json({
        status: 'success',
        data: {
          publicUrl,
        },
      });
    } catch (error: any) {
      const statusCode = error.name === 'ApplicationNotFoundError' ? 404 :
                         error.name === 'PermissionDeniedError' ? 403 :
                         error.name === 'DeploymentError' ? 500 : 500;
      res.status(statusCode).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/builder/apps/:appId/undeploy
   * Undeploy an application
   */
  app.post('/api/v1/builder/apps/:appId/undeploy', async (req: any, res: any) => {
    try {
      const { tenantId, userId } = req.auth;
      const { appId } = req.params;

      await deploymentService.undeployApplication(tenantId, userId, appId);

      res.status(200).json({
        status: 'success',
        message: 'Application undeployed successfully',
      });
    } catch (error: any) {
      const statusCode = error.name === 'ApplicationNotFoundError' ? 404 :
                         error.name === 'PermissionDeniedError' ? 403 :
                         error.name === 'DeploymentError' ? 500 : 500;
      res.status(statusCode).json({
        status: 'error',
        error: {
          code: error.name,
          message: error.message,
        },
      });
    }
  });
}
