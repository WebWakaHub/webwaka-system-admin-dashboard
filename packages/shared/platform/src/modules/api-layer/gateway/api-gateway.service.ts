/**
 * API Gateway Service
 * 
 * Main service that orchestrates authentication, authorization, rate limiting,
 * validation, and routing for all API requests.
 */

import {
  ApiRequestContext,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiGatewayConfig,
} from '../types';
import { AuthenticationService } from '../auth/authentication.service';
import { AuthorizationService } from '../auth/authorization.service';
import { RateLimiterService } from '../rate-limit/rate-limiter.service';
import { RequestValidatorService } from '../validation/request-validator.service';
import { RequestRouterService } from '../routing/request-router.service';

export class ApiGatewayService {
  private authService: AuthenticationService;
  private authzService: AuthorizationService;
  private rateLimiter: RateLimiterService;
  private validator: RequestValidatorService;
  private router: RequestRouterService;
  private config: ApiGatewayConfig;

  constructor(config: ApiGatewayConfig) {
    this.config = config;
    this.authService = new AuthenticationService(config.jwtSecret);
    this.authzService = new AuthorizationService();
    this.rateLimiter = new RateLimiterService(
      undefined,
      config.defaultRateLimit.maxRequests,
      config.defaultRateLimit.windowSeconds,
      config.rateLimitEnabled
    );
    this.validator = new RequestValidatorService();
    this.router = new RequestRouterService();
  }

  /**
   * Process an incoming API request
   * 
   * @param request - Incoming request object
   * @returns Response object
   */
  async processRequest(request: IncomingRequest): Promise<ApiResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Find route
      const route = this.router.findRoute(request.path, request.method);
      if (!route) {
        return this.createErrorResponse(
          404,
          'NOT_FOUND',
          `Route not found: ${request.method} ${request.path}`,
          'unknown'
        );
      }

      // Step 2: Authentication (if required)
      let context: ApiRequestContext | undefined;
      if (route.requiresAuth) {
        const authResult = await this.authService.authenticate(
          request.headers.authorization,
          request.ipAddress,
          request.headers['user-agent']
        );

        if (!authResult.success) {
          return this.createErrorResponse(
            401,
            'UNAUTHORIZED',
            authResult.error || 'Authentication failed',
            'unknown'
          );
        }

        context = authResult.context;
      }

      // Step 3: Rate Limiting (if enabled)
      if (this.config.rateLimitEnabled && context) {
        const rateLimitResult = await this.rateLimiter.checkRateLimit(
          context.tenantId,
          context.userId
        );

        if (!rateLimitResult.allowed) {
          return this.createErrorResponse(
            429,
            'RATE_LIMIT_EXCEEDED',
            'Too many requests. Please try again later.',
            context.requestId,
            {
              resetAt: rateLimitResult.resetAt.toISOString(),
            }
          );
        }
      }

      // Step 4: Authorization (if required)
      if (route.requiredPermission && context) {
        const [resource, action] = route.requiredPermission.split(':');
        const authzResult = await this.authzService.checkPermission({
          tenantId: context.tenantId,
          userId: context.userId,
          resource,
          action,
        });

        if (!authzResult.allowed) {
          return this.createErrorResponse(
            403,
            'FORBIDDEN',
            authzResult.reason || 'Insufficient permissions',
            context.requestId
          );
        }
      }

      // Step 5: Request Validation
      // (In production, this would validate based on route-specific schema)
      // For now, we skip detailed validation

      // Step 6: Route to downstream module
      // (In production, this would make an HTTP call to the downstream service)
      // For now, we return a placeholder response
      const response = await this.routeToDownstream(route.module, request, context);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Log request (in production, send to logging service)
      this.logRequest(request, response.statusCode, processingTime, context);

      return response;
    } catch (error) {
      console.error('[ApiGateway] Error processing request:', error);
      return this.createErrorResponse(
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        'unknown'
      );
    }
  }

  /**
   * Route request to downstream module
   * 
   * @param module - Module name
   * @param request - Incoming request
   * @param context - Request context
   * @returns Response from downstream module
   */
  private async routeToDownstream(
    module: string,
    request: IncomingRequest,
    context?: ApiRequestContext
  ): Promise<ApiResponse> {
    // TODO: Implement actual routing to downstream modules
    // For now, return a placeholder response

    // In production, this would:
    // 1. Look up the downstream service URL
    // 2. Make an HTTP request to the service
    // 3. Transform and return the response

    // Placeholder implementation
    if (request.path === '/api/v1/health') {
      return {
        statusCode: 200,
        body: this.createSuccessResponse(
          { status: 'healthy', timestamp: new Date().toISOString() },
          'unknown'
        ),
      };
    }

    return {
      statusCode: 200,
      body: this.createSuccessResponse(
        {
          message: `Request routed to ${module}`,
          path: request.path,
          method: request.method,
        },
        context?.requestId || 'unknown'
      ),
    };
  }

  /**
   * Create success response
   * 
   * @param data - Response data
   * @param requestId - Request ID
   * @returns Success response object
   */
  private createSuccessResponse<T>(data: T, requestId: string): ApiSuccessResponse<T> {
    return {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: 'v1',
      },
    };
  }

  /**
   * Create error response
   * 
   * @param statusCode - HTTP status code
   * @param code - Error code
   * @param message - Error message
   * @param requestId - Request ID
   * @param details - Additional error details
   * @returns Error response object
   */
  private createErrorResponse(
    statusCode: number,
    code: string,
    message: string,
    requestId: string,
    details?: any
  ): ApiResponse {
    const errorResponse: ApiErrorResponse = {
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    return {
      statusCode,
      body: errorResponse,
    };
  }

  /**
   * Log API request
   * 
   * @param request - Incoming request
   * @param statusCode - Response status code
   * @param processingTime - Processing time in milliseconds
   * @param context - Request context
   */
  private logRequest(
    request: IncomingRequest,
    statusCode: number,
    processingTime: number,
    context?: ApiRequestContext
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: context?.requestId || 'unknown',
      tenantId: context?.tenantId,
      userId: context?.userId,
      method: request.method,
      path: request.path,
      statusCode,
      processingTime,
      ipAddress: request.ipAddress,
      userAgent: request.headers['user-agent'],
    };

    console.log('[ApiGateway]', JSON.stringify(logEntry));
  }

  /**
   * Get gateway statistics
   * 
   * @returns Gateway statistics
   */
  getStatistics(): GatewayStatistics {
    return {
      routes: this.router.getAllRoutes().length,
      rateLimitEnabled: this.config.rateLimitEnabled,
      corsEnabled: this.config.corsEnabled,
    };
  }

  /**
   * Close gateway and cleanup resources
   */
  async close(): Promise<void> {
    await this.rateLimiter.close();
    console.log('[ApiGateway] Closed');
  }
}

/**
 * Incoming Request
 * Represents an incoming HTTP request.
 */
export interface IncomingRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  ipAddress?: string;
}

/**
 * API Response
 * Represents an HTTP response.
 */
export interface ApiResponse {
  statusCode: number;
  body: ApiSuccessResponse | ApiErrorResponse;
  headers?: Record<string, string>;
}

/**
 * Gateway Statistics
 * Statistics about the API Gateway.
 */
export interface GatewayStatistics {
  routes: number;
  rateLimitEnabled: boolean;
  corsEnabled: boolean;
}
