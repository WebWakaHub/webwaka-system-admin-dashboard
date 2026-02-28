/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Core Types
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #508 (P3-T01)
 */

export enum ServiceCategory {
  PAYMENT = 'payment',
  MESSAGING = 'messaging',
  IDENTITY = 'identity',
  GEOLOCATION = 'geolocation',
  STORAGE = 'storage',
  EMAIL = 'email',
  AI_INFERENCE = 'ai_inference',
}

export enum RequestPriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface ExternalRequest<T = unknown> {
  readonly serviceId: string;
  readonly operation: string;
  readonly payload: T;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly priority: RequestPriority;
  readonly timeout: number;
  readonly idempotencyKey?: string;
  readonly cachePolicy?: CachePolicy;
  readonly metadata?: Record<string, string>;
}

export interface ExternalResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ExternalError;
  readonly latencyMs: number;
  readonly cached: boolean;
  readonly queued: boolean;
  readonly vendorId: string;
  readonly correlationId: string;
  readonly timestamp: number;
}

export interface ExternalError {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;
  readonly vendorCode?: string;
  readonly vendorMessage?: string;
}

export interface CachePolicy {
  readonly enabled: boolean;
  readonly ttlSeconds: number;
  readonly staleWhileRevalidate: boolean;
}

export interface VendorConfig {
  readonly vendorId: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly category: ServiceCategory;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly rateLimitPerSecond: number;
  readonly burstSize: number;
  readonly circuitBreaker: CircuitBreakerConfig;
  readonly region: string;
}

export interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly timeoutMs: number;
  readonly halfOpenMaxCalls: number;
}

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
  readonly jitterEnabled: boolean;
}

export interface VendorHealthStatus {
  readonly vendorId: string;
  readonly status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  readonly latencyP50Ms: number;
  readonly latencyP99Ms: number;
  readonly errorRate: number;
  readonly circuitState: CircuitState;
  readonly lastChecked: number;
  readonly rateLimitRemaining: number;
}

export interface QueueEntry<T = unknown> {
  readonly id: string;
  readonly request: ExternalRequest<T>;
  readonly enqueuedAt: number;
  readonly retryCount: number;
  readonly maxRetries: number;
}

export interface ExternalAdapterConfig {
  readonly defaultTimeout: number;
  readonly maxConcurrentRequests: number;
  readonly offlineQueueMaxSize: number;
  readonly offlineQueueMaxBytes: number;
  readonly queueDrainRate: number;
  readonly cacheMaxEntries: number;
  readonly cacheDefaultTtl: number;
  readonly enableComplianceLogging: boolean;
  readonly enableTelemetry: boolean;
  readonly vendors: Record<string, VendorConfig>;
}
