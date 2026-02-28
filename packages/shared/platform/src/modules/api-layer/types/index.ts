/**
 * API Layer Types and Interfaces
 * 
 * Core type definitions for the API Layer module.
 * Provides type safety for authentication, authorization, rate limiting, and routing.
 */

/**
 * API Request Context
 * Contains authentication and tenant information extracted from the request.
 */
export interface ApiRequestContext {
  tenantId: string;
  userId: string;
  requestId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * JWT Payload
 * Structure of the JWT token payload.
 */
export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  email?: string;
  roles?: string[];
  iat?: number; // issued at
  exp?: number; // expiration
}

/**
 * Authentication Result
 * Result of authentication validation.
 */
export interface AuthenticationResult {
  success: boolean;
  context?: ApiRequestContext;
  error?: string;
}

/**
 * Authorization Request
 * Request to check permissions via WEEG.
 */
export interface AuthorizationRequest {
  tenantId: string;
  userId: string;
  resource: string;
  action: string;
}

/**
 * Authorization Result
 * Result of authorization check.
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Rate Limit Rule
 * Configuration for rate limiting.
 */
export interface RateLimitRule {
  id: string;
  tenantId?: string; // null for global rules
  userId?: string; // null for tenant-wide rules
  maxRequests: number;
  windowSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rate Limit Check Result
 * Result of rate limit check.
 */
export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * API Route Configuration
 * Configuration for routing requests to downstream modules.
 */
export interface ApiRouteConfig {
  path: string;
  method: string;
  module: string;
  version: string;
  requiresAuth: boolean;
  requiredPermission?: string;
}

/**
 * API Error Response
 * Standard error response format.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

/**
 * API Success Response
 * Standard success response format.
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

/**
 * API Gateway Configuration
 * Configuration for the API Gateway.
 */
export interface ApiGatewayConfig {
  port: number;
  host: string;
  corsEnabled: boolean;
  corsOrigins: string[];
  jwtSecret: string;
  rateLimitEnabled: boolean;
  defaultRateLimit: {
    maxRequests: number;
    windowSeconds: number;
  };
}

/**
 * Request Validation Error
 * Error details for validation failures.
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Request Validation Result
 * Result of request validation.
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}
