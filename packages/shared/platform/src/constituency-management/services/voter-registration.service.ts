import { EventEmitter } from 'events';
import { Voter } from '../models/voter';

export class VoterRegistrationService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async registerVoter(data: any): Promise<Voter> {
    const voter = new Voter({
      ...data,
      id: `voter-${Date.now()}`,
      status: 'active',
    });

    await this.repository.create(voter);
    
    this.eventEmitter.emit('voter.registered', {
      voterId: voter.id,
      constituencyId: voter.constituencyId,
      tenantId: voter.tenantId,
      voterIdNumber: voter.voterIdNumber,
    });

    return voter;
  }

  async getVoter(id: string, tenantId: string): Promise<Voter> {
    return await this.repository.findById(id, tenantId);
  }

  async listVotersByConstituency(constituencyId: string, tenantId: string): Promise<Voter[]> {
    return await this.repository.findByConstituency(constituencyId, tenantId);
  }

  async updateVoter(id: string, tenantId: string, data: Partial<Voter>): Promise<Voter> {
    const voter = await this.getVoter(id, tenantId);
    
    Object.assign(voter, data);
    
    await this.repository.update(voter);
    
    this.eventEmitter.emit('voter.updated', {
      voterId: voter.id,
      constituencyId: voter.constituencyId,
    });

    return voter;
  }

  async transferVoter(voterId: string, newConstituencyId: string, tenantId: string): Promise<Voter> {
    const voter = await this.getVoter(voterId, tenantId);
    const oldConstituencyId = voter.constituencyId;
    
    voter.constituencyId = newConstituencyId;
    
    await this.repository.update(voter);
    
    this.eventEmitter.emit('voter.transferred', {
      voterId: voter.id,
      fromConstituencyId: oldConstituencyId,
      toConstituencyId: newConstituencyId,
      tenantId: voter.tenantId,
    });

    return voter;
  }

  async suspendVoter(id: string, tenantId: string): Promise<Voter> {
    const voter = await this.getVoter(id, tenantId);
    voter.status = 'suspended';
    
    await this.repository.update(voter);
    
    return voter;
  }

  async getVoterHistory(voterId: string, tenantId: string): Promise<any[]> {
    return await this.repository.getVoterHistory(voterId, tenantId);
  }
}
