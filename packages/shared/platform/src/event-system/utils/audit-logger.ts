/**
 * Audit Logger
 * Logs all event system operations for compliance and debugging
 */

import { Event } from '../types';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: string;
  operation: 'publish' | 'subscribe' | 'unsubscribe' | 'replay' | 'connect' | 'disconnect';
  tenantId: string;
  userId?: string;
  eventType?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  error?: string;
}

/**
 * Audit Logger
 * Logs all Event System operations
 */
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000; // Keep last 10000 logs in memory

  /**
   * Log an operation
   */
  log(entry: AuditLogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${entry.operation.toUpperCase()} - Tenant: ${entry.tenantId} - Status: ${entry.status}`);
      if (entry.error) {
        console.error(`  Error: ${entry.error}`);
      }
    }
  }

  /**
   * Log a publish operation
   */
  logPublish(event: Event, status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'publish',
      tenantId: event.tenantId,
      userId: event.userId,
      eventType: event.eventType,
      status,
      details: { eventId: event.eventId },
      error,
    });
  }

  /**
   * Log a subscribe operation
   */
  logSubscribe(tenantId: string, eventType: string, subscriptionId: string, status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'subscribe',
      tenantId,
      eventType,
      status,
      details: { subscriptionId },
      error,
    });
  }

  /**
   * Log an unsubscribe operation
   */
  logUnsubscribe(tenantId: string, subscriptionId: string, status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'unsubscribe',
      tenantId,
      status,
      details: { subscriptionId },
      error,
    });
  }

  /**
   * Log a replay operation
   */
  logReplay(tenantId: string, eventCount: number, status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'replay',
      tenantId,
      status,
      details: { eventCount },
      error,
    });
  }

  /**
   * Log a connect operation
   */
  logConnect(status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'connect',
      tenantId: 'system',
      status,
      error,
    });
  }

  /**
   * Log a disconnect operation
   */
  logDisconnect(status: 'success' | 'failure', error?: string): void {
    this.log({
      timestamp: new Date().toISOString(),
      operation: 'disconnect',
      tenantId: 'system',
      status,
      error,
    });
  }

  /**
   * Get all audit logs
   */
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get audit logs for a specific tenant
   */
  getLogsByTenant(tenantId: string): AuditLogEntry[] {
    return this.logs.filter((log) => log.tenantId === tenantId);
  }

  /**
   * Get audit logs for a specific operation
   */
  getLogsByOperation(operation: AuditLogEntry['operation']): AuditLogEntry[] {
    return this.logs.filter((log) => log.operation === operation);
  }

  /**
   * Get audit logs for a specific time range
   */
  getLogsByTimeRange(startTime: Date, endTime: Date): AuditLogEntry[] {
    const startTimestamp = startTime.toISOString();
    const endTimestamp = endTime.toISOString();
    return this.logs.filter((log) => log.timestamp >= startTimestamp && log.timestamp <= endTimestamp);
  }

  /**
   * Get audit logs for a specific tenant and operation
   */
  getLogsByTenantAndOperation(tenantId: string, operation: AuditLogEntry['operation']): AuditLogEntry[] {
    return this.logs.filter((log) => log.tenantId === tenantId && log.operation === operation);
  }

  /**
   * Clear all audit logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Get audit log statistics
   */
  getStats(): {
    totalLogs: number;
    successCount: number;
    failureCount: number;
    operationCounts: Record<string, number>;
  } {
    return {
      totalLogs: this.logs.length,
      successCount: this.logs.filter((log) => log.status === 'success').length,
      failureCount: this.logs.filter((log) => log.status === 'failure').length,
      operationCounts: this.logs.reduce(
        (acc, log) => {
          acc[log.operation] = (acc[log.operation] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

/**
 * Global audit logger instance
 */
export const globalAuditLogger = new AuditLogger();
