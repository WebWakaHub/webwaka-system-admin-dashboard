/**
 * Request Logger Service
 * 
 * Provides structured logging for API requests with full context.
 * Supports audit logging, debugging, and performance monitoring.
 */

import { ApiRequestContext } from '../types';

export class RequestLoggerService {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  /**
   * Log incoming request
   * 
   * @param context - Request context
   * @param method - HTTP method
   * @param path - Request path
   * @param query - Query parameters
   */
  logRequest(
    context: ApiRequestContext,
    method: string,
    path: string,
    query?: Record<string, string>
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = {
        level: 'INFO',
        type: 'REQUEST',
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
        tenantId: context.tenantId,
        userId: context.userId,
        method,
        path,
        query,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      };

      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log successful response
   * 
   * @param context - Request context
   * @param statusCode - HTTP status code
   * @param duration - Request duration in milliseconds
   */
  logResponse(
    context: ApiRequestContext,
    statusCode: number,
    duration: number
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = {
        level: 'INFO',
        type: 'RESPONSE',
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
        tenantId: context.tenantId,
        userId: context.userId,
        statusCode,
        duration,
      };

      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log error
   * 
   * @param context - Request context
   * @param error - Error object
   * @param statusCode - HTTP status code
   */
  logError(
    context: ApiRequestContext | undefined,
    error: Error | string,
    statusCode: number
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logEntry = {
        level: 'ERROR',
        type: 'ERROR',
        timestamp: new Date().toISOString(),
        requestId: context?.requestId || 'unknown',
        tenantId: context?.tenantId,
        userId: context?.userId,
        statusCode,
        error: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'string' ? undefined : error.stack,
      };

      console.error(JSON.stringify(logEntry));
    }
  }

  /**
   * Log authentication event
   * 
   * @param success - Whether authentication succeeded
   * @param userId - User ID (if available)
   * @param tenantId - Tenant ID (if available)
   * @param reason - Failure reason (if failed)
   */
  logAuthentication(
    success: boolean,
    userId?: string,
    tenantId?: string,
    reason?: string
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = {
        level: success ? 'INFO' : 'WARN',
        type: 'AUTHENTICATION',
        timestamp: new Date().toISOString(),
        success,
        userId,
        tenantId,
        reason,
      };

      if (success) {
        console.log(JSON.stringify(logEntry));
      } else {
        console.warn(JSON.stringify(logEntry));
      }
    }
  }

  /**
   * Log authorization event
   * 
   * @param allowed - Whether authorization succeeded
   * @param userId - User ID
   * @param tenantId - Tenant ID
   * @param resource - Resource being accessed
   * @param action - Action being performed
   * @param reason - Denial reason (if denied)
   */
  logAuthorization(
    allowed: boolean,
    userId: string,
    tenantId: string,
    resource: string,
    action: string,
    reason?: string
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = {
        level: allowed ? 'INFO' : 'WARN',
        type: 'AUTHORIZATION',
        timestamp: new Date().toISOString(),
        allowed,
        userId,
        tenantId,
        resource,
        action,
        reason,
      };

      if (allowed) {
        console.log(JSON.stringify(logEntry));
      } else {
        console.warn(JSON.stringify(logEntry));
      }
    }
  }

  /**
   * Log rate limit event
   * 
   * @param exceeded - Whether rate limit was exceeded
   * @param userId - User ID
   * @param tenantId - Tenant ID
   * @param remaining - Remaining requests
   * @param resetAt - When the limit resets
   */
  logRateLimit(
    exceeded: boolean,
    userId: string,
    tenantId: string,
    remaining: number,
    resetAt: Date
  ): void {
    if (this.shouldLog(exceeded ? LogLevel.WARN : LogLevel.DEBUG)) {
      const logEntry = {
        level: exceeded ? 'WARN' : 'DEBUG',
        type: 'RATE_LIMIT',
        timestamp: new Date().toISOString(),
        exceeded,
        userId,
        tenantId,
        remaining,
        resetAt: resetAt.toISOString(),
      };

      if (exceeded) {
        console.warn(JSON.stringify(logEntry));
      } else {
        console.debug(JSON.stringify(logEntry));
      }
    }
  }

  /**
   * Log performance metric
   * 
   * @param metric - Metric name
   * @param value - Metric value
   * @param unit - Metric unit
   * @param context - Optional request context
   */
  logMetric(
    metric: string,
    value: number,
    unit: string,
    context?: ApiRequestContext
  ): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logEntry = {
        level: 'DEBUG',
        type: 'METRIC',
        timestamp: new Date().toISOString(),
        requestId: context?.requestId,
        metric,
        value,
        unit,
      };

      console.debug(JSON.stringify(logEntry));
    }
  }

  /**
   * Log debug message
   * 
   * @param message - Debug message
   * @param data - Optional debug data
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logEntry = {
        level: 'DEBUG',
        type: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        data,
      };

      console.debug(JSON.stringify(logEntry));
    }
  }

  /**
   * Log warning message
   * 
   * @param message - Warning message
   * @param data - Optional warning data
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logEntry = {
        level: 'WARN',
        type: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        data,
      };

      console.warn(JSON.stringify(logEntry));
    }
  }

  /**
   * Check if log level should be logged
   * 
   * @param level - Log level to check
   * @returns True if should log
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  /**
   * Set log level
   * 
   * @param level - New log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

/**
 * Log Level
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
