/**
 * Guest Management Event Publisher
 * 
 * @author webwakaagent4
 * @step 447
 */

import { v4 as uuidv4 } from 'uuid';
import { GuestCreatedEvent, LoyaltyPointsEarnedEvent, FeedbackSubmittedEvent, LoyaltyTier } from '../types';

export class EventPublisher {
  async publishGuestCreated(data: { guestId: string; email: string; phone: string; tenantId: string }): Promise<void> {
    const event: GuestCreatedEvent = {
      eventId: uuidv4(),
      eventType: 'guest.created',
      eventVersion: '1.0',
      timestamp: new Date().toISOString(),
      tenantId: data.tenantId,
      data: {
        guestId: data.guestId,
        email: data.email,
        phone: data.phone,
      },
    };
    await this.publish(event);
  }

  async publishLoyaltyPointsEarned(data: { guestId: string; points: number; newBalance: number; newTier?: LoyaltyTier; tenantId: string }): Promise<void> {
    const event: LoyaltyPointsEarnedEvent = {
      eventId: uuidv4(),
      eventType: 'guest.loyalty.points_earned',
      eventVersion: '1.0',
      timestamp: new Date().toISOString(),
      tenantId: data.tenantId,
      data: {
        guestId: data.guestId,
        points: data.points,
        newBalance: data.newBalance,
        newTier: data.newTier,
      },
    };
    await this.publish(event);
  }

  async publishFeedbackSubmitted(data: { feedbackId: string; guestId: string; propertyId: string; overallRating: number; tenantId: string }): Promise<void> {
    const event: FeedbackSubmittedEvent = {
      eventId: uuidv4(),
      eventType: 'guest.feedback.submitted',
      eventVersion: '1.0',
      timestamp: new Date().toISOString(),
      tenantId: data.tenantId,
      data: {
        feedbackId: data.feedbackId,
        guestId: data.guestId,
        propertyId: data.propertyId,
        overallRating: data.overallRating,
      },
    };
    await this.publish(event);
  }

  private async publish(event: any): Promise<void> {
    console.log('Publishing event:', event.eventType, event.eventId);
    // await eventBus.publish(event.eventType, event);
  }
}
