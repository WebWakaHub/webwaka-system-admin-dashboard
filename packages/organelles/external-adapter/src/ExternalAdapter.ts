/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — ExternalAdapter Facade
 * Main entry point that orchestrates all subsystems
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #509 (P3-T02)
 */

import {
  ExternalRequest,
  ExternalResponse,
  ExternalAdapterConfig,
  VendorHealthStatus,
  QueueEntry,
  RequestPriority,
} from './types';
import {
  IExternalServicePort,
  IVendorAdapter,
  IInstrumentationPort,
} from './ports';
import { CircuitBreaker } from './core/CircuitBreaker';
import { RateLimiter } from './core/RateLimiter';
import { RetryEngine } from './core/RetryEngine';
import { ComplianceFilter } from './core/ComplianceFilter';
import { ResponseCache } from './core/ResponseCache';
import { RequestRouter } from './core/RequestRouter';
import {
  CircuitOpenError,
  RateLimitExceededError,
  ComplianceViolationError,
  QueueFullError,
  VendorTimeoutError,
} from './errors';

export class ExternalAdapter implements IExternalServicePort {
  private readonly circuitBreaker: CircuitBreaker;
  private readonly rateLimiter: RateLimiter;
  private readonly retryEngine: RetryEngine;
  private readonly complianceFilter: ComplianceFilter;
  private readonly responseCache: ResponseCache;
  private readonly requestRouter: RequestRouter;
  private readonly offlineQueue: QueueEntry[] = [];
  private readonly config: ExternalAdapterConfig;
  private readonly instrumentation?: IInstrumentationPort;
  private isOnline = true;
  private activeConcurrentRequests = 0;

  constructor(config: ExternalAdapterConfig, instrumentation?: IInstrumentationPort) {
    this.config = config;
    this.instrumentation = instrumentation;
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = new RateLimiter();
    this.retryEngine = new RetryEngine();
    this.complianceFilter = new ComplianceFilter();
    this.responseCache = new ResponseCache(config.cacheMaxEntries);
    this.requestRouter = new RequestRouter();

    // Initialize vendor configs
    for (const [vendorId, vendorConfig] of Object.entries(config.vendors)) {
      this.circuitBreaker.registerVendor(vendorId, vendorConfig.circuitBreaker);
      this.rateLimiter.registerVendor(vendorId, vendorConfig.rateLimitPerSecond, vendorConfig.burstSize);
    }
  }

  registerVendorAdapter(adapter: IVendorAdapter): void {
    this.requestRouter.registerVendor(adapter);
  }

  registerServiceMapping(serviceId: string, vendorId: string): void {
    this.requestRouter.registerServiceMapping(serviceId, vendorId);
  }

