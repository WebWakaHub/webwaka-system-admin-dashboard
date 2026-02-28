/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — RetryEngine
 * Exponential backoff with jitter
 */

import { RetryPolicy } from '../types';
import { ExternalAdapterError } from '../errors';

export class RetryEngine {
  private readonly defaultPolicy: RetryPolicy = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2.0,
    jitterEnabled: true,
  };

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    policy?: Partial<RetryPolicy>,
  ): Promise<T> {
    const p = { ...this.defaultPolicy, ...policy };
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= p.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ExternalAdapterError && !error.retryable) {
          throw error;
        }

        if (attempt < p.maxRetries) {
          const delay = this.calculateDelay(attempt, p);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  calculateDelay(attempt: number, policy?: Partial<RetryPolicy>): number {
    const p = { ...this.defaultPolicy, ...policy };
    let delay = p.baseDelayMs * Math.pow(p.backoffMultiplier, attempt);
    delay = Math.min(delay, p.maxDelayMs);

    if (p.jitterEnabled) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
