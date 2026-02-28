import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { DonationService } from '../services/DonationService';
import { CreateDonationDto } from '../dto/CreateDonationDto';
import { RefundDonationDto } from '../dto/RefundDonationDto';
import { DonationStatus } from '../models/Donation';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class DonationController {
  private donationService: DonationService;

  constructor(dataSource: DataSource) {
    this.donationService = new DonationService(dataSource);
  }

  /**
   * POST /api/v1/donations
   * Create a new donation
   */
  async createDonation(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateDonationDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const churchId = req.user?.churchId || req.body.churchId;
      const userId = req.user?.userId || req.body.userId;
      const donorEmail = req.body.donorEmail || req.user?.email;

      const result = await this.donationService.createDonation(churchId, userId, donorEmail, dto);

      res.status(201).json({
        donationId: result.donation.donationId,
        transactionId: result.donation.transactionId,
        status: result.donation.status,
        paymentUrl: result.paymentUrl,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create donation' });
    }
  }

  /**
   * GET /api/v1/donations/:id
   * Get donation by ID
   */
  async getDonation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const donation = await this.donationService.getDonationById(id);

      if (!donation) {
        res.status(404).json({ error: 'Donation not found' });
        return;
      }

      res.status(200).json(donation);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get donation' });
    }
  }

  /**
   * GET /api/v1/donations
   * List donations with filters
   */
  async listDonations(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user?.churchId || req.query.churchId as string;
      const donorId = req.query.donorId as string | undefined;
      const campaignId = req.query.campaignId as string | undefined;
      const status = req.query.status as DonationStatus | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.donationService.listDonations(churchId, {
        donorId,
        campaignId,
        status,
        startDate,
        endDate,
        page,
        limit,
      });

      res.status(200).json({
        donations: result.donations,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list donations' });
    }
  }

  /**
   * POST /api/v1/donations/:id/refund
   * Refund a donation
   */
  async refundDonation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = plainToClass(RefundDonationDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const userId = req.user?.userId || req.body.userId;
      const donation = await this.donationService.refundDonation(id, userId, dto);

      res.status(200).json({
        refundId: donation?.donationId,
        status: donation?.status,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to refund donation' });
    }
  }

  /**
   * GET /api/v1/donations/reports/summary
   * Get donation summary report
   */
  async getDonationSummary(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user?.churchId || req.query.churchId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const summary = await this.donationService.getDonationSummary(churchId, startDate, endDate);

      res.status(200).json({
        totalAmount: summary.totalAmount,
        donationCount: summary.donationCount,
        averageAmount: summary.averageAmount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get donation summary' });
    }
  }

  /**
   * POST /api/v1/donations/:id/verify
   * Verify and complete donation
   */
  async verifyDonation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.body.userId;

      const donation = await this.donationService.verifyAndCompleteDonation(id, userId);

      res.status(200).json(donation);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to verify donation' });
    }
  }
}
