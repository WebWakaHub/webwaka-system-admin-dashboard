export interface DonationEvent {
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
}

export class DonationEventPublisher {
  /**
   * Publish donation.created event
   */
  static async publishDonationCreated(data: {
    donationId: string;
    donorId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'donation.created',
      payload: data,
      timestamp: new Date(),
    };
    
    // TODO: Integrate with actual event bus (NATS, RabbitMQ, etc.)
    console.log('[EVENT] donation.created', event);
  }

  /**
   * Publish donation.completed event
   */
  static async publishDonationCompleted(data: {
    donationId: string;
    transactionId: string;
    amount: number;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'donation.completed',
      payload: data,
      timestamp: new Date(),
    };
    
    console.log('[EVENT] donation.completed', event);
  }

  /**
   * Publish donation.failed event
   */
  static async publishDonationFailed(data: {
    donationId: string;
    reason: string;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'donation.failed',
      payload: data,
      timestamp: new Date(),
    };
    
    console.log('[EVENT] donation.failed', event);
  }

  /**
   * Publish donation.refunded event
   */
  static async publishDonationRefunded(data: {
    donationId: string;
    refundId: string;
    amount: number;
    reason: string;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'donation.refunded',
      payload: data,
      timestamp: new Date(),
    };
    
    console.log('[EVENT] donation.refunded', event);
  }

  /**
   * Publish campaign.goal_reached event
   */
  static async publishCampaignGoalReached(data: {
    campaignId: string;
    goalAmount: number;
    amountRaised: number;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'campaign.goal_reached',
      payload: data,
      timestamp: new Date(),
    };
    
    console.log('[EVENT] campaign.goal_reached', event);
  }

  /**
   * Publish recurring_donation.payment_failed event
   */
  static async publishRecurringPaymentFailed(data: {
    scheduleId: string;
    donationId: string;
    attemptCount: number;
    nextRetryDate: Date;
  }): Promise<void> {
    const event: DonationEvent = {
      eventType: 'recurring_donation.payment_failed',
      payload: data,
      timestamp: new Date(),
    };
    
    console.log('[EVENT] recurring_donation.payment_failed', event);
  }
}
