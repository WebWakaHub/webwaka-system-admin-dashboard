/**
 * Plugin System REST API Routes
 * Defines all API endpoints for plugin management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PluginManager } from '../manager/plugin-manager';
import { PluginRegistry } from '../registry/plugin-registry';
import { PluginSystemError } from '../errors';
import {
  PluginInstallRequest,
  PluginActivationRequest,
  PluginDeactivationRequest,
  PluginUninstallRequest,
  PluginConfigurationRequest,
} from '../types';

export interface PluginRoutesConfig {
  prefix?: string;
}

/**
 * Register plugin system routes
 */
export async function registerPluginRoutes(
  fastify: FastifyInstance,
  manager: PluginManager,
  registry: PluginRegistry,
  config?: PluginRoutesConfig
): Promise<void> {
  const prefix = config?.prefix || '/api/v1/plugins';

  /**
   * GET /plugins - List all available plugins
   */
  fastify.get(`${prefix}`, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const plugins = await registry.getAllPlugins();
      reply.send({
        status: 'success',
        data: plugins,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * GET /plugins/:pluginId - Get plugin details
   */
  fastify.get(`${prefix}/:pluginId`, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { pluginId } = request.params as { pluginId: string };
      const plugin = await registry.getPlugin(pluginId);
      reply.send({
        status: 'success',
        data: plugin,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * GET /plugins/search/:query - Search plugins
   */
  fastify.get(`${prefix}/search/:query`, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { query } = request.params as { query: string };
      const results = await registry.searchPlugins(query);
      reply.send({
        status: 'success',
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleError(error, reply);
    }
  });

  /**
   * POST /tenants/:tenantId/plugins - Install plugin for tenant
   */
  fastify.post(
    `/api/v1/tenants/:tenantId${prefix}`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const body = request.body as PluginInstallRequest;

        const result = await manager.installPlugin(tenantId, body);

        reply.status(201).send({
          status: 'success',
          data: result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * POST /tenants/:tenantId/plugins/:pluginId/activate - Activate plugin
   */
  fastify.post(
    `/api/v1/tenants/:tenantId${prefix}/:pluginId/activate`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId, pluginId } = request.params as {
          tenantId: string;
          pluginId: string;
        };

        const result = await manager.activatePlugin(tenantId, {
          pluginId,
        });

        reply.send({
          status: 'success',
          data: result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * POST /tenants/:tenantId/plugins/:pluginId/deactivate - Deactivate plugin
   */
  fastify.post(
    `/api/v1/tenants/:tenantId${prefix}/:pluginId/deactivate`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId, pluginId } = request.params as {
          tenantId: string;
          pluginId: string;
        };

        const result = await manager.deactivatePlugin(tenantId, {
          pluginId,
        });

        reply.send({
          status: 'success',
          data: result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * DELETE /tenants/:tenantId/plugins/:pluginId - Uninstall plugin
   */
  fastify.delete(
    `/api/v1/tenants/:tenantId${prefix}/:pluginId`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId, pluginId } = request.params as {
          tenantId: string;
          pluginId: string;
        };
        const query = request.query as { force?: string };

        await manager.uninstallPlugin(tenantId, {
          pluginId,
          force: query.force === 'true',
        });

        reply.status(204).send();
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * PUT /tenants/:tenantId/plugins/:pluginId/config - Update plugin configuration
   */
  fastify.put(
    `/api/v1/tenants/:tenantId${prefix}/:pluginId/config`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId, pluginId } = request.params as {
          tenantId: string;
          pluginId: string;
        };
        const body = request.body as { configuration: Record<string, unknown> };

        const result = await manager.configurePlugin(tenantId, {
          pluginId,
          configuration: body.configuration,
        });

        reply.send({
          status: 'success',
          data: result,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * GET /tenants/:tenantId/plugins - List tenant plugins
   */
  fastify.get(
    `/api/v1/tenants/:tenantId${prefix}`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const plugins = await manager.getTenantPlugins(tenantId);

        reply.send({
          status: 'success',
          data: plugins,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );

  /**
   * GET /tenants/:tenantId/plugins/active - List active tenant plugins
   */
  fastify.get(
    `/api/v1/tenants/:tenantId${prefix}/active`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const plugins = await manager.getActiveTenantPlugins(tenantId);

        reply.send({
          status: 'success',
          data: plugins,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error, reply);
      }
    }
  );
}

/**
 * Handle errors and send appropriate responses
 */
function handleError(error: unknown, reply: FastifyReply): void {
  if (error instanceof PluginSystemError) {
    reply.status(error.statusCode).send({
      status: 'error',
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    });
  } else if (error instanceof Error) {
    reply.status(500).send({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    reply.status(500).send({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unknown error occurred',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
