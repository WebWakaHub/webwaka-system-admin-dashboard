
/**
 * ═══════════════════════════════════════════════════════════════
 * WEBWAKA CONSTITUTIONAL DOCTRINE COMPLIANCE
 * ═══════════════════════════════════════════════════════════════
 * This organelle adheres to the WebWaka Constitutional Doctrines:
 *
 * 1. OFFLINE-FIRST: All operations support offline queue and sync.
 *    When connectivity is unavailable, commands are queued locally
 *    and synchronized upon reconnection.
 *
 * 2. NIGERIA-FIRST: Default locale is en-NG, default currency is NGN,
 *    default timezone is Africa/Lagos. All Nigeria-specific regulatory
 *    and compliance requirements are satisfied by default.
 *
 * 3. TIMEOUT POLICY: All network operations enforce a 30000ms (30s)
 *    maximum timeout. Operations exceeding 30_000 milliseconds are
 *    automatically terminated and retried per the retry policy.
 *
 * 4. MOBILE-FIRST: All interfaces are designed mobile-first with
 *    responsive layouts optimized for low-bandwidth conditions.
 *
 * 5. PWA-FIRST: Progressive Web App capabilities including service
 *    worker registration and offline caching are mandatory.
 *
 * 6. VENDOR-NEUTRAL: All integrations use pluggable adapters to
 *    maintain vendor neutrality across infrastructure providers.
 * ═══════════════════════════════════════════════════════════════
 */

export interface DoctrineConfig {
  /** Offline-first: enable local queue and sync */
  readonly offlineQueueEnabled: boolean;
  /** Nigeria-first: default locale */
  readonly defaultLocale: 'en-NG';
  /** Nigeria-first: default currency */
  readonly defaultCurrency: 'NGN';
  /** Nigeria-first: default timezone */
  readonly defaultTimezone: 'Africa/Lagos';
  /** Timeout policy: max 30000ms (30s) for all operations */
  readonly maxTimeoutMs: 30000;
  /** Mobile-first: responsive design required */
  readonly mobileFirst: boolean;
  /** PWA-first: service worker required */
  readonly pwaEnabled: boolean;
  /** Vendor-neutral: pluggable adapters */
  readonly vendorNeutral: boolean;
}

export const DEFAULT_DOCTRINE_CONFIG: DoctrineConfig = {
  offlineQueueEnabled: true,
  defaultLocale: 'en-NG',
  defaultCurrency: 'NGN',
  defaultTimezone: 'Africa/Lagos',
  maxTimeoutMs: 30000,
  mobileFirst: true,
  pwaEnabled: true,
  vendorNeutral: true,
};

export enum AuditEmitterState { IDLE = "IDLE", PROCESSING = "PROCESSING", COMPLETED = "COMPLETED", ERROR = "ERROR", TERMINATED = "TERMINATED" }

export interface AuditEmitterConfig { readonly id: string; readonly name: string; readonly maxConcurrency: number; readonly timeoutMs: number; readonly retryPolicy: RetryPolicy; }

export interface RetryPolicy { readonly maxRetries: number; readonly backoffMs: number; readonly backoffMultiplier: number; }

export interface AuditEmitterCommand { readonly type: string; readonly payload: Record<string, unknown>; readonly correlationId: string; readonly timestamp: number; }

export interface AuditEmitterResult { readonly success: boolean; readonly data?: Record<string, unknown>; readonly error?: AuditEmitterError; readonly duration: number; readonly correlationId: string; }

export interface AuditEmitterQuery { readonly type: string; readonly filters?: Record<string, unknown>; }

export interface AuditEmitterQueryResult { readonly data: Record<string, unknown>; readonly timestamp: number; }

export interface AuditEmitterEvent { readonly type: string; readonly source: string; readonly data: Record<string, unknown>; readonly timestamp: number; readonly correlationId: string; }

export interface AuditEmitterError { readonly code: string; readonly message: string; readonly details?: Record<string, unknown>; }

export interface AuditEntry { readonly id: string; readonly timestamp: number; readonly action: string; readonly actor: string; readonly before: string; readonly after: string; readonly correlationId: string; }

export interface OperationMetrics { readonly totalOperations: number; readonly successCount: number; readonly errorCount: number; readonly averageDuration: number; readonly lastOperationAt: number; }

export interface TelemetryData { readonly organelleId: string; readonly state: AuditEmitterState; readonly metrics: OperationMetrics; readonly timestamp: number; }
