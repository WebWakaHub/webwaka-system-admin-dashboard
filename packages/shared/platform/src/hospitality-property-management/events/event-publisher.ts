/**
 * Property Management - Event Publisher
 * 
 * Publishes domain events for property management operations.
 * 
 * @module hospitality-property-management/events/event-publisher
 * @author webwakaagent4
 */

export interface DomainEvent {
  type: string;
  version: string;
  timestamp: Date;
  data: Record<string, any>;
}

export class EventPublisher {
  private eventBus: any; // Event bus instance (e.g., Redis, RabbitMQ)

  constructor(eventBus?: any) {
    this.eventBus = eventBus;
  }

  /**
   * Publish a domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    // Validate event
    this.validateEvent(event);

    // Log event
    console.log(`[EVENT] ${event.type}`, {
      version: event.version,
      timestamp: event.timestamp,
      data: event.data,
    });

    // Publish to event bus if available
    if (this.eventBus) {
      await this.eventBus.publish(event.type, event);
    }

    // Store in event log (for audit trail)
    // This would integrate with an event store or audit log service
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: DomainEvent): void {
    if (!event.type) {
      throw new Error('Event type is required');
    }

    if (!event.version) {
      throw new Error('Event version is required');
    }

    if (!event.timestamp) {
      throw new Error('Event timestamp is required');
    }

    if (!event.data) {
      throw new Error('Event data is required');
    }

    // Validate version format (semver)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(event.version)) {
      throw new Error('Event version must be in semver format (e.g., 1.0.0)');
    }
  }
}
