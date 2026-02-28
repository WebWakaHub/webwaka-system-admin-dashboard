export interface OptionResult {
  optionId: string;
  optionText: string;
  voteCount: number;
  percentage: number;
  ranking?: number;
}

export interface DemographicResult {
  demographic: string;
  voteCount: number;
  percentage: number;
}

export interface GeographicResult {
  location: string;
  voteCount: number;
  percentage: number;
}

export class PollResults {
  id?: string;
  pollId!: string;
  questionId!: string;
  totalVotes!: number;
  optionResults!: OptionResult[];
  turnoutRate?: number;
  demographicBreakdown?: DemographicResult[];
  geographicBreakdown?: GeographicResult[];
  lastUpdated: Date = new Date();

  constructor(data: Partial<PollResults>) {
    Object.assign(this, data);
  }
}
