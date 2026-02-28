/**
 * WEEG (Permission System) - Redis Cache
 * 
 * Implements the PermissionCache interface using Redis.
 * Provides caching for permission checks to achieve <50ms P99 latency.
 * 
 * @module weeg/cache/redis-cache
 */

import { createClient, RedisClientType } from 'redis';
import {
  CachedPermissions,
  PermissionCacheKey,
  WeegError,
  WeegErrorCode,
} from '../types';
import { PermissionCache } from '../permission.service';

/**
 * Redis Cache Configuration
 */
export interface RedisCacheConfig {
  /** Redis client instance */
  client: RedisClientType;
  
  /** Default TTL in seconds (default: 300 = 5 minutes) */
  defaultTtl?: number;
  
  /** Key prefix (default: 'weeg:') */
  keyPrefix?: string;
}

/**
 * Redis Cache Implementation
 * 
 * Implements caching for WEEG permission checks using Redis.
 * Provides fast permission lookups and cache invalidation strategies.
 */
export class RedisCache implements PermissionCache {
  private client: RedisClientType;
  private defaultTtl: number;
  private keyPrefix: string;

  constructor(config: RedisCacheConfig) {
    this.client = config.client;
    this.defaultTtl = config.defaultTtl || 300; // 5 minutes
    this.keyPrefix = config.keyPrefix || 'weeg:';
  }

  /**
   * Get cached permissions
   */
  async get(key: PermissionCacheKey): Promise<CachedPermissions | null> {
    try {
      const cacheKey = this.buildCacheKey(key);
      const cached = await this.client.get(cacheKey);

      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached) as CachedPermissions;

      // Check if cache is expired
      if (new Date(parsed.expiresAt) < new Date()) {
        await this.client.del(cacheKey);
        return null;
      }

      return parsed;
    } catch (error) {
      // Log error but don't throw - cache failures should not break the application
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached permissions
   */
  async set(key: PermissionCacheKey, value: CachedPermissions, ttl: number): Promise<void> {
    try {
      const cacheKey = this.buildCacheKey(key);
      const ttlSeconds = ttl || this.defaultTtl;

      // Set expiration time
      const cachedValue: CachedPermissions = {
        ...value,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      };

      await this.client.setEx(
        cacheKey,
        ttlSeconds,
        JSON.stringify(cachedValue)
      );
    } catch (error) {
      // Log error but don't throw - cache failures should not break the application
      console.error('Redis cache set error:', error);
    }
  }

  /**
   * Invalidate a specific cache entry
   */
  async invalidate(key: PermissionCacheKey): Promise<void> {
    try {
      const cacheKey = this.buildCacheKey(key);
      await this.client.del(cacheKey);
    } catch (error) {
      console.error('Redis cache invalidate error:', error);
    }
  }

  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUser(userId: string, tenantId: string): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}${tenantId}:${userId}:*`;
      await this.deleteByPattern(pattern);
    } catch (error) {
      console.error('Redis cache invalidateUser error:', error);
    }
  }

  /**
   * Invalidate all cache entries for a tenant
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}${tenantId}:*`;
      await this.deleteByPattern(pattern);
    } catch (error) {
      console.error('Redis cache invalidateTenant error:', error);
    }
  }

  /**
   * Build cache key from PermissionCacheKey
   */
  private buildCacheKey(key: PermissionCacheKey): string {
    const parts = [this.keyPrefix, key.tenantId, key.userId];

    if (key.action) {
      parts.push(key.action);
    }

    return parts.join(':');
  }

  /**
   * Delete keys matching a pattern
   */
  private async deleteByPattern(pattern: string): Promise<void> {
    try {
      // Use SCAN to find keys matching pattern
      let cursor = 0;
      const keysToDelete: string[] = [];

      do {
        const result = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        cursor = result.cursor;
        keysToDelete.push(...result.keys);
      } while (cursor !== 0);

      // Delete keys in batches
      if (keysToDelete.length > 0) {
        await this.client.del(keysToDelete);
      }
    } catch (error) {
      console.error('Redis deleteByPattern error:', error);
    }
  }

  /**
   * Clear all cache entries (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}*`;
      await this.deleteByPattern(pattern);
    } catch (error) {
      console.error('Redis clearAll error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: number;
  }> {
    try {
      const pattern = `${this.keyPrefix}*`;
      let cursor = 0;
      let totalKeys = 0;

      do {
        const result = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        cursor = result.cursor;
        totalKeys += result.keys.length;
      } while (cursor !== 0);

      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        totalKeys,
        memoryUsage,
      };
    } catch (error) {
      console.error('Redis getStats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 0,
      };
    }
  }
}

/**
 * Create Redis client
 */
export async function createRedisClient(config: {
  host?: string;
  port?: number;
  password?: string;
  database?: number;
}): Promise<RedisClientType> {
  const client = createClient({
    socket: {
      host: config.host || 'localhost',
      port: config.port || 6379,
    },
    password: config.password,
    database: config.database || 0,
  });

  await client.connect();

  return client;
}