  async execute<T, R>(request: ExternalRequest<T>): Promise<ExternalResponse<R>> {
    const startTime = Date.now();
    const spanEnd = this.instrumentation?.startSpan('external_adapter.execute', request.correlationId);

    try {
      // Step 1: Compliance validation
      const validation = this.complianceFilter.validateRequest(request);
      if (!validation.valid) {
        throw new ComplianceViolationError(validation.violations);
      }

      this.complianceFilter.createAuditEntry('request_received', {
        serviceId: request.serviceId,
        operation: request.operation,
        tenantId: request.tenantId,
        correlationId: request.correlationId,
      });

      // Step 2: Check cache
      if (request.cachePolicy?.enabled) {
        const cacheKey = this.buildCacheKey(request);
        const cached = await this.responseCache.get<R>(cacheKey);
        if (cached !== null) {
          this.instrumentation?.recordMetric('cache_hit', 1, { serviceId: request.serviceId });
          return {
            success: true,
            data: cached,
            latencyMs: Date.now() - startTime,
            cached: true,
            queued: false,
            vendorId: this.requestRouter.getVendorForService(request.serviceId) ?? 'unknown',
            correlationId: request.correlationId,
            timestamp: Date.now(),
          };
        }
      }

      // Step 3: Resolve vendor adapter
      const vendorAdapter = this.requestRouter.resolve(request.serviceId, request.operation);
      const vendorId = vendorAdapter.vendorId;

      // Step 4: Circuit breaker check
      if (!this.circuitBreaker.check(vendorId)) {
        if (!this.isOnline) {
          return this.enqueueRequest(request, vendorId, startTime);
        }
        throw new CircuitOpenError(vendorId);
      }

      // Step 5: Rate limiter check
      if (!this.rateLimiter.acquire(vendorId, request.tenantId)) {
        const retryAfter = this.rateLimiter.getRetryAfterMs(vendorId, request.tenantId);
        if (request.priority === RequestPriority.LOW) {
          return this.enqueueRequest(request, vendorId, startTime);
        }
        throw new RateLimitExceededError(vendorId, retryAfter);
      }

      // Step 6: Concurrency check
      if (this.activeConcurrentRequests >= this.config.maxConcurrentRequests) {
        return this.enqueueRequest(request, vendorId, startTime);
      }

      // Step 7: Execute with retry
      this.activeConcurrentRequests++;
      try {
        const result = await this.retryEngine.executeWithRetry<R>(
          async () => {
            const timeout = request.timeout || this.config.defaultTimeout;
            return await this.executeWithTimeout(vendorAdapter, request.operation, request.payload, timeout);
          },
          { maxRetries: this.config.vendors[vendorId]?.maxRetries ?? 3 },
        );

        this.circuitBreaker.recordSuccess(vendorId);
        this.instrumentation?.recordMetric('request_success', 1, { vendorId, serviceId: request.serviceId });

        // Cache the result
        if (request.cachePolicy?.enabled) {
          const cacheKey = this.buildCacheKey(request);
          await this.responseCache.set(cacheKey, result, request.cachePolicy.ttlSeconds);
        }

        return {
          success: true,
          data: result,
          latencyMs: Date.now() - startTime,
          cached: false,
          queued: false,
          vendorId,
          correlationId: request.correlationId,
          timestamp: Date.now(),
        };
      } finally {
        this.activeConcurrentRequests--;
      }
    } catch (error) {
      const vendorId = this.requestRouter.getVendorForService(request.serviceId) ?? 'unknown';
      if (vendorId !== 'unknown') {
        this.circuitBreaker.recordFailure(vendorId);
      }
      this.instrumentation?.recordMetric('request_failure', 1, { vendorId, serviceId: request.serviceId });

      return {
        success: false,
        error: {
          code: (error as any).code ?? 'UNKNOWN',
          message: (error as Error).message,
          retryable: (error as any).retryable ?? false,
          retryAfterMs: (error as any).retryAfterMs,
        },
        latencyMs: Date.now() - startTime,
        cached: false,
        queued: false,
        vendorId,
        correlationId: request.correlationId,
        timestamp: Date.now(),
      };
    } finally {
      spanEnd?.end();
    }
  }

  async getVendorHealth(vendorId: string): Promise<VendorHealthStatus> {
    return {
      vendorId,
      status: this.circuitBreaker.getState(vendorId) === 'closed' ? 'healthy' : 'degraded',
      latencyP50Ms: 0,
      latencyP99Ms: 0,
      errorRate: 0,
      circuitState: this.circuitBreaker.getState(vendorId) as any,
      lastChecked: Date.now(),
      rateLimitRemaining: this.rateLimiter.getRemaining(vendorId, '__global__'),
    };
  }

  async invalidateCache(serviceId: string, operation: string): Promise<void> {
    await this.responseCache.invalidateByPrefix(`${serviceId}:${operation}`);
  }

  async getQueueSize(): Promise<number> {
    return this.offlineQueue.length;
  }

  async drainQueue(): Promise<{ drained: number; failed: number }> {
    let drained = 0;
    let failed = 0;
    const batch = this.offlineQueue.splice(0, this.config.queueDrainRate);

    for (const entry of batch) {
      try {
        await this.execute(entry.request);
        drained++;
      } catch {
        if (entry.retryCount < entry.maxRetries) {
          this.offlineQueue.push({ ...entry, retryCount: entry.retryCount + 1 });
        }
        failed++;
      }
    }

    return { drained, failed };
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    if (online) {
      this.drainQueue().catch(() => {});
    }
  }

  private enqueueRequest<T>(request: ExternalRequest<T>, vendorId: string, startTime: number): ExternalResponse<never> {
    if (this.offlineQueue.length >= this.config.offlineQueueMaxSize) {
      throw new QueueFullError(this.offlineQueue.length, this.config.offlineQueueMaxSize);
    }

    const entry: QueueEntry<T> = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      request,
      enqueuedAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
    };
    this.offlineQueue.push(entry as QueueEntry);

    return {
      success: false,
      latencyMs: Date.now() - startTime,
      cached: false,
      queued: true,
      vendorId,
      correlationId: request.correlationId,
      timestamp: Date.now(),
    };
  }

  private async executeWithTimeout<T, R>(
    adapter: IVendorAdapter,
    operation: string,
    payload: T,
    timeoutMs: number,
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new VendorTimeoutError(adapter.vendorId, timeoutMs));
      }, timeoutMs);

      adapter.execute<T, R>(operation, payload, timeoutMs)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private buildCacheKey<T>(request: ExternalRequest<T>): string {
    return `${request.serviceId}:${request.operation}:${JSON.stringify(request.payload)}`;
  }
}
