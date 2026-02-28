import { EventEmitter } from 'events';
import { Poll } from '../models/poll';

export class PollService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createPoll(data: any, userId: string): Promise<Poll> {
    const poll = new Poll({
      ...data,
      id: `poll-${Date.now()}`,
      status: 'draft',
      createdBy: userId,
    });

    await this.repository.create(poll);
    
    this.eventEmitter.emit('polling.poll.created', {
      pollId: poll.id,
      tenantId: poll.tenantId,
      title: poll.title,
      startDate: poll.startDate,
      endDate: poll.endDate,
      createdBy: userId,
    });

    return poll;
  }

  async getPoll(id: string, tenantId: string): Promise<Poll> {
    return await this.repository.findById(id, tenantId);
  }

  async listPolls(tenantId: string, filters?: any): Promise<Poll[]> {
    return await this.repository.findByTenant(tenantId, filters);
  }

  async updatePoll(id: string, tenantId: string, data: Partial<Poll>, userId: string): Promise<Poll> {
    const poll = await this.getPoll(id, tenantId);
    
    // Can only update draft polls
    if (poll.status !== 'draft') {
      throw new Error('Cannot update poll after activation');
    }

    Object.assign(poll, data);
    poll.updatedAt = new Date();
    
    await this.repository.update(poll);
    
    this.eventEmitter.emit('polling.poll.updated', {
      pollId: poll.id,
      updatedBy: userId,
    });

    return poll;
  }

  async activatePoll(id: string, tenantId: string, userId: string): Promise<Poll> {
    const poll = await this.getPoll(id, tenantId);
    
    if (poll.status !== 'draft') {
      throw new Error('Poll must be in draft status to activate');
    }

    poll.status = 'active';
    poll.updatedAt = new Date();
    
    await this.repository.update(poll);
    
    this.eventEmitter.emit('polling.poll.activated', {
      pollId: poll.id,
      tenantId: poll.tenantId,
      activatedBy: userId,
    });

    return poll;
  }

  async closePoll(id: string, tenantId: string, userId: string): Promise<Poll> {
    const poll = await this.getPoll(id, tenantId);
    
    if (poll.status !== 'active') {
      throw new Error('Only active polls can be closed');
    }

    poll.status = 'closed';
    poll.updatedAt = new Date();
    
    await this.repository.update(poll);
    
    this.eventEmitter.emit('polling.poll.closed', {
      pollId: poll.id,
      tenantId: poll.tenantId,
      closedBy: userId,
    });

    return poll;
  }

  async deletePoll(id: string, tenantId: string, userId: string): Promise<void> {
    const poll = await this.getPoll(id, tenantId);
    
    // Can only delete draft polls
    if (poll.status !== 'draft') {
      throw new Error('Can only delete draft polls');
    }

    await this.repository.delete(id, tenantId);
    
    this.eventEmitter.emit('polling.poll.deleted', {
      pollId: id,
      deletedBy: userId,
    });
  }
}
