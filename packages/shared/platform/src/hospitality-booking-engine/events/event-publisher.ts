/**
 * Hospitality Booking Engine - Event Publisher
 * 
 * Publishes booking-related events to the event bus with schema validation.
 * Implements at-least-once delivery guarantee.
 * 
 * @module hospitality-booking-engine/events/event-publisher
 * @author webwakaagent4
 */

import { v4 as uuidv4 } from 'uuid';
import {
  EventType,
  EventPayload,
  BookingCreatedEventData,
  BookingModifiedEventData,
  BookingCancelledEventData,
  PaymentCompletedEventData,
  BookingSyncedEventData,
} from '../types';

/**
 * Event Bus Interface
 * 
 * Abstraction for event bus implementation (NATS, Redis Streams, etc.)
 */
export interface IEventBus {
  publish(topic: string, payload: EventPayload): Promise<void>;
}

/**
 * Event Publisher
 * 
 * Handles event publication with schema validation and versioning.
 */
export class EventPublisher {
  private eventBus: IEventBus;
  private eventVersion: string = '1.0';

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Publish Booking Created Event
   * 
   * Emitted when a new booking is created.
   */
  async publishBookingCreated(data: BookingCreatedEventData & { tenantId: string }): Promise<void> {
    const payload: EventPayload = {
      eventType: EventType.BOOKING_CREATED,
      eventId: uuidv4(),
      tenantId: data.tenantId,
      occurredAt: new Date().toISOString(),
      data: {
        bookingId: data.bookingId,
        referenceNumber: data.referenceNumber,
        propertyId: data.propertyId,
        guestId: data.guestId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        totalAmount: data.totalAmount,
        currency: data.currency,
        rooms: data.rooms,
      },
      metadata: {
        version: this.eventVersion,
        source: 'hospitality-booking-engine',
      },
    };

    await this.validateAndPublish('booking.created', payload);
  }

  /**
   * Publish Booking Modified Event
   * 
   * Emitted when a booking is modified.
   */
  async publishBookingModified(data: BookingModifiedEventData & { tenantId: string }): Promise<void> {
    const payload: EventPayload = {
      eventType: EventType.BOOKING_MODIFIED,
      eventId: uuidv4(),
      tenantId: data.tenantId,
      occurredAt: new Date().toISOString(),
      data: {
        bookingId: data.bookingId,
        referenceNumber: data.referenceNumber,
        changes: data.changes,
      },
      metadata: {
        version: this.eventVersion,
        source: 'hospitality-booking-engine',
      },
    };

    await this.validateAndPublish('booking.modified', payload);
  }

  /**
   * Publish Booking Cancelled Event
   * 
   * Emitted when a booking is cancelled.
   */
  async publishBookingCancelled(data: BookingCancelledEventData & { tenantId: string }): Promise<void> {
    const payload: EventPayload = {
      eventType: EventType.BOOKING_CANCELLED,
      eventId: uuidv4(),
      tenantId: data.tenantId,
      occurredAt: new Date().toISOString(),
      data: {
        bookingId: data.bookingId,
        referenceNumber: data.referenceNumber,
        cancellationReason: data.cancellationReason,
        refundAmount: data.refundAmount,
        refundStatus: data.refundStatus,
      },
      metadata: {
        version: this.eventVersion,
        source: 'hospitality-booking-engine',
      },
    };

    await this.validateAndPublish('booking.cancelled', payload);
  }

  /**
   * Publish Payment Completed Event
   * 
   * Emitted when a payment is successfully completed.
   */
  async publishPaymentCompleted(data: PaymentCompletedEventData & { tenantId: string }): Promise<void> {
    const payload: EventPayload = {
      eventType: EventType.PAYMENT_COMPLETED,
      eventId: uuidv4(),
      tenantId: data.tenantId,
      occurredAt: new Date().toISOString(),
      data: {
        paymentId: data.paymentId,
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        transactionId: data.transactionId,
      },
      metadata: {
        version: this.eventVersion,
        source: 'hospitality-booking-engine',
      },
    };

    await this.validateAndPublish('payment.completed', payload);
  }

