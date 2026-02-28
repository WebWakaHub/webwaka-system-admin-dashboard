/**
 * API Gateway Configuration
 * 
 * Configuration settings for the API Gateway.
 * Supports environment-based configuration with sensible defaults.
 */

import { ApiGatewayConfig } from '../types';

/**
 * Load API Gateway configuration from environment variables
 */
export function loadGatewayConfig(): ApiGatewayConfig {
  return {
    port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
    host: process.env.API_GATEWAY_HOST || '0.0.0.0',
    corsEnabled: process.env.API_CORS_ENABLED !== 'false',
    corsOrigins: process.env.API_CORS_ORIGINS?.split(',') || ['*'],
    jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    defaultRateLimit: {
      maxRequests: parseInt(process.env.DEFAULT_RATE_LIMIT_MAX || '100', 10),
      windowSeconds: parseInt(process.env.DEFAULT_RATE_LIMIT_WINDOW || '60', 10),
    },
  };
}

/**
 * Validate API Gateway configuration
 * Ensures all required configuration is present and valid.
 */
export function validateGatewayConfig(config: ApiGatewayConfig): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port number: ${config.port}`);
  }

  if (!config.host) {
    throw new Error('Host is required');
  }

  if (!config.jwtSecret || config.jwtSecret === 'development-secret-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('WARNING: Using default JWT secret. Set JWT_SECRET environment variable.');
  }

  if (config.defaultRateLimit.maxRequests < 1) {
    throw new Error('Default rate limit maxRequests must be at least 1');
  }

  if (config.defaultRateLimit.windowSeconds < 1) {
    throw new Error('Default rate limit windowSeconds must be at least 1');
  }
}
