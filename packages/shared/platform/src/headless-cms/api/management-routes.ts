/**
 * Content Management API Routes
 * 
 * RESTful API endpoints for managing content models and entries
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HeadlessCMS } from '../HeadlessCMS';
import { ContentStatus } from '../types';

export async function registerManagementRoutes(
  fastify: FastifyInstance,
  cms: HeadlessCMS
): Promise<void> {
  const modelService = cms.getModelService();
  const entryService = cms.getEntryService();

  // ==================== Content Models ====================

  /**
   * Create a content model
   * POST /api/v1/cms/models
   */
  fastify.post('/api/v1/cms/models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const body = request.body as any;

      const model = await modelService.createModel(tenantId, userId, {
        name: body.name,
        pluralName: body.pluralName,
        description: body.description,
        fields: body.fields,
      });

      return reply.status(201).send({
        status: 'success',
        data: model,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * List all content models
   * GET /api/v1/cms/models
   */
  fastify.get('/api/v1/cms/models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;

      const models = await modelService.listModels(tenantId);

      return reply.send({
        status: 'success',
        data: models,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Get a content model by ID
   * GET /api/v1/cms/models/:modelId
   */
  fastify.get('/api/v1/cms/models/:modelId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const { modelId } = request.params as any;

      const model = await modelService.getModel(tenantId, modelId);

      return reply.send({
        status: 'success',
        data: model,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Update a content model
   * PUT /api/v1/cms/models/:modelId
   */
  fastify.put('/api/v1/cms/models/:modelId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { modelId } = request.params as any;
      const body = request.body as any;

      const model = await modelService.updateModel(tenantId, userId, modelId, {
        name: body.name,
        pluralName: body.pluralName,
        description: body.description,
        fields: body.fields,
      });

      return reply.send({
        status: 'success',
        data: model,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Delete a content model
   * DELETE /api/v1/cms/models/:modelId
   */
  fastify.delete('/api/v1/cms/models/:modelId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { modelId } = request.params as any;

      await modelService.deleteModel(tenantId, userId, modelId);

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  // ==================== Content Entries ====================

  /**
   * Create a content entry
   * POST /api/v1/cms/models/:modelId/entries
   */
  fastify.post('/api/v1/cms/models/:modelId/entries', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { modelId } = request.params as any;
      const body = request.body as any;

      const entry = await entryService.createEntry(
        tenantId,
        userId,
        modelId,
        body.data,
        body.status || ContentStatus.DRAFT
      );

      return reply.status(201).send({
        status: 'success',
        data: entry,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Query content entries
   * GET /api/v1/cms/models/:modelId/entries
   */
  fastify.get('/api/v1/cms/models/:modelId/entries', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const { modelId } = request.params as any;
      const query = request.query as any;

      const options = {
        filters: query.filters ? JSON.parse(query.filters) : undefined,
        sort: query.sort ? JSON.parse(query.sort) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        offset: query.offset ? parseInt(query.offset, 10) : undefined,
      };

      const result = await entryService.queryEntries(tenantId, modelId, options);

      return reply.send({
        status: 'success',
        ...result,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Get a content entry by ID
   * GET /api/v1/cms/entries/:entryId
   */
  fastify.get('/api/v1/cms/entries/:entryId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const { entryId } = request.params as any;

      const entry = await entryService.getEntry(tenantId, entryId);

      return reply.send({
        status: 'success',
        data: entry,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Update a content entry
   * PUT /api/v1/cms/entries/:entryId
   */
  fastify.put('/api/v1/cms/entries/:entryId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { entryId } = request.params as any;
      const body = request.body as any;

      const entry = await entryService.updateEntry(tenantId, userId, entryId, body.data);

      return reply.send({
        status: 'success',
        data: entry,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Publish a content entry
   * POST /api/v1/cms/entries/:entryId/publish
   */
  fastify.post('/api/v1/cms/entries/:entryId/publish', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { entryId } = request.params as any;

      const entry = await entryService.publishEntry(tenantId, userId, entryId);

      return reply.send({
        status: 'success',
        data: entry,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Archive a content entry
   * POST /api/v1/cms/entries/:entryId/archive
   */
  fastify.post('/api/v1/cms/entries/:entryId/archive', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { entryId } = request.params as any;

      const entry = await entryService.archiveEntry(tenantId, userId, entryId);

      return reply.send({
        status: 'success',
        data: entry,
      });
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Delete a content entry
   * DELETE /api/v1/cms/entries/:entryId
   */
  fastify.delete('/api/v1/cms/entries/:entryId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId } = (request as any).auth;
      const { entryId } = request.params as any;

      await entryService.deleteEntry(tenantId, userId, entryId);

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });
}
