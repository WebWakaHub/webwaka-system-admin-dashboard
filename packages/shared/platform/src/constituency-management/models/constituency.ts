export class Constituency {
  id?: string;
  tenantId!: string;
  name!: string;
  code!: string;
  type!: 'federal' | 'state' | 'local' | 'ward';
  state!: string;
  lga?: string;
  boundaries?: any; // GeoJSON
  population!: number;
  registeredVoters!: number;
  area?: number;
  urbanRural!: 'urban' | 'rural' | 'mixed';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Constituency>) {
    Object.assign(this, data);
  }
}
