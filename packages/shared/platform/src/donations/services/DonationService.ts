import { DataSource } from 'typeorm';
import { Donation, DonationStatus, PaymentMethod, PaymentGateway } from '../models/Donation';
import { DonationRepository } from '../repositories/DonationRepository';
import { DonationAuditRepository } from '../repositories/DonationAuditRepository';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { AuditAction } from '../models/DonationAudit';
import { ReceiptGenerator } from '../utils/ReceiptGenerator';
import { DonationEventPublisher } from '../events/DonationEventPublisher';
import { PaymentGatewayService } from './PaymentGatewayService';
import { CreateDonationDto } from '../dto/CreateDonationDto';
import { RefundDonationDto } from '../dto/RefundDonationDto';

export class DonationService {
  private donationRepository: DonationRepository;
  private auditRepository: DonationAuditRepository;
  private campaignRepository: CampaignRepository;
  private paymentGatewayService: PaymentGatewayService;

  constructor(dataSource: DataSource) {
    this.donationRepository = new DonationRepository(dataSource);
    this.auditRepository = new DonationAuditRepository(dataSource);
    this.campaignRepository = new CampaignRepository(dataSource);
    this.paymentGatewayService = new PaymentGatewayService(dataSource);
  }

  /**
   * Create a new donation
   */
  async createDonation(
    churchId: string,
    userId: string,
    donorEmail: string,
    dto: CreateDonationDto
  ): Promise<{ donation: Donation; paymentUrl?: string }> {
    // Generate receipt number
    const receiptNumber = ReceiptGenerator.generateReceiptNumber();

    // Create donation record
    const donation = await this.donationRepository.create({
      churchId,
      donorId: dto.donorId,
      amount: dto.amount,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod,
      campaignId: dto.campaignId,
      purpose: dto.purpose,
      metadata: dto.metadata,
      receiptNumber,
      status: DonationStatus.PENDING,
    });

    // Log audit trail
    await this.auditRepository.logAction(donation.donationId, AuditAction.CREATED, userId);

    // Publish event
    await DonationEventPublisher.publishDonationCreated({
      donationId: donation.donationId,
      donorId: donation.donorId,
      amount: donation.amount,
      currency: donation.currency,
      paymentMethod: donation.paymentMethod,
    });

    // For online payments, initialize payment gateway
    if (dto.paymentMethod === PaymentMethod.CARD || dto.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      const paymentResult = await this.paymentGatewayService.initializePayment(
        churchId,
        {
          amount: dto.amount,
          currency: dto.currency,
          email: donorEmail,
          reference: donation.donationId,
        }
      );

      if (paymentResult.success && paymentResult.transactionId) {
        // Update donation with transaction ID and payment gateway
        const updatedDonation = await this.donationRepository.update(donation.donationId, {
          transactionId: paymentResult.transactionId,
          paymentGateway: PaymentGateway.PAYSTACK, // Using Paystack as primary gateway
        });

        return {
          donation: updatedDonation || donation,
          paymentUrl: paymentResult.paymentUrl,
        };
      } else {
        // Payment initialization failed, mark donation as failed
        await this.donationRepository.update(donation.donationId, {
          status: DonationStatus.FAILED,
        });
        
        await DonationEventPublisher.publishDonationFailed({
          donationId: donation.donationId,
          reason: paymentResult.error || 'Payment initialization failed',
        });
        
        throw new Error(paymentResult.error || 'Payment initialization failed');
      }
    }

    // For offline payments (cash, check), mark as completed immediately
    if (dto.paymentMethod === PaymentMethod.CASH || dto.paymentMethod === PaymentMethod.CHECK) {
      const completedDonation = await this.completeDonation(donation.donationId, userId);
      return { donation: completedDonation || donation };
    }

    return { donation };
  }

  /**
   * Complete a donation (mark as completed and update campaign progress)
   */
  async completeDonation(donationId: string, userId: string): Promise<Donation | null> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    // Update donation status
    const updatedDonation = await this.donationRepository.update(donationId, {
      status: DonationStatus.COMPLETED,
    });

