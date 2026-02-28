/**
 * OpenAPI Documentation Generator
 * 
 * Generates OpenAPI/Swagger documentation for the API Layer.
 * Provides interactive API documentation for developers.
 */

import { ApiRouteConfig } from '../types';

export class OpenApiGenerator {
  private title: string;
  private version: string;
  private description: string;
  private baseUrl: string;

  constructor(config: OpenApiConfig) {
    this.title = config.title || 'WebWaka API';
    this.version = config.version || '1.0.0';
    this.description = config.description || 'WebWaka Platform API Documentation';
    this.baseUrl = config.baseUrl || 'https://api.webwaka.com';
  }

  /**
   * Generate OpenAPI specification
   * 
   * @param routes - API routes
   * @returns OpenAPI specification
   */
  generateSpec(routes: ApiRouteConfig[]): OpenApiSpec {
    const paths: Record<string, any> = {};

    // Group routes by path
    const routesByPath = this.groupRoutesByPath(routes);

    for (const [path, pathRoutes] of routesByPath.entries()) {
      paths[path] = {};

      for (const route of pathRoutes) {
        const method = route.method.toLowerCase();
        paths[path][method] = this.generateOperation(route);
      }
    }

    return {
      openapi: '3.0.0',
      info: {
        title: this.title,
        version: this.version,
        description: this.description,
      },
      servers: [
        {
          url: this.baseUrl,
          description: 'Production server',
        },
      ],
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: this.generateSchemas(),
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    };
  }

  /**
   * Generate operation for a route
   * 
   * @param route - API route
   * @returns OpenAPI operation
   */
  private generateOperation(route: ApiRouteConfig): any {
    const operation: any = {
      summary: `${route.method} ${route.path}`,
      description: `${route.method} request to ${route.module} module`,
      tags: [route.module],
      parameters: this.extractParameters(route.path),
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse',
              },
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Too Many Requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    };

    // Add security if required
    if (route.requiresAuth) {
      operation.security = [{ bearerAuth: [] }];
    }

    // Add request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
      };
    }

    return operation;
  }

  /**
   * Extract path parameters
   * 
   * @param path - Route path
   * @returns Array of parameters
   */
  private extractParameters(path: string): any[] {
    const params: any[] = [];
    const matches = path.match(/:(\w+)/g);

    if (matches) {
      for (const match of matches) {
        const paramName = match.substring(1);
        params.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: `${paramName} parameter`,
        });
      }
    }

    return params;
  }

  /**
   * Generate common schemas
   * 
   * @returns Schema definitions
   */
  private generateSchemas(): Record<string, any> {
    return {
      SuccessResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            description: 'Response data',
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              requestId: {
                type: 'string',
                format: 'uuid',
              },
              version: {
                type: 'string',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
              },
              message: {
                type: 'string',
              },
              details: {
                type: 'object',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              requestId: {
                type: 'string',
                format: 'uuid',
              },
            },
            required: ['code', 'message', 'timestamp', 'requestId'],
          },
        },
      },
    };
  }

  /**
   * Group routes by path
   * 
   * @param routes - API routes
   * @returns Routes grouped by path
   */
  private groupRoutesByPath(routes: ApiRouteConfig[]): Map<string, ApiRouteConfig[]> {
    const grouped = new Map<string, ApiRouteConfig[]>();

    for (const route of routes) {
      if (!grouped.has(route.path)) {
        grouped.set(route.path, []);
      }
      grouped.get(route.path)!.push(route);
    }

    return grouped;
  }

  /**
   * Generate HTML documentation
   * 
   * @param spec - OpenAPI specification
   * @returns HTML string
   */
  generateHtml(spec: OpenApiSpec): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.title} - API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        spec: ${JSON.stringify(spec, null, 2)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
      });
    };
  </script>
</body>
</html>
    `;
  }
}

/**
 * OpenAPI Configuration
 */
export interface OpenApiConfig {
  title?: string;
  version?: string;
  description?: string;
  baseUrl?: string;
}

/**
 * OpenAPI Specification
 */
export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    securitySchemes: Record<string, any>;
    schemas: Record<string, any>;
  };
  security: Array<Record<string, any>>;
}
