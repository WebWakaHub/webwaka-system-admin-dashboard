export class Representative {
  id?: string;
  tenantId!: string;
  constituencyId!: string;
  firstName!: string;
  lastName!: string;
  party?: string;
  position!: string;
  termStart!: Date;
  termEnd?: Date;
  phone?: string;
  email?: string;
  status!: 'active' | 'inactive';

  constructor(data: Partial<Representative>) {
    Object.assign(this, data);
  }
}