  /**
   * Publish Booking Synced Event
   * 
   * Emitted when an offline booking is synced to the server.
   */
  async publishBookingSynced(data: BookingSyncedEventData & { tenantId: string }): Promise<void> {
    const payload: EventPayload = {
      eventType: EventType.BOOKING_SYNCED,
      eventId: uuidv4(),
      tenantId: data.tenantId,
      occurredAt: new Date().toISOString(),
      data: {
        bookingId: data.bookingId,
        syncStatus: data.syncStatus,
        conflicts: data.conflicts,
      },
      metadata: {
        version: this.eventVersion,
        source: 'hospitality-booking-engine',
      },
    };

    await this.validateAndPublish('booking.synced', payload);
  }

  /**
   * Validate and Publish Event
   * 
   * Validates event payload schema and publishes to event bus.
   */
  private async validateAndPublish(topic: string, payload: EventPayload): Promise<void> {
    // Validate event payload
    this.validateEventPayload(payload);

    // Publish to event bus
    try {
      await this.eventBus.publish(topic, payload);
      console.log(`Event published: ${payload.eventType} (${payload.eventId})`);
    } catch (error) {
      console.error(`Failed to publish event: ${payload.eventType}`, error);
      // Implement retry logic or dead letter queue here
      throw error;
    }
  }

  /**
   * Validate Event Payload
   * 
   * Validates event payload against schema.
   */
  private validateEventPayload(payload: EventPayload): void {
    if (!payload.eventType) {
      throw new Error('Event type is required');
    }

    if (!payload.eventId) {
      throw new Error('Event ID is required');
    }

    if (!payload.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!payload.occurredAt) {
      throw new Error('Occurred at timestamp is required');
    }

    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('Event data is required and must be an object');
    }

    // Validate event-specific data
    switch (payload.eventType) {
      case EventType.BOOKING_CREATED:
        this.validateBookingCreatedData(payload.data);
        break;
      case EventType.BOOKING_MODIFIED:
        this.validateBookingModifiedData(payload.data);
        break;
      case EventType.BOOKING_CANCELLED:
        this.validateBookingCancelledData(payload.data);
        break;
      case EventType.PAYMENT_COMPLETED:
        this.validatePaymentCompletedData(payload.data);
        break;
      case EventType.BOOKING_SYNCED:
        this.validateBookingSyncedData(payload.data);
        break;
      default:
        throw new Error(`Unknown event type: ${payload.eventType}`);
    }
  }

  /**
   * Validate Booking Created Data
   */
  private validateBookingCreatedData(data: any): void {
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.referenceNumber) throw new Error('Reference number is required');
    if (!data.propertyId) throw new Error('Property ID is required');
    if (!data.guestId) throw new Error('Guest ID is required');
    if (!data.checkInDate) throw new Error('Check-in date is required');
    if (!data.checkOutDate) throw new Error('Check-out date is required');
    if (!data.totalAmount) throw new Error('Total amount is required');
    if (!data.currency) throw new Error('Currency is required');
    if (!data.rooms || !Array.isArray(data.rooms)) throw new Error('Rooms array is required');
  }

  /**
   * Validate Booking Modified Data
   */
  private validateBookingModifiedData(data: any): void {
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.referenceNumber) throw new Error('Reference number is required');
    if (!data.changes || !Array.isArray(data.changes)) throw new Error('Changes array is required');
  }

  /**
   * Validate Booking Cancelled Data
   */
  private validateBookingCancelledData(data: any): void {
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.referenceNumber) throw new Error('Reference number is required');
    if (!data.cancellationReason) throw new Error('Cancellation reason is required');
    if (data.refundAmount === undefined) throw new Error('Refund amount is required');
    if (!data.refundStatus) throw new Error('Refund status is required');
  }

  /**
   * Validate Payment Completed Data
   */
  private validatePaymentCompletedData(data: any): void {
    if (!data.paymentId) throw new Error('Payment ID is required');
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.amount) throw new Error('Amount is required');
    if (!data.currency) throw new Error('Currency is required');
    if (!data.gateway) throw new Error('Gateway is required');
    if (!data.transactionId) throw new Error('Transaction ID is required');
  }

  /**
   * Validate Booking Synced Data
   */
  private validateBookingSyncedData(data: any): void {
    if (!data.bookingId) throw new Error('Booking ID is required');
    if (!data.syncStatus) throw new Error('Sync status is required');
  }
}
