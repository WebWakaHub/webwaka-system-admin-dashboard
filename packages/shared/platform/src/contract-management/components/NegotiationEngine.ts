import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ContractChange {
  id: string;
  contractId: string;
  proposedBy: string;
  changeType: 'addition' | 'modification' | 'deletion';
  section: string;
  originalContent: string;
  proposedContent: string;
  reason: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'pending';
  comments: ChangeComment[];
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ChangeComment {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface NegotiationSession {
  id: string;
  contractId: string;
  status: 'active' | 'completed' | 'abandoned';
  changes: ContractChange[];
  participants: string[];
  startedAt: Date;
  completedAt?: Date;
}

export class NegotiationEngine extends EventEmitter {
  private changes: Map<string, ContractChange> = new Map();
  private sessions: Map<string, NegotiationSession> = new Map();
  private contractSessions: Map<string, NegotiationSession[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Start negotiation session
   */
  async startSession(
    contractId: string,
    participants: string[]
  ): Promise<NegotiationSession> {
    const session: NegotiationSession = {
      id: uuidv4(),
      contractId,
      status: 'active',
      changes: [],
      participants,
      startedAt: new Date()
    };

    this.sessions.set(session.id, session);
    const sessions = this.contractSessions.get(contractId) || [];
    sessions.push(session);
    this.contractSessions.set(contractId, sessions);

    this.emit('negotiation:started', session);

    return session;
  }

  /**
   * Propose change
   */
  async proposeChange(
    contractId: string,
    sessionId: string,
    data: Partial<ContractChange>,
    userId: string
  ): Promise<ContractChange> {
    const session = this.sessions.get(sessionId);
    if (!session || session.contractId !== contractId) {
      throw new Error('Session not found');
    }

    const change: ContractChange = {
      id: uuidv4(),
      contractId,
      proposedBy: userId,
      changeType: data.changeType || 'modification',
      section: data.section || '',
      originalContent: data.originalContent || '',
      proposedContent: data.proposedContent || '',
      reason: data.reason || '',
      status: 'proposed',
      comments: [],
      createdAt: new Date()
    };

    this.changes.set(change.id, change);
    session.changes.push(change);

    this.emit('change:proposed', change);

    return change;
  }

  /**
   * Accept change
   */
  async acceptChange(
    changeId: string,
    userId: string
  ): Promise<ContractChange> {
    const change = this.changes.get(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    change.status = 'accepted';
    change.resolvedAt = new Date();
    this.changes.set(changeId, change);

    this.emit('change:accepted', change);

    return change;
  }

  /**
   * Reject change
   */
  async rejectChange(
    changeId: string,
    userId: string,
    reason: string
  ): Promise<ContractChange> {
    const change = this.changes.get(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    change.status = 'rejected';
    change.resolvedAt = new Date();
    this.changes.set(changeId, change);

    this.emit('change:rejected', { change, reason });

    return change;
  }

  /**
   * Add comment to change
   */
  async addComment(
    changeId: string,
    author: string,
    text: string
  ): Promise<ContractChange> {
    const change = this.changes.get(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    const comment: ChangeComment = {
      id: uuidv4(),
      author,
      text,
      createdAt: new Date()
    };

    change.comments.push(comment);
    this.changes.set(changeId, change);

    this.emit('comment:added', { change, comment });

    return change;
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<NegotiationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get contract sessions
   */
  async getContractSessions(contractId: string): Promise<NegotiationSession[]> {
    return this.contractSessions.get(contractId) || [];
  }

  /**
   * Complete session
   */
  async completeSession(sessionId: string): Promise<NegotiationSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.completedAt = new Date();
    this.sessions.set(sessionId, session);

    this.emit('negotiation:completed', session);

    return session;
  }

  /**
   * Get pending changes
   */
  async getPendingChanges(contractId: string): Promise<ContractChange[]> {
    const sessions = this.contractSessions.get(contractId) || [];
    const pendingChanges: ContractChange[] = [];

    for (const session of sessions) {
      for (const change of session.changes) {
        if (change.status === 'proposed') {
          pendingChanges.push(change);
        }
      }
    }

    return pendingChanges;
  }

  /**
   * Get negotiation history
   */
  async getNegotiationHistory(contractId: string): Promise<ContractChange[]> {
    const sessions = this.contractSessions.get(contractId) || [];
    const history: ContractChange[] = [];

    for (const session of sessions) {
      history.push(...session.changes);
    }

    return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
