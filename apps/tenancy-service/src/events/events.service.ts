import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TenantEvent } from '../common/enums/tenant-status.enum';
import { OfflineQueueService } from '../offline/offline-queue.service';

/**
 * Events Service
 *
 * Emits tenant domain events using NestJS EventEmitter2.
 * Provides correlation ID tracking for distributed tracing.
 *
 * Offline-First: If event emission fails (e.g., event bus unavailable),
 * the event is queued in the OfflineQueueService for later replay.
 *
 * All 12 TenantEvent types are emitted with:
 * - correlationId: for distributed tracing
 * - timestamp: ISO 8601 in Africa/Lagos timezone
 * - eventType: the TenantEvent enum value
 * - payload: event-specific data
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly offlineQueue: OfflineQueueService,
  ) {}

  /**
   * Emit a tenant domain event.
   * Falls back to offline queue if emission fails.
   */
  async emit(eventType: TenantEvent, payload: Record<string, any>): Promise<void> {
    const correlationId = this.generateCorrelationId();
    const timestamp = new Date().toISOString();

    const event = {
      eventType,
      correlationId,
      timestamp,
      payload,
    };

    try {
      this.eventEmitter.emit(eventType, event);
      this.logger.log(
        `Event emitted: ${eventType} [correlationId=${correlationId}]`,
      );
    } catch (error) {
      this.logger.warn(
        `Event emission failed for ${eventType}, queuing for offline replay: ${error.message}`,
      );
      await this.offlineQueue.enqueue({
        operation: 'emit_event',
        payload: event,
      });
    }
  }

  /**
   * Generates a correlation ID for distributed tracing.
   * Format: ww-{timestamp}-{random}
   */
  private generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `ww-${timestamp}-${random}`;
  }
}
