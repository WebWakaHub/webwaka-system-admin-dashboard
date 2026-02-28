import { EventEmitter } from 'events';
import { Voter } from '../models/voter';

export class VoterEngagementService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createVoter(data: any, userId: string): Promise<Voter> {
    const voter = new Voter({
      ...data,
      id: `voter-${Date.now()}`,
    });

    await this.repository.create(voter);
    return voter;
  }

  async recordEngagement(voterId: string, engagementType: string): Promise<void> {
    const voter = await this.repository.findById(voterId);
    voter.engagementScore += 10;
    voter.lastEngaged = new Date();
    await this.repository.update(voter);

    this.eventEmitter.emit('voter.engagement.recorded', {
      voterId,
      engagementType,
      score: voter.engagementScore,
    });
  }
}
