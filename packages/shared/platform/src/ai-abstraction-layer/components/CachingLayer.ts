/**
 * Caching Layer
 * Provides caching for AI responses to reduce API calls and improve performance
 */

import { EventEmitter } from 'events';

export interface CacheEntry {
  key: string;
  value: any;
  expiresAt: Date;
  hits: number;
  createdAt: Date;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // in seconds
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
}

export class CachingLayer extends EventEmitter {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private accessTimes: Map<string, Date> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 3600, // 1 hour
      evictionPolicy: config.evictionPolicy || 'LRU',
    };
    this.emit('cache:initialized', this.config);
  }

  /**
   * Set cache entry
   */
  public set(key: string, value: any, ttl?: number): void {
    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const expiresAt = new Date(Date.now() + (ttl || this.config.defaultTTL) * 1000);

    this.cache.set(key, {
      key,
      value,
      expiresAt,
      hits: 0,
      createdAt: new Date(),
    });

    this.accessTimes.set(key, new Date());

    this.emit('cache:set', { key, ttl: ttl || this.config.defaultTTL });
  }

  /**
   * Get cache entry
   */
  public get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.emit('cache:miss', { key });
      return null;
    }

    // Check if entry has expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.emit('cache:expired', { key });
      return null;
    }

    // Update hit count and access time
    entry.hits++;
    this.accessTimes.set(key, new Date());

    this.emit('cache:hit', { key, hits: entry.hits });

    return entry.value;
  }

  /**
   * Delete cache entry
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessTimes.delete(key);

    if (deleted) {
      this.emit('cache:deleted', { key });
    }

    return deleted;
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.emit('cache:cleared', { timestamp: new Date() });
  }

  /**
   * Check if key exists
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Evict entries based on policy
   */
  private evict(): void {
    let keyToEvict: string | null = null;

    if (this.config.evictionPolicy === 'LRU') {
      // Least Recently Used
      let oldestTime = new Date();
      this.accessTimes.forEach((time, key) => {
        if (time < oldestTime) {
          oldestTime = time;
          keyToEvict = key;
        }
      });
    } else if (this.config.evictionPolicy === 'LFU') {
      // Least Frequently Used
      let minHits = Infinity;
      this.cache.forEach((entry, key) => {
        if (entry.hits < minHits) {
          minHits = entry.hits;
          keyToEvict = key;
        }
      });
    } else if (this.config.evictionPolicy === 'FIFO') {
      // First In First Out
      let oldestCreation = new Date();
      this.cache.forEach((entry, key) => {
        if (entry.createdAt < oldestCreation) {
          oldestCreation = entry.createdAt;
          keyToEvict = key;
        }
      });
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.emit('cache:evicted', { key: keyToEvict, policy: this.config.evictionPolicy });
    }
  }

  /**
   * Get cache statistics
   */
  public getStatistics(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    let totalHits = 0;
    let totalMisses = 0;

    this.cache.forEach((entry) => {
      totalHits += entry.hits;
    });

    // Calculate hit rate (approximate)
    const hitRate = totalHits > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits,
      totalMisses,
    };
  }

  /**
   * Get cache entries
   */
  public getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get cache size in bytes (approximate)
   */
  public getSizeInBytes(): number {
    let size = 0;
    this.cache.forEach((entry) => {
      size += JSON.stringify(entry.value).length;
    });
    return size;
  }

  /**
   * Warm cache with entries
   */
  public warmCache(entries: Array<{ key: string; value: any; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
    this.emit('cache:warmed', { count: entries.length });
  }
}

export default CachingLayer;
