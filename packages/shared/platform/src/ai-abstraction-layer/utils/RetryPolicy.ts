/**
 * Retry Policy Utility
 * Implements retry logic with exponential backoff
 */

import { EventEmitter } from 'events';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitterFactor: number; // 0-1
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export default class RetryPolicy extends EventEmitter {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    super();
    this.config = {
      maxAttempts: config.maxAttempts || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      backoffMultiplier: config.backoffMultiplier || 2,
      jitterFactor: config.jitterFactor || 0.1,
    };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        this.emit('attempt:start', { attempt: attempt + 1 });
        const data = await fn();
        const totalTime = Date.now() - startTime;

        this.emit('attempt:success', { attempt: attempt + 1, totalTime });

        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalTime,
        };
      } catch (error) {
        lastError = error as Error;
        this.emit('attempt:failed', {
          attempt: attempt + 1,
          error: lastError.message,
        });

        if (attempt < this.config.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      success: false,
      error: lastError,
      attempts: this.config.maxAttempts,
      totalTime,
    };
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attemptCount: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attemptCount);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelay);
    const jitter = cappedDelay * this.config.jitterFactor * Math.random();

    return cappedDelay + jitter;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config:updated', this.config);
  }

  /**
   * Calculate total time for max attempts
   */
  calculateMaxTime(): number {
    let totalTime = 0;

    for (let attempt = 0; attempt < this.config.maxAttempts - 1; attempt++) {
      totalTime += this.calculateDelay(attempt);
    }

    return totalTime;
  }
}
