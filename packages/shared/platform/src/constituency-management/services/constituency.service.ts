import { EventEmitter } from 'events';
import { Constituency } from '../models/constituency';

export class ConstituencyService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createConstituency(data: any, userId: string): Promise<Constituency> {
    const constituency = new Constituency({
      ...data,
      id: `const-${Date.now()}`,
    });

    await this.repository.create(constituency);
    
    this.eventEmitter.emit('constituency.created', {
      constituencyId: constituency.id,
      tenantId: constituency.tenantId,
      name: constituency.name,
      type: constituency.type,
      createdBy: userId,
    });

    return constituency;
  }

  async getConstituency(id: string, tenantId: string): Promise<Constituency> {
    return await this.repository.findById(id, tenantId);
  }

  async listConstituencies(tenantId: string, filters?: any): Promise<Constituency[]> {
    return await this.repository.findByTenant(tenantId, filters);
  }

  async updateConstituency(id: string, tenantId: string, data: Partial<Constituency>, userId: string): Promise<Constituency> {
    const constituency = await this.getConstituency(id, tenantId);
    
    Object.assign(constituency, data);
    constituency.updatedAt = new Date();
    
    await this.repository.update(constituency);
    
    this.eventEmitter.emit('constituency.updated', {
      constituencyId: constituency.id,
      updatedBy: userId,
    });

    return constituency;
  }

  async deleteConstituency(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repository.delete(id, tenantId);
    
    this.eventEmitter.emit('constituency.deleted', {
      constituencyId: id,
      deletedBy: userId,
    });
  }

  async getConstituencyAnalytics(id: string, tenantId: string): Promise<any> {
    const constituency = await this.getConstituency(id, tenantId);
    const voters = await this.repository.getVoterCount(id);
    
    return {
      constituencyId: id,
      name: constituency.name,
      population: constituency.population,
      registeredVoters: constituency.registeredVoters,
      registrationRate: constituency.population > 0 
        ? (constituency.registeredVoters / constituency.population) * 100 
        : 0,
      type: constituency.type,
      urbanRural: constituency.urbanRural,
    };
  }
}
