/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Port Interfaces
 * Agent: webwakaagent4 (Engineering & Delivery)
 */

import {
  ExternalRequest,
  ExternalResponse,
  VendorConfig,
  VendorHealthStatus,
  QueueEntry,
} from './types';

/** Primary port — consumed by Cell layer */
export interface IExternalServicePort {
  execute<T, R>(request: ExternalRequest<T>): Promise<ExternalResponse<R>>;
  getVendorHealth(vendorId: string): Promise<VendorHealthStatus>;
  invalidateCache(serviceId: string, operation: string): Promise<void>;
  getQueueSize(): Promise<number>;
  drainQueue(): Promise<{ drained: number; failed: number }>;
}

/** Vendor adapter port — implemented per vendor */
export interface IVendorAdapter {
  readonly vendorId: string;
  readonly category: string;
  initialize(config: VendorConfig): Promise<void>;
  execute<T, R>(operation: string, payload: T, timeout: number): Promise<R>;
  healthCheck(): Promise<VendorHealthStatus>;
  shutdown(): Promise<void>;
}

/** Circuit breaker port */
export interface ICircuitBreakerPort {
  check(vendorId: string): boolean;
  recordSuccess(vendorId: string): void;
  recordFailure(vendorId: string): void;
  getState(vendorId: string): string;
  reset(vendorId: string): void;
}

/** Rate limiter port */
export interface IRateLimiterPort {
  acquire(vendorId: string, tenantId: string): boolean;
  getRemaining(vendorId: string, tenantId: string): number;
  getRetryAfterMs(vendorId: string, tenantId: string): number;
}

/** Response cache port */
export interface IResponseCachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateByPrefix(prefix: string): Promise<void>;
  size(): number;
}

/** Offline queue port */
export interface IOfflineQueuePort {
  enqueue<T>(entry: QueueEntry<T>): Promise<void>;
  peek(count: number): Promise<QueueEntry[]>;
  dequeue(id: string): Promise<void>;
  size(): Promise<number>;
  sizeBytes(): Promise<number>;
  clear(): Promise<void>;
}

/** Compliance filter port */
export interface IComplianceFilterPort {
  validateRequest<T>(request: ExternalRequest<T>): { valid: boolean; violations: string[] };
  maskSensitiveData(data: Record<string, unknown>): Record<string, unknown>;
  createAuditEntry(action: string, details: Record<string, unknown>): void;
}

/** Request router port */
export interface IRequestRouterPort {
  resolve(serviceId: string, operation: string): IVendorAdapter;
  registerVendor(adapter: IVendorAdapter): void;
  removeVendor(vendorId: string): void;
  listVendors(): string[];
}

/** Instrumentation port (consumed from InstrumentationProbe organelle) */
export interface IInstrumentationPort {
  recordMetric(name: string, value: number, tags: Record<string, string>): void;
  startSpan(name: string, parentId?: string): { spanId: string; end: () => void };
  recordEvent(name: string, payload: Record<string, unknown>): void;
}
