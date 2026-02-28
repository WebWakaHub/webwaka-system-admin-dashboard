import { EventEmitter } from 'events';
import { Vote } from '../models/vote';
import { Poll } from '../models/poll';

export class VotingService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async castVote(pollId: string, questionId: string, voteData: any, voterId?: string): Promise<Vote> {
    // Check if poll is active
    const poll = await this.repository.findPollById(pollId);
    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }

    // Check if already voted
    const hasVoted = await this.checkDuplicateVote(pollId, voterId, voteData.ipAddress);
    if (hasVoted) {
      throw new Error('Already voted in this poll');
    }

    const vote = new Vote({
      ...voteData,
      id: `vote-${Date.now()}-${Math.random()}`,
      pollId,
      questionId,
      voterId,
    });

    await this.repository.create(vote);
    
    this.eventEmitter.emit('polling.vote.cast', {
      pollId: vote.pollId,
      questionId: vote.questionId,
      voterId: vote.voterId,
      anonymous: !vote.voterId,
      timestamp: vote.timestamp,
    });

    // Trigger results update
    this.eventEmitter.emit('polling.results.updated', {
      pollId: vote.pollId,
      questionId: vote.questionId,
    });

    return vote;
  }

  async validateVoter(pollId: string, voterId: string): Promise<boolean> {
    const poll = await this.repository.findPollById(pollId);
    
    // If no eligibility criteria, all voters are valid
    if (!poll.eligibilityCriteria) {
      return true;
    }

    // Check voter eligibility based on criteria
    // This would integrate with voter registry in production
    return true;
  }

  async checkDuplicateVote(pollId: string, voterId?: string, ipAddress?: string): Promise<boolean> {
    if (voterId) {
      // Check by voter ID
      const existingVote = await this.repository.findVoteByVoterId(pollId, voterId);
      return !!existingVote;
    } else if (ipAddress) {
      // Check by IP address for anonymous voting
      const existingVote = await this.repository.findVoteByIpAddress(pollId, ipAddress);
      return !!existingVote;
    }
    
    return false;
  }

  async getVoterHistory(voterId: string, tenantId: string): Promise<Vote[]> {
    return await this.repository.findVotesByVoterId(voterId, tenantId);
  }
}
