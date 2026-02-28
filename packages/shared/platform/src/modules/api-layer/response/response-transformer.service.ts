/**
 * Response Transformer Service
 * 
 * Transforms API responses into a consistent format for all clients.
 * Provides standardized success and error response structures.
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../types';

export class ResponseTransformerService {
  /**
   * Transform successful response
   * 
   * @param data - Response data
   * @param requestId - Request ID for tracing
   * @param version - API version
   * @param pagination - Optional pagination metadata
   * @returns Standardized success response
   */
  transformSuccess<T>(
    data: T,
    requestId: string,
    version: string = 'v1',
    pagination?: PaginationMeta
  ): ApiSuccessResponse<T> {
    const response: ApiSuccessResponse<T> = {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version,
      },
    };

    if (pagination && response.meta) {
      response.meta.pagination = pagination;
    }

    return response;
  }

  /**
   * Transform error response
   * 
   * @param code - Error code
   * @param message - Error message
   * @param requestId - Request ID for tracing
   * @param details - Optional error details
   * @param statusCode - HTTP status code
   * @returns Standardized error response
   */
  transformError(
    code: string,
    message: string,
    requestId: string,
    details?: any,
    statusCode: number = 500
  ): { statusCode: number; body: ApiErrorResponse } {
    return {
      statusCode,
      body: {
        error: {
          code,
          message,
          details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
    };
  }

  /**
   * Transform validation errors
   * 
   * @param errors - Validation errors
   * @param requestId - Request ID
   * @returns 400 Bad Request response
   */
  transformValidationError(
    errors: ValidationErrorDetail[],
    requestId: string
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'VALIDATION_ERROR',
      'Request validation failed',
      requestId,
      { errors },
      400
    );
  }

  /**
   * Transform authentication error
   * 
   * @param message - Error message
   * @param requestId - Request ID
   * @returns 401 Unauthorized response
   */
  transformAuthenticationError(
    message: string,
    requestId: string
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'AUTHENTICATION_ERROR',
      message,
      requestId,
      undefined,
      401
    );
  }

  /**
   * Transform authorization error
   * 
   * @param message - Error message
   * @param requestId - Request ID
   * @returns 403 Forbidden response
   */
  transformAuthorizationError(
    message: string,
    requestId: string
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'AUTHORIZATION_ERROR',
      message,
      requestId,
      undefined,
      403
    );
  }

  /**
   * Transform rate limit error
   * 
   * @param resetAt - When the rate limit resets
   * @param requestId - Request ID
   * @returns 429 Too Many Requests response
   */
  transformRateLimitError(
    resetAt: Date,
    requestId: string
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.',
      requestId,
      { resetAt: resetAt.toISOString() },
      429
    );
  }

  /**
   * Transform not found error
   * 
   * @param resource - Resource that was not found
   * @param requestId - Request ID
   * @returns 404 Not Found response
   */
  transformNotFoundError(
    resource: string,
    requestId: string
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'NOT_FOUND',
      `${resource} not found`,
      requestId,
      undefined,
      404
    );
  }

  /**
   * Transform internal server error
   * 
   * @param message - Error message
   * @param requestId - Request ID
   * @param includeDetails - Whether to include error details (for development)
   * @returns 500 Internal Server Error response
   */
  transformInternalError(
    message: string,
    requestId: string,
    includeDetails: boolean = false
  ): { statusCode: number; body: ApiErrorResponse } {
    return this.transformError(
      'INTERNAL_SERVER_ERROR',
      includeDetails ? message : 'An unexpected error occurred',
      requestId,
      includeDetails ? { originalMessage: message } : undefined,
      500
    );
  }

  /**
   * Transform paginated response
   * 
   * @param items - Array of items
   * @param total - Total number of items
   * @param page - Current page number
   * @param pageSize - Number of items per page
   * @param requestId - Request ID
   * @returns Paginated success response
   */
  transformPaginatedResponse<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    requestId: string
  ): ApiSuccessResponse<T[]> {
    const totalPages = Math.ceil(total / pageSize);

    return this.transformSuccess(
      items,
      requestId,
      'v1',
      {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      }
    );
  }

  /**
   * Sanitize error for client response
   * Removes sensitive information from error details
   * 
   * @param error - Error object
   * @returns Sanitized error message
   */
  sanitizeError(error: any): string {
    // Remove stack traces and internal paths
    if (error.message) {
      return error.message.split('\n')[0];
    }
    return 'An error occurred';
  }
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Validation Error Detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}
