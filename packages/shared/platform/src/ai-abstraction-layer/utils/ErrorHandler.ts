/**
 * Error Handler Utility
 * Handles and categorizes errors from AI providers
 */

import { EventEmitter } from 'events';

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface AIError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  provider?: string;
  model?: string;
  timestamp: Date;
  retryable: boolean;
}

export default class ErrorHandler extends EventEmitter {
  private errorLog: AIError[] = [];
  private maxLogSize: number = 1000;

  /**
   * Handle error from AI provider
   */
  handleError(error: any, provider?: string, model?: string): AIError {
    const aiError = this.categorizeError(error, provider, model);
    this.logError(aiError);
    this.emit('error:handled', aiError);
    return aiError;
  }

  /**
   * Categorize error based on status code and message
   */
  private categorizeError(error: any, provider?: string, model?: string): AIError {
    let type = ErrorType.UNKNOWN;
    let statusCode = error.statusCode || error.status;
    let retryable = false;

    if (error.message?.includes('401') || statusCode === 401) {
      type = ErrorType.AUTHENTICATION;
      retryable = false;
    } else if (error.message?.includes('429') || statusCode === 429) {
      type = ErrorType.RATE_LIMIT;
      retryable = true;
    } else if (error.message?.includes('400') || statusCode === 400) {
      type = ErrorType.INVALID_REQUEST;
      retryable = false;
    } else if (error.message?.includes('404') || statusCode === 404) {
      type = ErrorType.NOT_FOUND;
      retryable = false;
    } else if (error.message?.includes('500') || statusCode >= 500) {
      type = ErrorType.SERVER_ERROR;
      retryable = true;
    } else if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
      type = ErrorType.TIMEOUT;
      retryable = true;
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      type = ErrorType.NETWORK_ERROR;
      retryable = true;
    }

    return {
      type,
      message: error.message || 'Unknown error',
      statusCode,
      provider,
      model,
      timestamp: new Date(),
      retryable,
    };
  }

  /**
   * Log error
   */
  private logError(error: AIError): void {
    this.errorLog.push(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Get error log
   */
  getErrorLog(limit?: number): AIError[] {
    if (limit) {
      return this.errorLog.slice(-limit);
    }
    return [...this.errorLog];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AIError[] {
    return this.errorLog.filter((e) => e.type === type);
  }

  /**
   * Get errors by provider
   */
  getErrorsByProvider(provider: string): AIError[] {
    return this.errorLog.filter((e) => e.provider === provider);
  }

  /**
   * Get retryable errors
   */
  getRetryableErrors(): AIError[] {
    return this.errorLog.filter((e) => e.retryable);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.emit('log:cleared');
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByProvider: Record<string, number>;
    retryableErrors: number;
  } {
    const errorsByType: Record<string, number> = {};
    const errorsByProvider: Record<string, number> = {};
    let retryableErrors = 0;

    this.errorLog.forEach((error) => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      if (error.provider) {
        errorsByProvider[error.provider] = (errorsByProvider[error.provider] || 0) + 1;
      }
      if (error.retryable) {
        retryableErrors++;
      }
    });

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsByProvider,
      retryableErrors,
    };
  }

  /**
   * Should retry request
   */
  shouldRetry(error: AIError, attemptCount: number = 0, maxAttempts: number = 3): boolean {
    if (!error.retryable) {
      return false;
    }

    if (attemptCount >= maxAttempts) {
      return false;
    }

    return true;
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attemptCount);
    const jitter = Math.random() * exponentialDelay * 0.1;
    return exponentialDelay + jitter;
  }
}
