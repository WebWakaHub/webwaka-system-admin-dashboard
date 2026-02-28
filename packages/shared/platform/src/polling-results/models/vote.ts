export interface VoterMetadata {
  constituency?: string;
  demographic?: string;
  location?: string;
}

export class Vote {
  id?: string;
  pollId!: string;
  questionId!: string;
  voterId?: string; // Optional for anonymous voting
  selectedOptions!: string[]; // Option IDs
  ranking?: number[]; // For ranked voting
  voterMetadata?: VoterMetadata;
  timestamp: Date = new Date();
  ipAddress?: string; // For duplicate prevention

  constructor(data: Partial<Vote>) {
    Object.assign(this, data);
  }
}
