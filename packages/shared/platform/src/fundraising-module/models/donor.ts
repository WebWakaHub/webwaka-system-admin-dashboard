export class Donor {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  totalContributed: number = 0;
  donationCount: number = 0;
  lastDonationDate?: Date;
  preferences: Record<string, any> = {};
  createdAt: Date = new Date();

  constructor(data: Partial<Donor>) {
    Object.assign(this, data);
  }
}
