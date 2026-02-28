/**
 * Unit Tests for OpenAPI Generator
 * 
 * Tests API documentation generation.
 */

import { OpenApiGenerator } from '../../docs/openapi-generator';
import { ApiRouteConfig } from '../../types';

describe('OpenApiGenerator', () => {
  let generator: OpenApiGenerator;
  const mockRoutes: ApiRouteConfig[] = [
    {
      path: '/api/v1/users',
      method: 'GET',
      module: 'users',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'users:read',
    },
    {
      path: '/api/v1/users/:id',
      method: 'GET',
      module: 'users',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'users:read',
    },
    {
      path: '/api/v1/users',
      method: 'POST',
      module: 'users',
      version: 'v1',
      requiresAuth: true,
      requiredPermission: 'users:create',
    },
  ];

  beforeEach(() => {
    generator = new OpenApiGenerator({
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API Documentation',
      baseUrl: 'https://api.test.com',
    });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const gen = new OpenApiGenerator({});
      const spec = gen.generateSpec([]);

      expect(spec.info.title).toBe('WebWaka API');
      expect(spec.info.version).toBe('1.0.0');
    });

    it('should use custom configuration', () => {
      const spec = generator.generateSpec([]);

      expect(spec.info.title).toBe('Test API');
      expect(spec.info.version).toBe('1.0.0');
      expect(spec.info.description).toBe('Test API Documentation');
      expect(spec.servers[0].url).toBe('https://api.test.com');
    });
  });

  describe('generateSpec', () => {
    it('should generate OpenAPI 3.0 specification', () => {
      const spec = generator.generateSpec(mockRoutes);

      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info).toBeDefined();
      expect(spec.servers).toBeDefined();
      expect(spec.paths).toBeDefined();
      expect(spec.components).toBeDefined();
    });

    it('should include all routes', () => {
      const spec = generator.generateSpec(mockRoutes);

      expect(spec.paths['/api/v1/users']).toBeDefined();
      expect(spec.paths['/api/v1/users/:id']).toBeDefined();
    });

    it('should group routes by path', () => {
      const spec = generator.generateSpec(mockRoutes);

      expect(spec.paths['/api/v1/users'].get).toBeDefined();
      expect(spec.paths['/api/v1/users'].post).toBeDefined();
    });

    it('should include security schemes', () => {
      const spec = generator.generateSpec(mockRoutes);

      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth.type).toBe('http');
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
    });

    it('should include response schemas', () => {
      const spec = generator.generateSpec(mockRoutes);

      expect(spec.components.schemas.SuccessResponse).toBeDefined();
      expect(spec.components.schemas.ErrorResponse).toBeDefined();
    });
  });

  describe('generateOperation', () => {
    it('should extract path parameters', () => {
      const spec = generator.generateSpec(mockRoutes);
      const operation = spec.paths['/api/v1/users/:id'].get;

      expect(operation.parameters).toBeDefined();
      expect(operation.parameters.length).toBeGreaterThan(0);
      expect(operation.parameters[0].name).toBe('id');
      expect(operation.parameters[0].in).toBe('path');
      expect(operation.parameters[0].required).toBe(true);
    });

    it('should include request body for POST/PUT/PATCH', () => {
      const spec = generator.generateSpec(mockRoutes);
      const operation = spec.paths['/api/v1/users'].post;

      expect(operation.requestBody).toBeDefined();
      expect(operation.requestBody.required).toBe(true);
    });

    it('should not include request body for GET', () => {
      const spec = generator.generateSpec(mockRoutes);
      const operation = spec.paths['/api/v1/users'].get;

      expect(operation.requestBody).toBeUndefined();
    });

    it('should include security when required', () => {
      const spec = generator.generateSpec(mockRoutes);
      const operation = spec.paths['/api/v1/users'].get;

      expect(operation.security).toBeDefined();
      expect(operation.security[0].bearerAuth).toBeDefined();
    });

    it('should include standard response codes', () => {
      const spec = generator.generateSpec(mockRoutes);
      const operation = spec.paths['/api/v1/users'].get;

      expect(operation.responses['200']).toBeDefined();
      expect(operation.responses['400']).toBeDefined();
      expect(operation.responses['401']).toBeDefined();
      expect(operation.responses['403']).toBeDefined();
      expect(operation.responses['429']).toBeDefined();
      expect(operation.responses['500']).toBeDefined();
    });
  });

  describe('generateHtml', () => {
    it('should generate HTML documentation', () => {
      const spec = generator.generateSpec(mockRoutes);
      const html = generator.generateHtml(spec);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test API');
      expect(html).toContain('swagger-ui');
      expect(html).toContain(JSON.stringify(spec, null, 2));
    });

    it('should include Swagger UI scripts', () => {
      const spec = generator.generateSpec(mockRoutes);
      const html = generator.generateHtml(spec);

      expect(html).toContain('swagger-ui-dist');
      expect(html).toContain('swagger-ui-bundle.js');
    });
  });

  describe('edge cases', () => {
    it('should handle empty routes', () => {
      const spec = generator.generateSpec([]);

      expect(spec.paths).toEqual({});
    });

    it('should handle routes without parameters', () => {
      const routes: ApiRouteConfig[] = [
        {
          path: '/api/v1/health',
          method: 'GET',
          module: 'health',
          version: 'v1',
          requiresAuth: false,
        },
      ];

      const spec = generator.generateSpec(routes);
      const operation = spec.paths['/api/v1/health'].get;

      expect(operation.parameters).toEqual([]);
    });

    it('should handle routes without authentication', () => {
      const routes: ApiRouteConfig[] = [
        {
          path: '/api/v1/public',
          method: 'GET',
          module: 'public',
          version: 'v1',
          requiresAuth: false,
        },
      ];

      const spec = generator.generateSpec(routes);
      const operation = spec.paths['/api/v1/public'].get;

      expect(operation.security).toBeUndefined();
    });
  });
});
