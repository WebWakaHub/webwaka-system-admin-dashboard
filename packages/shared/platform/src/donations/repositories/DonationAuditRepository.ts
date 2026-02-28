import { Repository, DataSource } from 'typeorm';
import { DonationAudit, AuditAction } from '../models/DonationAudit';

export class DonationAuditRepository {
  private repository: Repository<DonationAudit>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(DonationAudit);
  }

  async create(audit: Partial<DonationAudit>): Promise<DonationAudit> {
    const newAudit = this.repository.create(audit);
    return await this.repository.save(newAudit);
  }

  async findByDonationId(donationId: string): Promise<DonationAudit[]> {
    return await this.repository.find({
      where: { donationId },
      order: { timestamp: 'DESC' },
    });
  }

  async logAction(
    donationId: string,
    action: AuditAction,
    userId: string,
    changes?: Record<string, any>
  ): Promise<DonationAudit> {
    return await this.create({
      donationId,
      action,
      userId,
      changes,
    });
  }
}
