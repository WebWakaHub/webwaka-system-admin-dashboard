/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Execution Context Types
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

/**
 * Execution context passed to every database operation.
 * Provides tenant isolation and audit trail.
 */
export interface ExecutionContext {
  /** Tenant identifier — MANDATORY */
  tenantId: string;

  /** Correlation ID for distributed tracing */
  correlationId: string;

  /** Acting user or agent ID */
  actorId: string;

  /** Actor type */
  actorType: 'user' | 'agent' | 'system';

  /** Request timestamp (ISO 8601) */
  timestamp: string;
}

/**
 * Database health status.
 */
export interface DatabaseHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  engine: string;
  latency_ms: number;
  activeConnections: number;
  idleConnections: number;
  pendingSyncChanges?: number;
  lastCheckedAt: string;
  details?: Record<string, unknown>;
}

/**
 * Connection pool statistics.
 */
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  acquireLatency_ms: number;
}
