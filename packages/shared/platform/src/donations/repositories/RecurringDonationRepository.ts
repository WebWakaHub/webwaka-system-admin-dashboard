import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { RecurringDonation, RecurringDonationStatus } from '../models/RecurringDonation';

export class RecurringDonationRepository {
  private repository: Repository<RecurringDonation>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(RecurringDonation);
  }

  async create(schedule: Partial<RecurringDonation>): Promise<RecurringDonation> {
    const newSchedule = this.repository.create(schedule);
    return await this.repository.save(newSchedule);
  }

  async findById(scheduleId: string): Promise<RecurringDonation | null> {
    return await this.repository.findOne({ where: { scheduleId } });
  }

  async findByDonorId(donorId: string): Promise<RecurringDonation[]> {
    return await this.repository.find({
      where: { donorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findDuePayments(currentDate: Date): Promise<RecurringDonation[]> {
    return await this.repository.find({
      where: {
        status: RecurringDonationStatus.ACTIVE,
        nextPaymentDate: LessThanOrEqual(currentDate),
      },
    });
  }

  async update(scheduleId: string, updates: Partial<RecurringDonation>): Promise<RecurringDonation | null> {
    await this.repository.update({ scheduleId }, updates);
    return await this.findById(scheduleId);
  }

  async incrementFailedAttempts(scheduleId: string): Promise<void> {
    await this.repository.increment({ scheduleId }, 'failedAttempts', 1);
  }

  async resetFailedAttempts(scheduleId: string): Promise<void> {
    await this.repository.update({ scheduleId }, { failedAttempts: 0 });
  }
}
