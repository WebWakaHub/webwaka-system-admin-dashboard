/**
 * Polling & Results Module - Unit Tests
 * Comprehensive tests for PollService, VotingService, and ResultsService
 */

import { EventEmitter } from 'events';
import { PollService } from '../services/poll.service';
import { VotingService } from '../services/voting.service';
import { ResultsService } from '../services/results.service';
import { Poll } from '../models/poll';
import { Vote } from '../models/vote';

describe('Polling & Results Module - Unit Tests', () => {
  let pollService: PollService;
  let votingService: VotingService;
  let resultsService: ResultsService;
  let mockRepository: any;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTenant: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      findPollById: jest.fn(),
      findVotesByQuestion: jest.fn(),
      findVotesByPoll: jest.fn(),
      findVoteByVoterId: jest.fn(),
      findVoteByIpAddress: jest.fn(),
      findVotesByVoterId: jest.fn(),
    };
    eventEmitter = new EventEmitter();
    pollService = new PollService(mockRepository, eventEmitter);
    votingService = new VotingService(mockRepository, eventEmitter);
    resultsService = new ResultsService(mockRepository, eventEmitter);
  });

  describe('PollService', () => {
    describe('createPoll', () => {
      it('should create a new poll', async () => {
        const pollData = {
          tenantId: 'tenant-1',
          title: 'Presidential Election Poll',
          pollType: 'simple',
          questions: [
            {
              id: 'q1',
              pollId: '',
              text: 'Who will you vote for?',
              questionType: 'simple',
              options: [
                { id: 'opt1', questionId: 'q1', text: 'Candidate A', order: 1 },
                { id: 'opt2', questionId: 'q1', text: 'Candidate B', order: 2 },
              ],
              required: true,
              order: 1,
            },
          ],
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-03-31'),
          resultsVisibility: 'public',
          allowAnonymous: false,
        };

        const poll = await pollService.createPoll(pollData, 'user-1');

        expect(poll).toBeInstanceOf(Poll);
        expect(poll.title).toBe('Presidential Election Poll');
        expect(poll.status).toBe('draft');
        expect(poll.createdBy).toBe('user-1');
        expect(mockRepository.create).toHaveBeenCalled();
      });

      it('should emit poll.created event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('polling.poll.created', eventSpy);

        await pollService.createPoll({
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          resultsVisibility: 'public',
          allowAnonymous: false,
        }, 'user-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: 'tenant-1',
            title: 'Test Poll',
            createdBy: 'user-1',
          })
        );
      });
    });

    describe('activatePoll', () => {
      it('should activate a draft poll', async () => {
        const draftPoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'draft',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(draftPoll);

        const activatedPoll = await pollService.activatePoll('poll-1', 'tenant-1', 'user-1');

        expect(activatedPoll.status).toBe('active');
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should throw error if poll is not draft', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(activePoll);

        await expect(
          pollService.activatePoll('poll-1', 'tenant-1', 'user-1')
        ).rejects.toThrow('Poll must be in draft status to activate');
      });

      it('should emit poll.activated event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('polling.poll.activated', eventSpy);

        const draftPoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'draft',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(draftPoll);

        await pollService.activatePoll('poll-1', 'tenant-1', 'user-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            pollId: 'poll-1',
            activatedBy: 'user-1',
          })
        );
      });
    });

    describe('closePoll', () => {
      it('should close an active poll', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(activePoll);

        const closedPoll = await pollService.closePoll('poll-1', 'tenant-1', 'user-1');

        expect(closedPoll.status).toBe('closed');
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should throw error if poll is not active', async () => {
        const draftPoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'draft',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(draftPoll);

        await expect(
          pollService.closePoll('poll-1', 'tenant-1', 'user-1')
        ).rejects.toThrow('Only active polls can be closed');
      });
    });

    describe('updatePoll', () => {
      it('should update draft poll', async () => {
        const draftPoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Old Title',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'draft',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(draftPoll);

        const updated = await pollService.updatePoll('poll-1', 'tenant-1', { title: 'New Title' }, 'user-1');

        expect(updated.title).toBe('New Title');
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should throw error when updating non-draft poll', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findById.mockResolvedValue(activePoll);

        await expect(
          pollService.updatePoll('poll-1', 'tenant-1', { title: 'New Title' }, 'user-1')
        ).rejects.toThrow('Cannot update poll after activation');
      });
    });
  });

  describe('VotingService', () => {
    describe('castVote', () => {
      it('should cast a vote successfully', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findPollById.mockResolvedValue(activePoll);
        mockRepository.findVoteByVoterId.mockResolvedValue(null);

        const vote = await votingService.castVote('poll-1', 'q1', {
          selectedOptions: ['opt1'],
          ipAddress: '192.168.1.1',
        }, 'voter-1');

        expect(vote).toBeInstanceOf(Vote);
        expect(vote.pollId).toBe('poll-1');
        expect(vote.questionId).toBe('q1');
        expect(vote.voterId).toBe('voter-1');
        expect(mockRepository.create).toHaveBeenCalled();
      });

      it('should emit vote.cast event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('polling.vote.cast', eventSpy);

        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findPollById.mockResolvedValue(activePoll);
        mockRepository.findVoteByVoterId.mockResolvedValue(null);

        await votingService.castVote('poll-1', 'q1', {
          selectedOptions: ['opt1'],
        }, 'voter-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            pollId: 'poll-1',
            voterId: 'voter-1',
            anonymous: false,
          })
        );
      });

      it('should throw error if poll is not active', async () => {
        const draftPoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'draft',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findPollById.mockResolvedValue(draftPoll);

        await expect(
          votingService.castVote('poll-1', 'q1', { selectedOptions: ['opt1'] }, 'voter-1')
        ).rejects.toThrow('Poll is not active');
      });

      it('should prevent duplicate voting', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: false,
          createdBy: 'user-1',
        });

        mockRepository.findPollById.mockResolvedValue(activePoll);
        mockRepository.findVoteByVoterId.mockResolvedValue({ id: 'existing-vote' });

        await expect(
          votingService.castVote('poll-1', 'q1', { selectedOptions: ['opt1'] }, 'voter-1')
        ).rejects.toThrow('Already voted in this poll');
      });

      it('should support anonymous voting', async () => {
        const activePoll = new Poll({
          id: 'poll-1',
          tenantId: 'tenant-1',
          title: 'Test Poll',
          pollType: 'simple',
          questions: [],
          startDate: new Date(),
          endDate: new Date(),
          status: 'active',
          resultsVisibility: 'public',
          allowAnonymous: true,
          createdBy: 'user-1',
        });

        mockRepository.findPollById.mockResolvedValue(activePoll);
        mockRepository.findVoteByIpAddress.mockResolvedValue(null);

        const vote = await votingService.castVote('poll-1', 'q1', {
          selectedOptions: ['opt1'],
          ipAddress: '192.168.1.1',
        });

        expect(vote.voterId).toBeUndefined();
        expect(vote.ipAddress).toBe('192.168.1.1');
      });
    });

    describe('checkDuplicateVote', () => {
      it('should detect duplicate vote by voter ID', async () => {
        mockRepository.findVoteByVoterId.mockResolvedValue({ id: 'existing-vote' });

        const isDuplicate = await votingService.checkDuplicateVote('poll-1', 'voter-1');

        expect(isDuplicate).toBe(true);
      });

      it('should detect duplicate vote by IP address', async () => {
        mockRepository.findVoteByIpAddress.mockResolvedValue({ id: 'existing-vote' });

        const isDuplicate = await votingService.checkDuplicateVote('poll-1', undefined, '192.168.1.1');

        expect(isDuplicate).toBe(true);
      });

      it('should return false for new voter', async () => {
        mockRepository.findVoteByVoterId.mockResolvedValue(null);

        const isDuplicate = await votingService.checkDuplicateVote('poll-1', 'voter-1');

        expect(isDuplicate).toBe(false);
      });
    });
  });

  describe('ResultsService', () => {
    describe('calculateResults', () => {
      it('should calculate poll results correctly', async () => {
        const poll = {
          id: 'poll-1',
          questions: [
            {
              id: 'q1',
              text: 'Who will you vote for?',
              options: [
                { id: 'opt1', text: 'Candidate A' },
                { id: 'opt2', text: 'Candidate B' },
              ],
            },
          ],
        };

        const votes = [
          { selectedOptions: ['opt1'] },
          { selectedOptions: ['opt1'] },
          { selectedOptions: ['opt2'] },
        ];

        mockRepository.findPollById.mockResolvedValue(poll);
        mockRepository.findVotesByQuestion.mockResolvedValue(votes);

        const results = await resultsService.calculateResults('poll-1', 'q1');

        expect(results.totalVotes).toBe(3);
        expect(results.optionResults).toHaveLength(2);
        expect(results.optionResults[0].voteCount).toBe(2);
        expect(results.optionResults[0].percentage).toBeCloseTo(66.67, 1);
        expect(results.optionResults[1].voteCount).toBe(1);
        expect(results.optionResults[1].percentage).toBeCloseTo(33.33, 1);
      });

      it('should handle zero votes', async () => {
        const poll = {
          id: 'poll-1',
          questions: [
            {
              id: 'q1',
              text: 'Test Question',
              options: [
                { id: 'opt1', text: 'Option A' },
                { id: 'opt2', text: 'Option B' },
              ],
            },
          ],
        };

        mockRepository.findPollById.mockResolvedValue(poll);
        mockRepository.findVotesByQuestion.mockResolvedValue([]);

        const results = await resultsService.calculateResults('poll-1', 'q1');

        expect(results.totalVotes).toBe(0);
        expect(results.optionResults[0].percentage).toBe(0);
      });
    });

    describe('exportResults', () => {
      it('should export results as JSON', async () => {
        const poll = {
          id: 'poll-1',
          questions: [
            {
              id: 'q1',
              text: 'Test Question',
              options: [
                { id: 'opt1', text: 'Option A' },
                { id: 'opt2', text: 'Option B' },
              ],
            },
          ],
        };

        const votes = [
          { selectedOptions: ['opt1'] },
          { selectedOptions: ['opt2'] },
        ];

        mockRepository.findPollById.mockResolvedValue(poll);
        mockRepository.findVotesByQuestion.mockResolvedValue(votes);

        const exported = await resultsService.exportResults('poll-1', 'json');

        expect(typeof exported).toBe('string');
        const parsed = JSON.parse(exported);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].question).toBe('Test Question');
      });

      it('should export results as CSV', async () => {
        const poll = {
          id: 'poll-1',
          questions: [
            {
              id: 'q1',
              text: 'Test Question',
              options: [
                { id: 'opt1', text: 'Option A' },
                { id: 'opt2', text: 'Option B' },
              ],
            },
          ],
        };

        const votes = [
          { selectedOptions: ['opt1'] },
          { selectedOptions: ['opt2'] },
        ];

        mockRepository.findPollById.mockResolvedValue(poll);
        mockRepository.findVotesByQuestion.mockResolvedValue(votes);

        const exported = await resultsService.exportResults('poll-1', 'csv');

        expect(typeof exported).toBe('string');
        expect(exported).toContain('Question,Option,Votes,Percentage');
        expect(exported).toContain('Test Question');
        expect(exported).toContain('Option A');
        expect(exported).toContain('Option B');
      });
    });
  });
});
