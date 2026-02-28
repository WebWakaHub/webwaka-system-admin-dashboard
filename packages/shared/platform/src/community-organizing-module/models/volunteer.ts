export class Volunteer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  hoursContributed: number = 0;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date = new Date();

  constructor(data: Partial<Volunteer>) {
    Object.assign(this, data);
  }
}
