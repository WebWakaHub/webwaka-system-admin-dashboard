/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing (CORS) for the API Layer.
 * Configurable origins, methods, and headers.
 */

export class CorsMiddleware {
  private allowedOrigins: string[];
  private allowedMethods: string[];
  private allowedHeaders: string[];
  private exposedHeaders: string[];
  private maxAge: number;
  private credentials: boolean;

  constructor(config?: CorsConfig) {
    this.allowedOrigins = config?.allowedOrigins || ['*'];
    this.allowedMethods = config?.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    this.allowedHeaders = config?.allowedHeaders || ['Content-Type', 'Authorization', 'X-Request-ID'];
    this.exposedHeaders = config?.exposedHeaders || ['X-Request-ID', 'X-Rate-Limit-Remaining'];
    this.maxAge = config?.maxAge || 86400; // 24 hours
    this.credentials = config?.credentials !== undefined ? config.credentials : true;
  }

  /**
   * Check if origin is allowed
   * 
   * @param origin - Request origin
   * @returns True if origin is allowed
   */
  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      return false;
    }

    // Allow all origins if wildcard is configured
    if (this.allowedOrigins.includes('*')) {
      return true;
    }

    // Check if origin is in allowed list
    return this.allowedOrigins.includes(origin);
  }

  /**
   * Get CORS headers for response
   * 
   * @param origin - Request origin
   * @returns CORS headers
   */
  getCorsHeaders(origin: string | undefined): Record<string, string> {
    const headers: Record<string, string> = {};

    // Set Access-Control-Allow-Origin
    if (this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
    }

    // Set Access-Control-Allow-Methods
    headers['Access-Control-Allow-Methods'] = this.allowedMethods.join(', ');

    // Set Access-Control-Allow-Headers
    headers['Access-Control-Allow-Headers'] = this.allowedHeaders.join(', ');

    // Set Access-Control-Expose-Headers
    if (this.exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = this.exposedHeaders.join(', ');
    }

    // Set Access-Control-Max-Age
    headers['Access-Control-Max-Age'] = this.maxAge.toString();

    // Set Access-Control-Allow-Credentials
    if (this.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
  }

  /**
   * Handle preflight request (OPTIONS)
   * 
   * @param origin - Request origin
   * @returns Preflight response
   */
  handlePreflight(origin: string | undefined): PreflightResponse {
    if (!this.isOriginAllowed(origin)) {
      return {
        statusCode: 403,
        headers: {},
        body: { error: 'Origin not allowed' },
      };
    }

    return {
      statusCode: 204,
      headers: this.getCorsHeaders(origin),
      body: null,
    };
  }

  /**
   * Add CORS headers to response
   * 
   * @param origin - Request origin
   * @param headers - Existing response headers
   * @returns Updated headers with CORS
   */
  addCorsHeaders(
    origin: string | undefined,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    return {
      ...headers,
      ...this.getCorsHeaders(origin),
    };
  }

  /**
   * Validate CORS request
   * 
   * @param origin - Request origin
   * @param method - HTTP method
   * @returns Validation result
   */
  validateRequest(origin: string | undefined, method: string): CorsValidationResult {
    // Check origin
    if (!this.isOriginAllowed(origin)) {
      return {
        valid: false,
        reason: 'Origin not allowed',
      };
    }

    // Check method
    if (!this.allowedMethods.includes(method.toUpperCase())) {
      return {
        valid: false,
        reason: 'Method not allowed',
      };
    }

    return {
      valid: true,
    };
  }
}

/**
 * CORS Configuration
 */
export interface CorsConfig {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}

/**
 * Preflight Response
 */
export interface PreflightResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
}

/**
 * CORS Validation Result
 */
export interface CorsValidationResult {
  valid: boolean;
  reason?: string;
}
