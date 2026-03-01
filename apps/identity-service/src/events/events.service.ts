import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IdentityEvent } from '../common/enums/identity-event.enum';
import { OfflineQueueService } from '../offline/offline-queue.service';

/**
 * Identity Event Payload
 *
 * Standard structure for all identity domain events.
 * Includes metadata for traceability and offline sync.
 */
export interface IdentityEventPayload {
  eventType: IdentityEvent;
  timestamp: string;
  data: Record<string, any>;
  metadata: {
    source: 'identity-service';
    version: '1.0.0';
    correlationId: string;
    tenantId?: string | null;
    actorId?: string | null;
  };
}

/**
 * Events Service
 *
 * Handles event emission for all identity state changes.
 * This is a constitutional requirement per the Event-Driven Architecture spec:
 * "All cross-component communication uses events."
 *
 * Offline-First: If event emission fails (e.g., event bus unavailable),
 * the event is queued in the offline queue for later retry.
 *
 * Events emitted:
 * - user.created, user.updated, user.deactivated, user.reactivated
 * - auth.login.success, auth.login.failed, auth.logout
 * - auth.token.refreshed, auth.password.changed
 * - role.assigned, role.revoked
 * - permission.granted, permission.revoked
 * - offline.queue.entry.added, offline.queue.synced
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly offlineQueueService: OfflineQueueService,
  ) {}

  /**
   * Emit an identity domain event.
   *
   * If emission fails, the event is queued offline for later retry.
   * This ensures no events are lost even in degraded connectivity.
   */
  async emit(
    eventType: IdentityEvent,
    data: Record<string, any>,
    tenantId?: string | null,
    actorId?: string | null,
  ): Promise<void> {
    const payload: IdentityEventPayload = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: 'identity-service',
        version: '1.0.0',
        correlationId: this.generateCorrelationId(),
        tenantId: tenantId || data.tenantId || null,
        actorId: actorId || data.userId || null,
      },
    };

    try {
      // Emit via NestJS EventEmitter2 (in-process)
      this.eventEmitter.emit(eventType, payload);

      this.logger.log(
        `Event emitted: ${eventType} (correlationId: ${payload.metadata.correlationId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to emit event ${eventType}: ${error.message}. Queuing offline.`,
      );

      // Queue for offline retry
      this.offlineQueueService.enqueue(eventType, {
        ...payload,
        failureReason: error.message,
      });
    }
  }

  /**
   * Subscribe to an identity event.
   * Returns an unsubscribe function.
   */
  on(
    eventType: IdentityEvent,
    handler: (payload: IdentityEventPayload) => void,
  ): () => void {
    this.eventEmitter.on(eventType, handler);
    return () => this.eventEmitter.removeListener(eventType, handler);
  }

  /**
   * Generate a unique correlation ID for event tracing.
   */
  private generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `evt-${timestamp}-${random}`;
  }
}
