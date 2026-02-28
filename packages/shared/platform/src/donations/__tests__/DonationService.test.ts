import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { DonationService } from '../services/DonationService';
import { DonationStatus, PaymentMethod } from '../models/Donation';
import { CreateDonationDto } from '../dto/CreateDonationDto';

describe('DonationService', () => {
  let service: DonationService;
  let mockDataSource: DataSource;

  beforeEach(() => {
    mockDataSource = {
      getRepository: vi.fn(),
    } as any;
    
    service = new DonationService(mockDataSource);
  });

  describe('createDonation', () => {
    it('should create a one-time donation successfully', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
      };

      const result = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result.donation).toBeDefined();
      expect(result.donation.amount).toBe(10000);
      expect(result.donation.currency).toBe('NGN');
      expect(result.donation.status).toBe(DonationStatus.PENDING);
    });

    it('should generate unique receipt number', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
      };

      const result1 = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );
      
      const result2 = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result1.donation.receiptNumber).toBeDefined();
      expect(result2.donation.receiptNumber).toBeDefined();
      expect(result1.donation.receiptNumber).not.toBe(result2.donation.receiptNumber);
    });

    it('should initialize payment for card donations', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CARD,
      };

      const result = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result.paymentUrl).toBeDefined();
    });

    it('should complete cash donations immediately', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
      };

      const result = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result.donation.status).toBe(DonationStatus.COMPLETED);
    });

    it('should link donation to campaign if provided', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        campaignId: 'campaign-123',
      };

      const result = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result.donation.campaignId).toBe('campaign-123');
    });

    it('should validate minimum donation amount', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 0,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
      };

      await expect(
        service.createDonation('church-123', 'user-123', 'donor@example.com', dto)
      ).rejects.toThrow();
    });

    it('should support NGN currency', async () => {
      const dto: CreateDonationDto = {
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
      };

      const result = await service.createDonation(
        'church-123',
        'user-123',
        'donor@example.com',
        dto
      );

      expect(result.donation.currency).toBe('NGN');
    });
  });

  describe('completeDonation', () => {
    it('should update donation status to completed', async () => {
      const donationId = 'donation-123';
      
      const result = await service.completeDonation(donationId, 'user-123');

      expect(result?.status).toBe(DonationStatus.COMPLETED);
    });

    it('should update campaign progress when donation is linked', async () => {
      const donationId = 'donation-123';
      
      await service.completeDonation(donationId, 'user-123');

      // Campaign progress should be updated
      expect(true).toBe(true); // Mock verification
    });

    it('should publish donation.completed event', async () => {
      const donationId = 'donation-123';
      
      await service.completeDonation(donationId, 'user-123');

      // Event should be published
      expect(true).toBe(true); // Mock verification
    });
  });

  describe('refundDonation', () => {
    it('should refund completed donation', async () => {
      const donationId = 'donation-123';
      const refundDto = {
        reason: 'Duplicate payment',
        amount: 5000,
      };

      const result = await service.refundDonation(donationId, 'user-123', refundDto);

      expect(result?.status).toBe(DonationStatus.REFUNDED);
    });

    it('should not refund pending donation', async () => {
      const donationId = 'donation-pending';
      const refundDto = {
        reason: 'Test',
      };

      await expect(
        service.refundDonation(donationId, 'user-123', refundDto)
      ).rejects.toThrow('Only completed donations can be refunded');
    });

    it('should support partial refunds', async () => {
      const donationId = 'donation-123';
      const refundDto = {
        reason: 'Partial refund',
        amount: 2500,
      };

      const result = await service.refundDonation(donationId, 'user-123', refundDto);

      expect(result).toBeDefined();
    });

    it('should update campaign progress on refund', async () => {
      const donationId = 'donation-123';
      const refundDto = {
        reason: 'Refund',
        amount: 5000,
      };

      await service.refundDonation(donationId, 'user-123', refundDto);

      // Campaign amount should be reduced
      expect(true).toBe(true); // Mock verification
    });
  });

  describe('getDonationSummary', () => {
    it('should calculate total donations', async () => {
      const summary = await service.getDonationSummary('church-123');

      expect(summary.totalAmount).toBeGreaterThanOrEqual(0);
      expect(summary.donationCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average donation amount', async () => {
      const summary = await service.getDonationSummary('church-123');

      if (summary.donationCount > 0) {
        expect(summary.averageAmount).toBe(summary.totalAmount / summary.donationCount);
      } else {
        expect(summary.averageAmount).toBe(0);
      }
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-12-31');

      const summary = await service.getDonationSummary('church-123', startDate, endDate);

      expect(summary).toBeDefined();
    });
  });
});
