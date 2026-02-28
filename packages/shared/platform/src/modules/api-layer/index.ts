/**
 * API Layer Module
 * 
 * Unified API Gateway for the WebWaka platform.
 * Provides authentication, authorization, rate limiting, validation, and routing.
 * 
 * @module api-layer
 */

// Export types
export * from './types';

// Export configuration
export { loadGatewayConfig, validateGatewayConfig } from './config/gateway.config';

// Export core services
export { AuthenticationService } from './auth/authentication.service';
export { AuthorizationService } from './auth/authorization.service';
export { RateLimiterService } from './rate-limit/rate-limiter.service';
export { RequestValidatorService, ValidationSchema, FieldValidationRules } from './validation/request-validator.service';
export { RequestRouterService } from './routing/request-router.service';
export { ApiGatewayService, IncomingRequest, ApiResponse, GatewayStatistics } from './gateway/api-gateway.service';

// Export additional services
export { ResponseTransformerService, PaginationMeta, ValidationErrorDetail } from './response/response-transformer.service';
export { RequestLoggerService, LogLevel } from './logging/request-logger.service';
export { CorsMiddleware, CorsConfig } from './middleware/cors.middleware';
export { HealthCheckService, HealthStatus, ComponentHealth, HealthCheckResult } from './health/health-check.service';
export { MetricsCollectorService, MetricType, Metric, HistogramData, MetricsSummary } from './metrics/metrics-collector.service';
export { OpenApiGenerator, OpenApiConfig, OpenApiSpec } from './docs/openapi-generator';

/**
 * Initialize API Layer
 * 
 * Creates and configures an API Gateway instance.
 * 
 * @returns Configured API Gateway service
 */
export function initializeApiLayer(): ApiGatewayService {
  const { loadGatewayConfig, validateGatewayConfig } = require('./config/gateway.config');
  const { ApiGatewayService } = require('./gateway/api-gateway.service');

  // Load configuration
  const config = loadGatewayConfig();

  // Validate configuration
  validateGatewayConfig(config);

  // Create and return gateway
  return new ApiGatewayService(config);
}
