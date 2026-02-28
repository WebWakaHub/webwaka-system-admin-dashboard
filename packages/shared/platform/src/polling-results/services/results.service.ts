import { EventEmitter } from 'events';
import { PollResults, OptionResult, DemographicResult, GeographicResult } from '../models/poll-results';

export class ResultsService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async calculateResults(pollId: string, questionId: string): Promise<PollResults> {
    const votes = await this.repository.findVotesByQuestion(pollId, questionId);
    const poll = await this.repository.findPollById(pollId);
    const question = poll.questions.find((q: any) => q.id === questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    const totalVotes = votes.length;
    const optionCounts: { [key: string]: number } = {};

    // Count votes for each option
    votes.forEach((vote: any) => {
      vote.selectedOptions.forEach((optionId: string) => {
        optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
      });
    });

    // Calculate option results
    const optionResults: OptionResult[] = question.options.map((option: any) => ({
      optionId: option.id,
      optionText: option.text,
      voteCount: optionCounts[option.id] || 0,
      percentage: totalVotes > 0 ? ((optionCounts[option.id] || 0) / totalVotes) * 100 : 0,
    }));

    const results = new PollResults({
      id: `results-${pollId}-${questionId}`,
      pollId,
      questionId,
      totalVotes,
      optionResults,
    });

    return results;
  }

  async getResultsByDemographic(pollId: string, questionId: string): Promise<DemographicResult[]> {
    const votes = await this.repository.findVotesByQuestion(pollId, questionId);
    
    const demographicCounts: { [key: string]: number } = {};
    
    votes.forEach((vote: any) => {
      const demographic = vote.voterMetadata?.demographic || 'unknown';
      demographicCounts[demographic] = (demographicCounts[demographic] || 0) + 1;
    });

    const totalVotes = votes.length;
    
    return Object.entries(demographicCounts).map(([demographic, count]) => ({
      demographic,
      voteCount: count,
      percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0,
    }));
  }

  async getResultsByGeography(pollId: string, questionId: string): Promise<GeographicResult[]> {
    const votes = await this.repository.findVotesByQuestion(pollId, questionId);
    
    const geographicCounts: { [key: string]: number } = {};
    
    votes.forEach((vote: any) => {
      const location = vote.voterMetadata?.location || 'unknown';
      geographicCounts[location] = (geographicCounts[location] || 0) + 1;
    });

    const totalVotes = votes.length;
    
    return Object.entries(geographicCounts).map(([location, count]) => ({
      location,
      voteCount: count,
      percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0,
    }));
  }

  async getTurnoutRate(pollId: string): Promise<number> {
    const poll = await this.repository.findPollById(pollId);
    const votes = await this.repository.findVotesByPoll(pollId);
    
    // In production, this would compare against eligible voter count
    const eligibleVoters = 1000; // Placeholder
    const actualVotes = new Set(votes.map((v: any) => v.voterId || v.ipAddress)).size;
    
    return eligibleVoters > 0 ? (actualVotes / eligibleVoters) * 100 : 0;
  }

  async exportResults(pollId: string, format: 'csv' | 'json'): Promise<string> {
    const poll = await this.repository.findPollById(pollId);
    const allResults: any[] = [];

    for (const question of poll.questions) {
      const results = await this.calculateResults(pollId, question.id);
      allResults.push({
        question: question.text,
        results: results.optionResults,
      });
    }

    if (format === 'json') {
      return JSON.stringify(allResults, null, 2);
    } else {
      // CSV format
      let csv = 'Question,Option,Votes,Percentage\n';
      allResults.forEach((result) => {
        result.results.forEach((option: OptionResult) => {
          csv += `"${result.question}","${option.optionText}",${option.voteCount},${option.percentage.toFixed(2)}\n`;
        });
      });
      return csv;
    }
  }
}
