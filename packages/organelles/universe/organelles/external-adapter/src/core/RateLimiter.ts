/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — RateLimiter
 * Token bucket algorithm per vendor per tenant
 */

import { IRateLimiterPort } from '../ports';

interface Bucket {
  tokens: number;
  lastRefill: number;
  ratePerSecond: number;
  burstSize: number;
}

export class RateLimiter implements IRateLimiterPort {
  private readonly buckets = new Map<string, Bucket>();

  registerVendor(vendorId: string, ratePerSecond: number, burstSize: number): void {
    const key = `${vendorId}:__default__`;
    this.buckets.set(key, {
      tokens: burstSize,
      lastRefill: Date.now(),
      ratePerSecond,
      burstSize,
    });
  }

  acquire(vendorId: string, tenantId: string): boolean {
    const bucket = this.getOrCreateBucket(vendorId, tenantId);
    this.refill(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }

  getRemaining(vendorId: string, tenantId: string): number {
    const bucket = this.getOrCreateBucket(vendorId, tenantId);
    this.refill(bucket);
    return Math.floor(bucket.tokens);
  }

  getRetryAfterMs(vendorId: string, tenantId: string): number {
    const bucket = this.getOrCreateBucket(vendorId, tenantId);
    if (bucket.tokens >= 1) return 0;
    const tokensNeeded = 1 - bucket.tokens;
    return Math.ceil((tokensNeeded / bucket.ratePerSecond) * 1000);
  }

  private refill(bucket: Bucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    const newTokens = elapsed * bucket.ratePerSecond;
    bucket.tokens = Math.min(bucket.burstSize, bucket.tokens + newTokens);
    bucket.lastRefill = now;
  }

  private getOrCreateBucket(vendorId: string, tenantId: string): Bucket {
    const key = `${vendorId}:${tenantId}`;
    let bucket = this.buckets.get(key);
    if (!bucket) {
      const defaultBucket = this.buckets.get(`${vendorId}:__default__`);
      bucket = {
        tokens: defaultBucket?.burstSize ?? 10,
        lastRefill: Date.now(),
        ratePerSecond: defaultBucket?.ratePerSecond ?? 10,
        burstSize: defaultBucket?.burstSize ?? 10,
      };
      this.buckets.set(key, bucket);
    }
    return bucket;
  }
}
