/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — ResponseCache
 * LRU cache with TTL and stale-while-revalidate support
 */

import { IResponseCachePort } from '../ports';

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export class ResponseCache implements IResponseCachePort {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries: number = 500) {
    this.maxEntries = maxEntries;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0 || ttlSeconds > 3600) {
      throw new Error('TTL must be between 1 and 3600 seconds');
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    });
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}
