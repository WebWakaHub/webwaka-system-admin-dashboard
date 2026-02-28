/**
 * Rate Limiter Service
 * 
 * Implements rate limiting using Redis for distributed rate limiting.
 * Supports per-tenant and per-user rate limits with configurable windows.
 */

import { RateLimitRule, RateLimitCheckResult } from '../types';
import { createClient, RedisClientType } from 'redis';

export class RateLimiterService {
  private redisClient: RedisClientType | null = null;
  private defaultRule: RateLimitRule;
  private enabled: boolean;

  constructor(
    redisUrl?: string,
    defaultMaxRequests: number = 100,
    defaultWindowSeconds: number = 60,
    enabled: boolean = true
  ) {
    this.enabled = enabled;
    this.defaultRule = {
      id: 'default',
      maxRequests: defaultMaxRequests,
      windowSeconds: defaultWindowSeconds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (enabled) {
      this.initializeRedis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(redisUrl: string): Promise<void> {
    try {
      this.redisClient = createClient({ url: redisUrl });
      
      this.redisClient.on('error', (err) => {
        console.error('[RateLimiter] Redis error:', err);
      });

      await this.redisClient.connect();
      console.log('[RateLimiter] Connected to Redis');
    } catch (error) {
      console.error('[RateLimiter] Failed to connect to Redis:', error);
      // Continue without Redis (rate limiting will be disabled)
      this.enabled = false;
    }
  }

  /**
   * Check if a request is within rate limits
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID (optional, for user-specific limits)
   * @param rule - Custom rate limit rule (optional)
   * @returns Rate limit check result
   */
  async checkRateLimit(
    tenantId: string,
    userId?: string,
    rule?: RateLimitRule
  ): Promise<RateLimitCheckResult> {
    // If rate limiting is disabled, allow all requests
    if (!this.enabled || !this.redisClient) {
      return {
        allowed: true,
        remaining: Infinity,
        resetAt: new Date(Date.now() + 60000),
      };
    }

    // Use provided rule or default rule
    const activeRule = rule || this.defaultRule;

    // Create rate limit key
    const key = this.getRateLimitKey(tenantId, userId);

    try {
      // Get current count
      const currentCount = await this.redisClient.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if limit exceeded
      if (count >= activeRule.maxRequests) {
        const ttl = await this.redisClient.ttl(key);
        const resetAt = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : activeRule.windowSeconds * 1000));

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Increment counter
      const newCount = await this.incrementCounter(key, activeRule.windowSeconds);

      // Calculate remaining requests
      const remaining = Math.max(0, activeRule.maxRequests - newCount);
      const resetAt = new Date(Date.now() + activeRule.windowSeconds * 1000);

      return {
        allowed: true,
        remaining,
        resetAt,
      };
    } catch (error) {
      console.error('[RateLimiter] Error checking rate limit:', error);
      // On error, allow the request (fail-open for availability)
      return {
        allowed: true,
        remaining: activeRule.maxRequests,
        resetAt: new Date(Date.now() + activeRule.windowSeconds * 1000),
      };
    }
  }

  /**
   * Increment the rate limit counter
   * 
   * @param key - Redis key
   * @param windowSeconds - Time window in seconds
   * @returns New count value
   */
  private async incrementCounter(key: string, windowSeconds: number): Promise<number> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    // Use Redis INCR and EXPIRE commands atomically
    const multi = this.redisClient.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    const results = await multi.exec();

    // Return the new count (first result from INCR command)
    return results ? (results[0] as number) : 1;
  }

  /**
   * Generate rate limit key for Redis
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID (optional)
   * @returns Redis key
   */
  private getRateLimitKey(tenantId: string, userId?: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    if (userId) {
      return `ratelimit:user:${tenantId}:${userId}:${timestamp}`;
    }
    return `ratelimit:tenant:${tenantId}:${timestamp}`;
  }

  /**
   * Reset rate limit for a tenant or user
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID (optional)
   */
  async resetRateLimit(tenantId: string, userId?: string): Promise<void> {
    if (!this.enabled || !this.redisClient) {
      return;
    }

    const key = this.getRateLimitKey(tenantId, userId);
    await this.redisClient.del(key);
  }

  /**
   * Get current rate limit status
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID (optional)
   * @returns Current count and remaining requests
   */
  async getRateLimitStatus(
    tenantId: string,
    userId?: string
  ): Promise<{ count: number; remaining: number }> {
    if (!this.enabled || !this.redisClient) {
      return { count: 0, remaining: this.defaultRule.maxRequests };
    }

    const key = this.getRateLimitKey(tenantId, userId);
    const currentCount = await this.redisClient.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;
    const remaining = Math.max(0, this.defaultRule.maxRequests - count);

    return { count, remaining };
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      console.log('[RateLimiter] Disconnected from Redis');
    }
  }
}
