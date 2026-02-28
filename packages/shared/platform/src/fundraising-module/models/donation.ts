export class Donation {
  id: string;
  campaignId: string;
  donorId: string;
  amount: number;
  currency: string = 'NGN';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date = new Date();

  constructor(data: Partial<Donation>) {
    Object.assign(this, data);
  }
}