    // Log audit trail
    await this.auditRepository.logAction(donationId, AuditAction.UPDATED, userId, {
      status: { from: donation.status, to: DonationStatus.COMPLETED },
    });

    // Update campaign progress if donation is linked to a campaign
    if (donation.campaignId) {
      await this.campaignRepository.addToAmountRaised(donation.campaignId, donation.amount);
      await this.campaignRepository.incrementDonorCount(donation.campaignId);

      // Check if campaign goal is reached
      const campaign = await this.campaignRepository.findById(donation.campaignId);
      if (campaign && campaign.amountRaised >= campaign.goalAmount) {
        await DonationEventPublisher.publishCampaignGoalReached({
          campaignId: campaign.campaignId,
          goalAmount: campaign.goalAmount,
          amountRaised: campaign.amountRaised,
        });
      }
    }

    // Publish event
    await DonationEventPublisher.publishDonationCompleted({
      donationId: donation.donationId,
      transactionId: donation.transactionId || '',
      amount: donation.amount,
    });

    return updatedDonation;
  }

  /**
   * Verify payment and complete donation
   */
  async verifyAndCompleteDonation(donationId: string, userId: string): Promise<Donation | null> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    if (!donation.transactionId) {
      throw new Error('No transaction ID found for this donation');
    }

    // Verify payment with gateway
    const verificationResult = await this.paymentGatewayService.verifyPayment(
      donation.transactionId
    );

    if (verificationResult.success && verificationResult.status === 'success') {
      return await this.completeDonation(donationId, userId);
    } else {
      // Mark donation as failed
      await this.donationRepository.update(donationId, {
        status: DonationStatus.FAILED,
      });

      await DonationEventPublisher.publishDonationFailed({
        donationId: donation.donationId,
        reason: verificationResult.error || 'Payment verification failed',
      });

      return await this.donationRepository.findById(donationId);
    }
  }

  /**
   * Refund a donation
   */
  async refundDonation(
    donationId: string,
    userId: string,
    dto: RefundDonationDto
  ): Promise<Donation | null> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    if (donation.status !== DonationStatus.COMPLETED) {
      throw new Error('Only completed donations can be refunded');
    }

    // Process refund through payment gateway
    if (donation.transactionId) {
      const refundResult = await this.paymentGatewayService.refundPayment({
        transactionId: donation.transactionId,
        amount: dto.amount,
        reason: dto.reason,
      });

      if (!refundResult.success) {
        throw new Error(refundResult.error || 'Refund failed');
      }

      // Update donation status
      const updatedDonation = await this.donationRepository.update(donationId, {
        status: DonationStatus.REFUNDED,
      });

      // Log audit trail
      await this.auditRepository.logAction(donationId, AuditAction.REFUNDED, userId, {
        reason: dto.reason,
        amount: dto.amount || donation.amount,
      });

      // Update campaign progress if donation was linked to a campaign
      if (donation.campaignId) {
        await this.campaignRepository.addToAmountRaised(
          donation.campaignId,
          -(dto.amount || donation.amount)
        );
      }

      // Publish event
      await DonationEventPublisher.publishDonationRefunded({
        donationId: donation.donationId,
        refundId: refundResult.refundId || '',
        amount: dto.amount || donation.amount,
        reason: dto.reason,
      });

      return updatedDonation;
    }

    throw new Error('Cannot refund donation without transaction ID');
  }

  /**
   * Get donation by ID
   */
  async getDonationById(donationId: string): Promise<Donation | null> {
    return await this.donationRepository.findById(donationId);
  }

  /**
   * List donations with filters
   */
  async listDonations(
    churchId: string,
    filters?: {
      donorId?: string;
      campaignId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: DonationStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ donations: Donation[]; total: number }> {
    return await this.donationRepository.findByChurchId(churchId, filters);
  }

  /**
   * Get donation summary report
   */
  async getDonationSummary(
    churchId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ totalAmount: number; donationCount: number; averageAmount: number }> {
    const result = await this.donationRepository.getTotalByChurch(churchId, startDate, endDate);
    
    return {
      totalAmount: result.totalAmount,
      donationCount: result.count,
      averageAmount: result.count > 0 ? result.totalAmount / result.count : 0,
    };
  }
}
