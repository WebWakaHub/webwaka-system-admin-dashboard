export class Voter {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  engagementScore: number = 0;
  lastEngaged?: Date;
  preferences: Record<string, any> = {};
  createdAt: Date = new Date();

  constructor(data: Partial<Voter>) {
    Object.assign(this, data);
  }
}
