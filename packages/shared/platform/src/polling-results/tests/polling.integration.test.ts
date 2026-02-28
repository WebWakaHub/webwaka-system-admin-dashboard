/**
 * Polling & Results Module - Integration Tests
 * End-to-end workflow tests
 */

import { EventEmitter } from 'events';
import { PollService } from '../services/poll.service';
import { VotingService } from '../services/voting.service';
import { ResultsService } from '../services/results.service';

describe('Polling & Results - Integration Tests', () => {
  let pollService: PollService;
  let votingService: VotingService;
  let resultsService: ResultsService;
  let mockRepository: any;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTenant: jest.fn().mockResolvedValue([]),
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

  describe('Complete Polling Workflow', () => {
    it('should handle complete poll lifecycle', async () => {
      // Create poll
      const poll = await pollService.createPoll({
        tenantId: 'tenant-1',
        title: 'Presidential Election',
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
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        resultsVisibility: 'public',
        allowAnonymous: false,
      }, 'user-1');

      expect(poll.status).toBe('draft');

      // Activate poll
      mockRepository.findById.mockResolvedValue(poll);
      const activatedPoll = await pollService.activatePoll(poll.id!, 'tenant-1', 'user-1');
      expect(activatedPoll.status).toBe('active');

      // Cast votes
      mockRepository.findPollById.mockResolvedValue(activatedPoll);
      mockRepository.findVoteByVoterId.mockResolvedValue(null);

      await votingService.castVote(poll.id!, 'q1', {
        selectedOptions: ['opt1'],
      }, 'voter-1');

      mockRepository.findVoteByVoterId.mockResolvedValue(null);
      await votingService.castVote(poll.id!, 'q1', {
        selectedOptions: ['opt2'],
      }, 'voter-2');

      // Calculate results
      mockRepository.findVotesByQuestion.mockResolvedValue([
        { selectedOptions: ['opt1'] },
        { selectedOptions: ['opt2'] },
      ]);

      const results = await resultsService.calculateResults(poll.id!, 'q1');
      expect(results.totalVotes).toBe(2);

      // Close poll
      mockRepository.findById.mockResolvedValue(activatedPoll);
      const closedPoll = await pollService.closePoll(poll.id!, 'tenant-1', 'user-1');
      expect(closedPoll.status).toBe('closed');
    });
  });

  describe('Event-Driven Workflows', () => {
    it('should emit events throughout poll lifecycle', async () => {
      const events: string[] = [];

      eventEmitter.on('polling.poll.created', () => events.push('created'));
      eventEmitter.on('polling.poll.activated', () => events.push('activated'));
      eventEmitter.on('polling.vote.cast', () => events.push('vote_cast'));
      eventEmitter.on('polling.poll.closed', () => events.push('closed'));

      const poll = await pollService.createPoll({
        tenantId: 'tenant-1',
        title: 'Test Poll',
        pollType: 'simple',
        questions: [],
        startDate: new Date(),
        endDate: new Date(),
        resultsVisibility: 'public',
        allowAnonymous: false,
      }, 'user-1');

      mockRepository.findById.mockResolvedValue(poll);
      await pollService.activatePoll(poll.id!, 'tenant-1', 'user-1');

      const activatedPoll = { ...poll, status: 'active' };
      mockRepository.findPollById.mockResolvedValue(activatedPoll);
      mockRepository.findVoteByVoterId.mockResolvedValue(null);

      await votingService.castVote(poll.id!, 'q1', {
        selectedOptions: ['opt1'],
      }, 'voter-1');

      mockRepository.findById.mockResolvedValue(activatedPoll);
      await pollService.closePoll(poll.id!, 'tenant-1', 'user-1');

      expect(events).toEqual(['created', 'activated', 'vote_cast', 'closed']);
    });
  });

  describe('Multi-Question Polls', () => {
    it('should handle polls with multiple questions', async () => {
      const poll = await pollService.createPoll({
        tenantId: 'tenant-1',
        title: 'Multi-Question Poll',
        pollType: 'simple',
        questions: [
          {
            id: 'q1',
            pollId: '',
            text: 'Question 1',
            questionType: 'simple',
            options: [
              { id: 'opt1', questionId: 'q1', text: 'Option A', order: 1 },
              { id: 'opt2', questionId: 'q1', text: 'Option B', order: 2 },
            ],
            required: true,
            order: 1,
          },
          {
            id: 'q2',
            pollId: '',
            text: 'Question 2',
            questionType: 'simple',
            options: [
              { id: 'opt3', questionId: 'q2', text: 'Option C', order: 1 },
              { id: 'opt4', questionId: 'q2', text: 'Option D', order: 2 },
            ],
            required: true,
            order: 2,
          },
        ],
        startDate: new Date(),
        endDate: new Date(),
        resultsVisibility: 'public',
        allowAnonymous: false,
      }, 'user-1');

      expect(poll.questions).toHaveLength(2);

      mockRepository.findById.mockResolvedValue(poll);
      const activatedPoll = await pollService.activatePoll(poll.id!, 'tenant-1', 'user-1');

      // Vote on both questions
      mockRepository.findPollById.mockResolvedValue(activatedPoll);
      mockRepository.findVoteByVoterId.mockResolvedValue(null);

      await votingService.castVote(poll.id!, 'q1', {
        selectedOptions: ['opt1'],
      }, 'voter-1');

      await votingService.castVote(poll.id!, 'q2', {
        selectedOptions: ['opt3'],
      }, 'voter-1');

      expect(mockRepository.create).toHaveBeenCalledTimes(3); // 1 poll + 2 votes
    });
  });

  describe('Anonymous Voting Workflow', () => {
    it('should handle anonymous voting with IP-based duplicate prevention', async () => {
      const poll = await pollService.createPoll({
        tenantId: 'tenant-1',
        title: 'Anonymous Poll',
        pollType: 'simple',
        questions: [
          {
            id: 'q1',
            pollId: '',
            text: 'Question',
            questionType: 'simple',
            options: [
              { id: 'opt1', questionId: 'q1', text: 'Yes', order: 1 },
              { id: 'opt2', questionId: 'q1', text: 'No', order: 2 },
            ],
            required: true,
            order: 1,
          },
        ],
        startDate: new Date(),
        endDate: new Date(),
        resultsVisibility: 'public',
        allowAnonymous: true,
      }, 'user-1');

      mockRepository.findById.mockResolvedValue(poll);
      const activatedPoll = await pollService.activatePoll(poll.id!, 'tenant-1', 'user-1');

      // First anonymous vote
      mockRepository.findPollById.mockResolvedValue(activatedPoll);
      mockRepository.findVoteByIpAddress.mockResolvedValue(null);

      const vote1 = await votingService.castVote(poll.id!, 'q1', {
        selectedOptions: ['opt1'],
        ipAddress: '192.168.1.1',
      });

      expect(vote1.voterId).toBeUndefined();
      expect(vote1.ipAddress).toBe('192.168.1.1');

      // Attempt duplicate vote from same IP
      mockRepository.findVoteByIpAddress.mockResolvedValue({ id: 'existing-vote' });

      await expect(
        votingService.castVote(poll.id!, 'q1', {
          selectedOptions: ['opt2'],
          ipAddress: '192.168.1.1',
        })
      ).rejects.toThrow('Already voted in this poll');
    });
  });

  describe('Results Export Workflow', () => {
    it('should export results in multiple formats', async () => {
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
        { selectedOptions: ['opt1'] },
        { selectedOptions: ['opt2'] },
      ];

      mockRepository.findPollById.mockResolvedValue(poll);
      mockRepository.findVotesByQuestion.mockResolvedValue(votes);

      // Export as JSON
      const jsonExport = await resultsService.exportResults('poll-1', 'json');
      expect(jsonExport).toContain('Test Question');
      const parsed = JSON.parse(jsonExport);
      expect(parsed).toHaveLength(1);

      // Export as CSV
      const csvExport = await resultsService.exportResults('poll-1', 'csv');
      expect(csvExport).toContain('Question,Option,Votes,Percentage');
      expect(csvExport).toContain('Option A');
      expect(csvExport).toContain('Option B');
    });
  });

  describe('Nigerian Context Integration', () => {
    it('should handle Nigerian demographics and geography', async () => {
      const votes = [
        {
          selectedOptions: ['opt1'],
          voterMetadata: {
            demographic: '18-25',
            location: 'Lagos',
          },
        },
        {
          selectedOptions: ['opt1'],
          voterMetadata: {
            demographic: '26-35',
            location: 'Abuja',
          },
        },
        {
          selectedOptions: ['opt2'],
          voterMetadata: {
            demographic: '18-25',
            location: 'Lagos',
          },
        },
      ];

      mockRepository.findVotesByQuestion.mockResolvedValue(votes);

      const demographicResults = await resultsService.getResultsByDemographic('poll-1', 'q1');
      expect(demographicResults).toHaveLength(2);
      expect(demographicResults.find(r => r.demographic === '18-25')?.voteCount).toBe(2);

      const geographicResults = await resultsService.getResultsByGeography('poll-1', 'q1');
      expect(geographicResults).toHaveLength(2);
      expect(geographicResults.find(r => r.location === 'Lagos')?.voteCount).toBe(2);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid vote casting', async () => {
      const activePoll = {
        id: 'poll-1',
        status: 'active',
        questions: [
          {
            id: 'q1',
            options: [{ id: 'opt1' }, { id: 'opt2' }],
          },
        ],
      };

      mockRepository.findPollById.mockResolvedValue(activePoll);
      mockRepository.findVoteByVoterId.mockResolvedValue(null);

      const startTime = Date.now();

      const votePromises = Array.from({ length: 50 }, (_, i) =>
        votingService.castVote('poll-1', 'q1', {
          selectedOptions: ['opt1'],
        }, `voter-${i}`)
      );

      await Promise.all(votePromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockRepository.create).toHaveBeenCalledTimes(50);
    });
  });
});
