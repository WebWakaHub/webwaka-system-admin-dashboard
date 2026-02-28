/**
 * Content Delivery API Routes
 * 
 * Public read-only API for delivering content to front-end applications
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HeadlessCMS } from '../HeadlessCMS';

export async function registerDeliveryRoutes(
  fastify: FastifyInstance,
  cms: HeadlessCMS
): Promise<void> {
  const deliveryService = cms.getDeliveryService();

  /**
   * Get content entries by model plural name
   * GET /api/v1/content/:modelPluralName
   */
  fastify.get('/api/v1/content/:modelPluralName', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const { modelPluralName } = request.params as any;
      const query = request.query as any;

      const options = {
        filters: query.filters ? JSON.parse(query.filters) : undefined,
        sort: query.sort ? JSON.parse(query.sort) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        offset: query.offset ? parseInt(query.offset, 10) : undefined,
      };

      const result = await deliveryService.getContentByModel(
        tenantId,
        modelPluralName,
        options
      );

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
   * Get a single content entry by ID
   * GET /api/v1/content/entry/:entryId
   */
  fastify.get('/api/v1/content/entry/:entryId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const { entryId } = request.params as any;

      const entry = await deliveryService.getContentById(tenantId, entryId);

      if (!entry) {
        return reply.status(404).send({
          status: 'error',
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Content entry not found or not published',
          },
        });
      }

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
   * Search content across all models
   * GET /api/v1/content/search
   */
  fastify.get('/api/v1/content/search', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = (request as any).auth;
      const query = request.query as any;

      if (!query.q) {
        return reply.status(400).send({
          status: 'error',
          error: {
            code: 'MISSING_SEARCH_TERM',
            message: 'Search term (q) is required',
          },
        });
      }

      const options = {
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        offset: query.offset ? parseInt(query.offset, 10) : undefined,
      };

      const result = await deliveryService.searchContent(
        tenantId,
        query.q,
        options
      );

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
}
