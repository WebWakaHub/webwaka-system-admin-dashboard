import { DataSource } from 'typeorm';
import { RecurringDonation, RecurringDonationStatus } from '../models/RecurringDonation';
import { RecurringDonationRepository } from '../repositories/RecurringDonationRepository';
import { CreateRecurringDonationDto } from '../dto/CreateRecurringDonationDto';
import { UpdateRecurringDonationDto } from '../dto/UpdateRecurringDonationDto';
import { ReceiptGenerator } from '../utils/ReceiptGenerator';
import { DonationService } from './DonationService';
import { PaymentMethod } from '../models/Donation';
import { DonationEventPublisher } from '../events/DonationEventPublisher';

export class RecurringDonationService {
  private repository: RecurringDonationRepository;
  private donationService: DonationService;

  constructor(dataSource: DataSource) {
    this.repository = new RecurringDonationRepository(dataSource);
    this.donationService = new DonationService(dataSource);
  }

  /**
   * Create recurring donation schedule
   */
  async createRecurringDonation(
    churchId: string,
    userId: string,
    dto: CreateRecurringDonationDto
  ): Promise<RecurringDonation> {
    const startDate = new Date(dto.startDate);
    const nextPaymentDate = ReceiptGenerator.calculateNextPaymentDate(startDate, dto.frequency);

    const schedule = await this.repository.create({
      churchId,
      donorId: dto.donorId,
      amount: dto.amount,
      currency: dto.currency,
      frequency: dto.frequency,
      paymentMethod: dto.paymentMethod,
      startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      nextPaymentDate,
      status: RecurringDonationStatus.ACTIVE,
    });

    return schedule;
  }

  /**
   * Update recurring donation schedule
   */
  async updateRecurringDonation(
    scheduleId: string,
    dto: UpdateRecurringDonationDto
  ): Promise<RecurringDonation | null> {
    const updates: Partial<RecurringDonation> = {};

    if (dto.amount !== undefined) {
      updates.amount = dto.amount;
    }

    if (dto.frequency !== undefined) {
      updates.frequency = dto.frequency;
    }

    if (dto.status !== undefined) {
      updates.status = dto.status;
    }

    return await this.repository.update(scheduleId, updates);
  }

  /**
   * Process due recurring donations
   */
  async processDuePayments(userId: string, donorEmail: string): Promise<void> {
    const currentDate = new Date();
    const dueSchedules = await this.repository.findDuePayments(currentDate);

    for (const schedule of dueSchedules) {
      try {
        // Create donation for this recurring payment
        const result = await this.donationService.createDonation(
          schedule.churchId,
          userId,
          donorEmail,
          {
            donorId: schedule.donorId,
            amount: schedule.amount,
            currency: schedule.currency,
            paymentMethod: schedule.paymentMethod as PaymentMethod,
          }
        );

        // Update schedule with next payment date
        const nextPaymentDate = ReceiptGenerator.calculateNextPaymentDate(
          schedule.nextPaymentDate,
          schedule.frequency
        );

        await this.repository.update(schedule.scheduleId, {
          nextPaymentDate,
          lastPaymentDate: currentDate,
        });

        // Reset failed attempts on success
        await this.repository.resetFailedAttempts(schedule.scheduleId);

      } catch (error: any) {
        console.error(`Failed to process recurring donation ${schedule.scheduleId}:`, error);

        // Increment failed attempts
        await this.repository.incrementFailedAttempts(schedule.scheduleId);

        const schedule2 = await this.repository.findById(schedule.scheduleId);
        
        if (schedule2) {
          // Publish event
          await DonationEventPublisher.publishRecurringPaymentFailed({
            scheduleId: schedule.scheduleId,
            donationId: '',
            attemptCount: schedule2.failedAttempts,
            nextRetryDate: schedule2.nextPaymentDate,
          });

          // Pause schedule after 3 failed attempts
          if (schedule2.failedAttempts >= 3) {
            await this.repository.update(schedule.scheduleId, {
              status: RecurringDonationStatus.PAUSED,
            });
          }
        }
      }
    }
  }

  /**
   * Get recurring donation by ID
   */
  async getRecurringDonationById(scheduleId: string): Promise<RecurringDonation | null> {
    return await this.repository.findById(scheduleId);
  }

  /**
   * Get recurring donations by donor
   */
  async getRecurringDonationsByDonor(donorId: string): Promise<RecurringDonation[]> {
    return await this.repository.findByDonorId(donorId);
  }
}
