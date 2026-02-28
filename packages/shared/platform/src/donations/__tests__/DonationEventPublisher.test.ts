import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DonationEventPublisher } from '../events/DonationEventPublisher';

describe('DonationEventPublisher', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('publishDonationCreated', () => {
    it('should publish donation.created event', async () => {
      const data = {
        donationId: 'donation-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: 'CARD',
      };

      await DonationEventPublisher.publishDonationCreated(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] donation.created',
        expect.objectContaining({
          eventType: 'donation.created',
          payload: data,
        })
      );
    });

    it('should include timestamp in event', async () => {
      const data = {
        donationId: 'donation-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: 'CARD',
      };

      await DonationEventPublisher.publishDonationCreated(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] donation.created',
        expect.objectContaining({
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('publishDonationCompleted', () => {
    it('should publish donation.completed event', async () => {
      const data = {
        donationId: 'donation-123',
        transactionId: 'txn-123',
        amount: 10000,
      };

      await DonationEventPublisher.publishDonationCompleted(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] donation.completed',
        expect.objectContaining({
          eventType: 'donation.completed',
          payload: data,
        })
      );
    });
  });

  describe('publishDonationFailed', () => {
    it('should publish donation.failed event', async () => {
      const data = {
        donationId: 'donation-123',
        reason: 'Payment declined',
      };

      await DonationEventPublisher.publishDonationFailed(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] donation.failed',
        expect.objectContaining({
          eventType: 'donation.failed',
          payload: data,
        })
      );
    });
  });

  describe('publishDonationRefunded', () => {
    it('should publish donation.refunded event', async () => {
      const data = {
        donationId: 'donation-123',
        refundId: 'refund-123',
        amount: 10000,
        reason: 'Duplicate payment',
      };

      await DonationEventPublisher.publishDonationRefunded(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] donation.refunded',
        expect.objectContaining({
          eventType: 'donation.refunded',
          payload: data,
        })
      );
    });
  });

  describe('publishCampaignGoalReached', () => {
    it('should publish campaign.goal_reached event', async () => {
      const data = {
        campaignId: 'campaign-123',
        goalAmount: 1000000,
        amountRaised: 1000000,
      };

      await DonationEventPublisher.publishCampaignGoalReached(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] campaign.goal_reached',
        expect.objectContaining({
          eventType: 'campaign.goal_reached',
          payload: data,
        })
      );
    });
  });

  describe('publishRecurringPaymentFailed', () => {
    it('should publish recurring_donation.payment_failed event', async () => {
      const data = {
        scheduleId: 'schedule-123',
        donationId: 'donation-123',
        attemptCount: 2,
        nextRetryDate: new Date('2026-02-14'),
      };

      await DonationEventPublisher.publishRecurringPaymentFailed(data);

      expect(console.log).toHaveBeenCalledWith(
        '[EVENT] recurring_donation.payment_failed',
        expect.objectContaining({
          eventType: 'recurring_donation.payment_failed',
          payload: data,
        })
      );
    });
  });
});
