export class FundraisingCampaign {
  id?: string;
  tenantId!: string;
  name!: string;
  description?: string;
  goal!: number;
  raised: number = 0;
  status!: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<FundraisingCampaign>) {
    Object.assign(this, data);
  }
}
