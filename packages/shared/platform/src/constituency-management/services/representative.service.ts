import { EventEmitter } from 'events';
import { Representative } from '../models/representative';

export class RepresentativeService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async assignRepresentative(data: any): Promise<Representative> {
    const representative = new Representative({
      ...data,
      id: `rep-${Date.now()}`,
      status: 'active',
    });

    await this.repository.create(representative);
    
    this.eventEmitter.emit('representative.assigned', {
      representativeId: representative.id,
      constituencyId: representative.constituencyId,
      tenantId: representative.tenantId,
      position: representative.position,
    });

    return representative;
  }

  async getRepresentative(id: string, tenantId: string): Promise<Representative> {
    return await this.repository.findById(id, tenantId);
  }

  async listRepresentativesByConstituency(constituencyId: string, tenantId: string): Promise<Representative[]> {
    return await this.repository.findByConstituency(constituencyId, tenantId);
  }

  async updateRepresentative(id: string, tenantId: string, data: Partial<Representative>): Promise<Representative> {
    const representative = await this.getRepresentative(id, tenantId);
    
    Object.assign(representative, data);
    
    await this.repository.update(representative);
    
    this.eventEmitter.emit('representative.updated', {
      representativeId: representative.id,
      constituencyId: representative.constituencyId,
    });

    return representative;
  }

  async endTerm(id: string, tenantId: string): Promise<Representative> {
    const representative = await this.getRepresentative(id, tenantId);
    
    representative.status = 'inactive';
    representative.termEnd = new Date();
    
    await this.repository.update(representative);
    
    this.eventEmitter.emit('representative.term_ended', {
      representativeId: representative.id,
      constituencyId: representative.constituencyId,
      termEnd: representative.termEnd,
    });

    return representative;
  }

  async getRepresentativeHistory(constituencyId: string, tenantId: string): Promise<Representative[]> {
    return await this.repository.getHistory(constituencyId, tenantId);
  }
}
