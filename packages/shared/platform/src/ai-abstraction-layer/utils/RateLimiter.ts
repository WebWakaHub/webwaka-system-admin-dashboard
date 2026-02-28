/**
 * Rate Limiter Utility
 * Implements token bucket algorithm for rate limiting
 */

import { EventEmitter } from 'events';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  keyPrefix?: string;
}

export interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetTime: number;
  isLimited: boolean;
}

export default class RateLimiter extends EventEmitter {
  private config: RateLimitConfig;
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  constructor(config: RateLimitConfig) {
    super();
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const bucket = this.getBucket(key);
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / this.config.windowMs) * this.config.maxRequests;

    bucket.tokens = Math.min(this.config.maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.emit('request:allowed', { key, remaining: Math.floor(bucket.tokens) });
      return true;
    }

    this.emit('request:limited', { key, resetTime: bucket.lastRefill + this.config.windowMs });
    return false;
  }

  /**
   * Get rate limit status
   */
  getStatus(key: string): RateLimitStatus {
    const bucket = this.getBucket(key);
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / this.config.windowMs) * this.config.maxRequests;

    const remaining = Math.floor(Math.min(this.config.maxRequests, bucket.tokens + tokensToAdd));
    const resetTime = bucket.lastRefill + this.config.windowMs;

    return {
      remaining,
      limit: this.config.maxRequests,
      resetTime,
      isLimited: remaining === 0,
    };
  }

  /**
   * Get or create bucket
   */
  private getBucket(key: string): { tokens: number; lastRefill: number } {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
      });
    }
    return this.buckets.get(key)!;
  }

  /**
   * Reset bucket
   */
  reset(key: string): void {
    this.buckets.delete(key);
    this.emit('bucket:reset', { key });
  }

  /**
   * Reset all buckets
   */
  resetAll(): void {
    this.buckets.clear();
    this.emit('all:reset');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    activeBuckets: number;
    config: RateLimitConfig;
  } {
    return {
      activeBuckets: this.buckets.size,
      config: this.config,
    };
  }
}
