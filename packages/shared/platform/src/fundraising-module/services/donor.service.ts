import { EventEmitter } from 'events';
import { Donor } from '../models/donor';

export class DonorService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createDonor(data: any, userId: string): Promise<Donor> {
    const donor = new Donor({
      ...data,
      id: `donor-${Date.now()}`,
    });

    await this.repository.create(donor);
    this.eventEmitter.emit('fundraising.donor.added', {
      donorId: donor.id,
      tenantId: donor.tenantId,
      createdBy: userId,
    });

    return donor;
  }

  async getDonor(id: string, tenantId: string): Promise<Donor> {
    return await this.repository.findById(id, tenantId);
  }

  async listDonors(tenantId: string): Promise<Donor[]> {
    return await this.repository.findByTenant(tenantId);
  }
}
