import { DataSource, Repository } from 'typeorm';
import { Registration, RegistrationStatus } from '../models/Registration';

export class RegistrationRepository {
  private repository: Repository<Registration>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Registration);
  }

  async create(data: Partial<Registration>): Promise<Registration> {
    const registration = this.repository.create(data);
    return await this.repository.save(registration);
  }

  async findById(registrationId: string): Promise<Registration | null> {
    return await this.repository.findOne({ where: { registrationId } });
  }

  async findByQrCode(qrCode: string): Promise<Registration | null> {
    return await this.repository.findOne({ where: { qrCode } });
  }

  async findByEventAndMember(eventId: string, memberId: string): Promise<Registration | null> {
    return await this.repository.findOne({ where: { eventId, memberId } });
  }

  async findByEventId(eventId: string, status?: RegistrationStatus): Promise<Registration[]> {
    const where: any = { eventId };
    if (status) {
      where.status = status;
    }
    return await this.repository.find({ where });
  }

  async findByMemberId(memberId: string): Promise<Registration[]> {
    return await this.repository.find({
      where: { memberId },
      order: { registrationDate: 'DESC' },
    });
  }

  async update(registrationId: string, data: Partial<Registration>): Promise<Registration | null> {
    await this.repository.update({ registrationId }, data);
    return await this.findById(registrationId);
  }

  async countByEvent(eventId: string, status?: RegistrationStatus): Promise<number> {
    const where: any = { eventId };
    if (status) {
      where.status = status;
    }
    return await this.repository.count({ where });
  }

  async delete(registrationId: string): Promise<boolean> {
    const result = await this.repository.delete({ registrationId });
    return (result.affected ?? 0) > 0;
  }
}
