/**
 * Log Processor
 * Processes, enriches, and standardizes raw audit events before storage
 */

import { AuditEvent, AuditLog } from '../types/AuditLog';
import { InvalidAuditEventError } from '../errors/AuditSystemError';
import * as crypto from 'crypto';

/**
 * LogProcessor class
 * Responsible for enriching and transforming raw audit events into standardized audit logs
 */
export class LogProcessor {
  /**
   * Process a raw audit event and transform it into an audit log
   * @param event - The raw audit event from the Event Bus
   * @returns The processed and standardized audit log
   */
  public processEvent(event: AuditEvent): AuditLog {
    // Validate the event
    this.validateEvent(event);

    // Generate a unique log ID
    const logId = this.generateLogId();

    // Parse the timestamp
    const timestamp = new Date(event.timestamp);

    // Create the audit log
    const auditLog: AuditLog = {
      logId,
      timestamp,
      tenantId: event.tenantId,
      actor: event.actor,
      action: event.action,
      details: event.details,
      traceId: event.traceId,
    };

    return auditLog;
  }

  /**
   * Validate an audit event
   * @param event - The event to validate
   * @throws InvalidAuditEventError if the event is invalid
   */
  private validateEvent(event: AuditEvent): void {
    // Check required fields
    if (!event.eventType) {
      throw new InvalidAuditEventError('Event type is required');
    }

    if (!event.eventId) {
      throw new InvalidAuditEventError('Event ID is required');
    }

    if (!event.timestamp) {
      throw new InvalidAuditEventError('Timestamp is required');
    }

    if (!event.tenantId) {
      throw new InvalidAuditEventError('Tenant ID is required');
    }

    if (!event.actor || !event.actor.userId) {
      throw new InvalidAuditEventError('Actor with user ID is required');
    }

    if (!event.action || !event.action.type || !event.action.entityType || !event.action.entityId) {
      throw new InvalidAuditEventError('Action with type, entityType, and entityId is required');
    }

    // Validate timestamp format
    const parsedDate = new Date(event.timestamp);
    if (isNaN(parsedDate.getTime())) {
      throw new InvalidAuditEventError('Invalid timestamp format');
    }
  }

  /**
   * Generate a unique log ID
   * @returns A unique log ID
   */
  private generateLogId(): string {
    return crypto.randomUUID();
  }

  /**
   * Calculate a cryptographic hash of an audit log for integrity verification
   * @param auditLog - The audit log to hash
   * @returns The SHA-256 hash of the audit log
   */
  public calculateHash(auditLog: AuditLog): string {
    const logString = JSON.stringify(auditLog);
    return crypto.createHash('sha256').update(logString).digest('hex');
  }
}
