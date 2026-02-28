export class Voter {
  id?: string;
  tenantId!: string;
  constituencyId!: string;
  firstName!: string;
  lastName!: string;
  dateOfBirth!: Date;
  gender!: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address!: string;
  registrationDate: Date = new Date();
  status!: 'active' | 'inactive' | 'suspended';
  voterIdNumber!: string;

  constructor(data: Partial<Voter>) {
    Object.assign(this, data);
  }
}
