import { EventEmitter } from 'events';
import { Donation } from '../models/donation';

export class DonationService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createDonation(data: any, userId: string): Promise<Donation> {
    const donation = new Donation({
      ...data,
      id: `donation-${Date.now()}`,
      status: 'pending',
    });

    await this.repository.create(donation);
    this.eventEmitter.emit('fundraising.donation.created', {
      donationId: donation.id,
      amount: donation.amount,
      createdBy: userId,
    });

    return donation;
  }

  async processDonation(data: any, userId: string): Promise<Donation> {
    const donation = new Donation({
      ...data,
      id: `donation-${Date.now()}`,
      status: 'pending',
    });

    await this.repository.create(donation);
    this.eventEmitter.emit('fundraising.donation.received', {
      donationId: donation.id,
      amount: donation.amount,
      processedBy: userId,
    });

    return donation;
  }

  async completeDonation(id: string): Promise<Donation> {
    const donation = await this.repository.findById(id);
    donation.status = 'completed';
    await this.repository.update(donation);

    this.eventEmitter.emit('fundraising.donation.processed', {
      donationId: donation.id,
      status: 'completed',
    });

    return donation;
  }
}
