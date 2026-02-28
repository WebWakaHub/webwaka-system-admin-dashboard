import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DataSource } from 'typeorm';
import { DonationRepository } from '../../repositories/DonationRepository';
import { CampaignRepository } from '../../repositories/CampaignRepository';
import { RecurringDonationRepository } from '../../repositories/RecurringDonationRepository';
import { DonationStatus, PaymentMethod } from '../../models/Donation';
import { CampaignStatus } from '../../models/Campaign';
import { DonationFrequency, RecurringDonationStatus } from '../../models/RecurringDonation';

describe('Database Integration Tests', () => {
  let dataSource: DataSource;
  let donationRepo: DonationRepository;
  let campaignRepo: CampaignRepository;
  let recurringRepo: RecurringDonationRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      username: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASSWORD || 'test',
      database: process.env.TEST_DB_NAME || 'webwaka_test',
      synchronize: true,
      entities: ['src/donations/models/*.ts'],
    });

    await dataSource.initialize();

    donationRepo = new DonationRepository(dataSource);
    campaignRepo = new CampaignRepository(dataSource);
    recurringRepo = new RecurringDonationRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // Clean up test data
    await dataSource.query('TRUNCATE TABLE donations CASCADE');
    await dataSource.query('TRUNCATE TABLE campaigns CASCADE');
    await dataSource.query('TRUNCATE TABLE recurring_donations CASCADE');
  });

  describe('Donation Repository', () => {
    it('should create and retrieve donation', async () => {
      const donation = await donationRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'RCP-20260213-ABC123',
        status: DonationStatus.COMPLETED,
      });

      expect(donation.donationId).toBeDefined();

      const retrieved = await donationRepo.findById(donation.donationId);
      expect(retrieved?.amount).toBe(10000);
    });

    it('should enforce unique transaction ID', async () => {
      await donationRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CARD,
        transactionId: 'txn-unique-123',
        receiptNumber: 'RCP-20260213-ABC123',
        status: DonationStatus.COMPLETED,
      });

      await expect(
        donationRepo.create({
          churchId: 'church-123',
          donorId: 'donor-456',
          amount: 5000,
          currency: 'NGN',
          paymentMethod: PaymentMethod.CARD,
          transactionId: 'txn-unique-123', // Duplicate
          receiptNumber: 'RCP-20260213-XYZ789',
          status: DonationStatus.COMPLETED,
        })
      ).rejects.toThrow();
    });

    it('should filter donations by church', async () => {
      await donationRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'RCP-20260213-ABC123',
        status: DonationStatus.COMPLETED,
      });

      await donationRepo.create({
        churchId: 'church-456',
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'RCP-20260213-XYZ789',
        status: DonationStatus.COMPLETED,
      });

      const result = await donationRepo.findByChurchId('church-123');
      expect(result.donations.length).toBe(1);
    });

    it('should calculate total donations', async () => {
      await donationRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 10000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'RCP-20260213-ABC123',
        status: DonationStatus.COMPLETED,
      });

      await donationRepo.create({
        churchId: 'church-123',
        donorId: 'donor-456',
        amount: 15000,
        currency: 'NGN',
        paymentMethod: PaymentMethod.CASH,
        receiptNumber: 'RCP-20260213-XYZ789',
        status: DonationStatus.COMPLETED,
      });

      const result = await donationRepo.getTotalByChurch('church-123');
      expect(result.totalAmount).toBe(25000);
      expect(result.count).toBe(2);
    });
  });

  describe('Campaign Repository', () => {
    it('should create and retrieve campaign', async () => {
      const campaign = await campaignRepo.create({
        churchId: 'church-123',
        name: 'Building Fund',
        goalAmount: 5000000,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-12-31'),
        status: CampaignStatus.DRAFT,
        createdBy: 'user-123',
        amountRaised: 0,
        donorCount: 0,
      });

      expect(campaign.campaignId).toBeDefined();

      const retrieved = await campaignRepo.findById(campaign.campaignId);
      expect(retrieved?.name).toBe('Building Fund');
    });

    it('should update campaign progress', async () => {
      const campaign = await campaignRepo.create({
        churchId: 'church-123',
        name: 'Test Campaign',
        goalAmount: 1000000,
        startDate: new Date('2026-02-13'),
        endDate: new Date('2026-06-30'),
        status: CampaignStatus.ACTIVE,
        createdBy: 'user-123',
        amountRaised: 0,
        donorCount: 0,
      });

      await campaignRepo.addToAmountRaised(campaign.campaignId, 100000);
      await campaignRepo.incrementDonorCount(campaign.campaignId);

      const updated = await campaignRepo.findById(campaign.campaignId);
      expect(updated?.amountRaised).toBe(100000);
      expect(updated?.donorCount).toBe(1);
    });

    it('should enforce date constraint', async () => {
      await expect(
        campaignRepo.create({
          churchId: 'church-123',
          name: 'Invalid Campaign',
          goalAmount: 100000,
          startDate: new Date('2026-12-31'),
          endDate: new Date('2026-01-01'), // End before start
          status: CampaignStatus.DRAFT,
          createdBy: 'user-123',
          amountRaised: 0,
          donorCount: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('Recurring Donation Repository', () => {
    it('should create recurring donation schedule', async () => {
      const schedule = await recurringRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        frequency: DonationFrequency.MONTHLY,
        paymentMethod: 'CARD',
        startDate: new Date('2026-02-13'),
        nextPaymentDate: new Date('2026-03-13'),
        status: RecurringDonationStatus.ACTIVE,
      });

      expect(schedule.scheduleId).toBeDefined();
    });

    it('should find due payments', async () => {
      await recurringRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        frequency: DonationFrequency.MONTHLY,
        paymentMethod: 'CARD',
        startDate: new Date('2026-01-13'),
        nextPaymentDate: new Date('2026-02-13'),
        status: RecurringDonationStatus.ACTIVE,
      });

      const duePayments = await recurringRepo.findDuePayments(new Date('2026-02-13'));
      expect(duePayments.length).toBeGreaterThan(0);
    });

    it('should increment failed attempts', async () => {
      const schedule = await recurringRepo.create({
        churchId: 'church-123',
        donorId: 'donor-123',
        amount: 5000,
        currency: 'NGN',
        frequency: DonationFrequency.MONTHLY,
        paymentMethod: 'CARD',
        startDate: new Date('2026-02-13'),
        nextPaymentDate: new Date('2026-03-13'),
        status: RecurringDonationStatus.ACTIVE,
      });

      await recurringRepo.incrementFailedAttempts(schedule.scheduleId);

      const updated = await recurringRepo.findById(schedule.scheduleId);
      expect(updated?.failedAttempts).toBe(1);
    });
  });
});
