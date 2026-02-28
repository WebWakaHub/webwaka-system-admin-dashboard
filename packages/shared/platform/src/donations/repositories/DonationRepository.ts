import { Repository, DataSource, Between, In } from 'typeorm';
import { Donation, DonationStatus } from '../models/Donation';

export class DonationRepository {
  private repository: Repository<Donation>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Donation);
  }

  async create(donation: Partial<Donation>): Promise<Donation> {
    const newDonation = this.repository.create(donation);
    return await this.repository.save(newDonation);
  }

  async findById(donationId: string): Promise<Donation | null> {
    return await this.repository.findOne({ where: { donationId } });
  }

  async findByChurchId(
    churchId: string,
    options?: {
      donorId?: string;
      campaignId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: DonationStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ donations: Donation[]; total: number }> {
    const where: any = { churchId };

    if (options?.donorId) {
      where.donorId = options.donorId;
    }

    if (options?.campaignId) {
      where.campaignId = options.campaignId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.startDate && options?.endDate) {
      where.createdAt = Between(options.startDate, options.endDate);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [donations, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { donations, total };
  }

  async findByTransactionId(transactionId: string): Promise<Donation | null> {
    return await this.repository.findOne({ where: { transactionId } });
  }

  async update(donationId: string, updates: Partial<Donation>): Promise<Donation | null> {
    await this.repository.update({ donationId }, updates);
    return await this.findById(donationId);
  }

  async getTotalByChurch(
    churchId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ totalAmount: number; count: number }> {
    const where: any = { churchId, status: DonationStatus.COMPLETED };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const result = await this.repository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'totalAmount')
      .addSelect('COUNT(donation.donationId)', 'count')
      .where(where)
      .getRawOne();

    return {
      totalAmount: parseFloat(result.totalAmount || '0'),
      count: parseInt(result.count || '0', 10),
    };
  }

  async getTotalByCampaign(campaignId: string): Promise<{ totalAmount: number; donorCount: number }> {
    const result = await this.repository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'totalAmount')
      .addSelect('COUNT(DISTINCT donation.donorId)', 'donorCount')
      .where({ campaignId, status: DonationStatus.COMPLETED })
      .getRawOne();

    return {
      totalAmount: parseFloat(result.totalAmount || '0'),
      donorCount: parseInt(result.donorCount || '0', 10),
    };
  }
}
