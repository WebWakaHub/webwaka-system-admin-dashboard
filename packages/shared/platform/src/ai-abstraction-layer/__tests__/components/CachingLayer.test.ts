/**
 * Unit Tests for CachingLayer
 * Tests for caching, eviction policies, and cache management
 */

import CachingLayer from '../../components/CachingLayer';

describe('CachingLayer', () => {
  let cache: CachingLayer;

  beforeEach(() => {
    cache = new CachingLayer({ maxSize: 10, defaultTTL: 3600 });
  });

  describe('set', () => {
    it('should set a cache entry', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should emit cache:set event', (done) => {
      cache.on('cache:set', (data) => {
        expect(data.key).toBe('key1');
        done();
      });

      cache.set('key1', 'value1');
    });

    it('should support custom TTL', () => {
      cache.set('key1', 'value1', 60);

      expect(cache.get('key1')).toBe('value1');
    });

    it('should overwrite existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('get', () => {
    it('should retrieve a cached value', () => {
      cache.set('key1', 'value1');

      const value = cache.get('key1');

      expect(value).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      const value = cache.get('non-existent');

      expect(value).toBeNull();
    });

    it('should emit cache:hit event on successful retrieval', (done) => {
      cache.set('key1', 'value1');

      cache.on('cache:hit', (data) => {
        expect(data.key).toBe('key1');
        done();
      });

      cache.get('key1');
    });

    it('should emit cache:miss event on failed retrieval', (done) => {
      cache.on('cache:miss', (data) => {
        expect(data.key).toBe('non-existent');
        done();
      });

      cache.get('non-existent');
    });

    it('should increment hit count', () => {
      cache.set('key1', 'value1');

      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      const entries = cache.getEntries();
      const entry = entries.find((e) => e.key === 'key1');

      expect(entry?.hits).toBe(3);
    });

    it('should remove expired entries', (done) => {
      cache.set('key1', 'value1', 1); // 1 second TTL

      setTimeout(() => {
        const value = cache.get('key1');
        expect(value).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('delete', () => {
    it('should delete a cache entry', () => {
      cache.set('key1', 'value1');

      const deleted = cache.delete('key1');

      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
    });

    it('should return false for non-existent key', () => {
      const deleted = cache.delete('non-existent');

      expect(deleted).toBe(false);
    });

    it('should emit cache:deleted event', (done) => {
      cache.set('key1', 'value1');

      cache.on('cache:deleted', (data) => {
        expect(data.key).toBe('key1');
        done();
      });

      cache.delete('key1');
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });

    it('should emit cache:cleared event', (done) => {
      cache.on('cache:cleared', () => {
        done();
      });

      cache.clear();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired key', (done) => {
      cache.set('key1', 'value1', 1); // 1 second TTL

      setTimeout(() => {
        expect(cache.has('key1')).toBe(false);
        done();
      }, 1100);
    });
  });

  describe('eviction', () => {
    it('should evict LRU entry when cache is full', () => {
      const lruCache = new CachingLayer({ maxSize: 3, defaultTTL: 3600, evictionPolicy: 'LRU' });

      lruCache.set('key1', 'value1');
      lruCache.set('key2', 'value2');
      lruCache.set('key3', 'value3');

      // Access key1 and key2 to make key3 least recently used
      lruCache.get('key1');
      lruCache.get('key2');

      // Add new entry, should evict key3
      lruCache.set('key4', 'value4');

      expect(lruCache.has('key3')).toBe(false);
      expect(lruCache.has('key4')).toBe(true);
    });

    it('should evict LFU entry when cache is full', () => {
      const lfuCache = new CachingLayer({ maxSize: 3, defaultTTL: 3600, evictionPolicy: 'LFU' });

      lfuCache.set('key1', 'value1');
      lfuCache.set('key2', 'value2');
      lfuCache.set('key3', 'value3');

      // Access key1 and key2 multiple times
      lfuCache.get('key1');
      lfuCache.get('key1');
      lfuCache.get('key2');

      // Add new entry, should evict key3 (least frequently used)
      lfuCache.set('key4', 'value4');

      expect(lfuCache.has('key3')).toBe(false);
      expect(lfuCache.has('key4')).toBe(true);
    });

    it('should emit cache:evicted event', (done) => {
      const smallCache = new CachingLayer({ maxSize: 2, defaultTTL: 3600 });

      smallCache.on('cache:evicted', (data) => {
        expect(data.key).toBeDefined();
        done();
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should trigger eviction
    });
  });

  describe('getStatistics', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');

      const stats = cache.getStatistics();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats.totalHits).toBe(1);
    });

    it('should calculate hit rate', () => {
      cache.set('key1', 'value1');

      cache.get('key1');
      cache.get('key1');
      cache.get('non-existent');

      const stats = cache.getStatistics();

      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('getEntries', () => {
    it('should return all cache entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const entries = cache.getEntries();

      expect(entries).toHaveLength(2);
      expect(entries.some((e) => e.key === 'key1')).toBe(true);
      expect(entries.some((e) => e.key === 'key2')).toBe(true);
    });

    it('should return empty array when cache is empty', () => {
      const entries = cache.getEntries();

      expect(entries).toHaveLength(0);
    });
  });

  describe('getSizeInBytes', () => {
    it('should calculate cache size in bytes', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const size = cache.getSizeInBytes();

      expect(size).toBeGreaterThan(0);
    });

    it('should return 0 for empty cache', () => {
      const size = cache.getSizeInBytes();

      expect(size).toBe(0);
    });
  });

  describe('warmCache', () => {
    it('should warm cache with entries', () => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];

      cache.warmCache(entries);

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
    });

    it('should emit cache:warmed event', (done) => {
      const entries = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ];

      cache.on('cache:warmed', (data) => {
        expect(data.count).toBe(2);
        done();
      });

      cache.warmCache(entries);
    });

    it('should support custom TTL for warmed entries', () => {
      const entries = [{ key: 'key1', value: 'value1', ttl: 60 }];

      cache.warmCache(entries);

      expect(cache.get('key1')).toBe('value1');
    });
  });
});
