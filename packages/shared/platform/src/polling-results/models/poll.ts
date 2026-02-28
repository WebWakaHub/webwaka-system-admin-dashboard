export interface PollQuestion {
  id: string;
  pollId: string;
  text: string;
  questionType: 'simple' | 'multiple' | 'ranked' | 'yesno';
  options: PollOption[];
  required: boolean;
  order: number;
}

export interface PollOption {
  id: string;
  questionId: string;
  text: string;
  order: number;
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  constituencies?: string[];
  demographics?: string[];
}

export class Poll {
  id?: string;
  tenantId!: string;
  title!: string;
  description?: string;
  pollType!: 'simple' | 'multiple' | 'ranked' | 'yesno';
  questions!: PollQuestion[];
  startDate!: Date;
  endDate!: Date;
  status!: 'draft' | 'active' | 'closed' | 'archived';
  eligibilityCriteria?: EligibilityCriteria;
  resultsVisibility!: 'public' | 'private' | 'after_close';
  allowAnonymous!: boolean;
  createdBy!: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Poll>) {
    Object.assign(this, data);
  }
}
