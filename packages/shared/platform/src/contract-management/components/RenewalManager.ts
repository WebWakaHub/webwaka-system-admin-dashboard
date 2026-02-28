import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface RenewalRequest {
  id: string;
  contractId: string;
  requestedBy: string;
  requestedAt: Date;
  proposedTerms: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: Date;
  completedAt?: Date;
  notes: string;
}

export interface RenewalNotification {
  id: string;
  contractId: string;
  recipientId: string;
  daysUntilExpiration: number;
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export class RenewalManager extends EventEmitter {
  private renewalRequests: Map<string, RenewalRequest> = new Map();
  private renewalNotifications: Map<string, RenewalNotification> = new Map();
  private contractRenewals: Map<string, RenewalRequest[]> = new Map();
  private contractNotifications: Map<string, RenewalNotification[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Create renewal request
   */
  async createRenewalRequest(
    contractId: string,
    requestedBy: string,
    proposedTerms: Record<string, any>,
    notes?: string
  ): Promise<RenewalRequest> {
    const request: RenewalRequest = {
      id: uuidv4(),
      contractId,
      requestedBy,
      requestedAt: new Date(),
      proposedTerms,
      status: 'pending',
      notes: notes || ''
    };

    this.renewalRequests.set(request.id, request);
    const renewals = this.contractRenewals.get(contractId) || [];
    renewals.push(request);
    this.contractRenewals.set(contractId, renewals);

    this.emit('renewal:requested', request);

    return request;
  }

  /**
   * Approve renewal request
   */
  async approveRenewalRequest(
    requestId: string,
    approvedBy: string
  ): Promise<RenewalRequest> {
    const request = this.renewalRequests.get(requestId);
    if (!request) {
      throw new Error('Renewal request not found');
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    this.renewalRequests.set(requestId, request);
    this.emit('renewal:approved', request);

    return request;
  }

  /**
   * Reject renewal request
   */
  async rejectRenewalRequest(
    requestId: string,
    notes: string
  ): Promise<RenewalRequest> {
    const request = this.renewalRequests.get(requestId);
    if (!request) {
      throw new Error('Renewal request not found');
    }

    request.status = 'rejected';
    request.notes = notes;

    this.renewalRequests.set(requestId, request);
    this.emit('renewal:rejected', request);

    return request;
  }

  /**
   * Complete renewal
   */
  async completeRenewal(requestId: string): Promise<RenewalRequest> {
    const request = this.renewalRequests.get(requestId);
    if (!request) {
      throw new Error('Renewal request not found');
    }

    if (request.status !== 'approved') {
      throw new Error('Only approved requests can be completed');
    }

    request.status = 'completed';
    request.completedAt = new Date();

    this.renewalRequests.set(requestId, request);
    this.emit('renewal:completed', request);

    return request;
  }

  /**
   * Get contract renewal requests
   */
  async getContractRenewalRequests(contractId: string): Promise<RenewalRequest[]> {
    return this.contractRenewals.get(contractId) || [];
  }

  /**
   * Send renewal notification
   */
  async sendRenewalNotification(
    contractId: string,
    recipientId: string,
    daysUntilExpiration: number
  ): Promise<RenewalNotification> {
    const notification: RenewalNotification = {
      id: uuidv4(),
      contractId,
      recipientId,
      daysUntilExpiration,
      sentAt: new Date(),
      acknowledged: false
    };

    this.renewalNotifications.set(notification.id, notification);
    const notifications = this.contractNotifications.get(contractId) || [];
    notifications.push(notification);
    this.contractNotifications.set(contractId, notifications);

    this.emit('renewal:notified', notification);

    return notification;
  }

  /**
   * Acknowledge renewal notification
   */
  async acknowledgeRenewalNotification(
    notificationId: string
  ): Promise<RenewalNotification> {
    const notification = this.renewalNotifications.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.acknowledged = true;
    notification.acknowledgedAt = new Date();

    this.renewalNotifications.set(notificationId, notification);
    this.emit('renewal:acknowledged', notification);

    return notification;
  }

  /**
   * Get contract renewal notifications
   */
  async getContractRenewalNotifications(contractId: string): Promise<RenewalNotification[]> {
    return this.contractNotifications.get(contractId) || [];
  }

  /**
   * Get pending renewal requests
   */
  async getPendingRenewalRequests(contractId: string): Promise<RenewalRequest[]> {
    const renewals = await this.getContractRenewalRequests(contractId);
    return renewals.filter(r => r.status === 'pending');
  }

  /**
   * Get renewal status
   */
  async getRenewalStatus(contractId: string): Promise<{
    pendingRequests: number;
    approvedRequests: number;
    completedRenewals: number;
    unacknowledgedNotifications: number;
  }> {
    const requests = await this.getContractRenewalRequests(contractId);
    const notifications = await this.getContractRenewalNotifications(contractId);

    return {
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      completedRenewals: requests.filter(r => r.status === 'completed').length,
      unacknowledgedNotifications: notifications.filter(n => !n.acknowledged).length
    };
  }

  /**
   * Auto-renew contract
   */
  async autoRenewContract(
    contractId: string,
    renewalTerms: Record<string, any>
  ): Promise<RenewalRequest> {
    const request: RenewalRequest = {
      id: uuidv4(),
      contractId,
      requestedBy: 'system',
      requestedAt: new Date(),
      proposedTerms: renewalTerms,
      status: 'completed',
      approvedBy: 'system',
      approvedAt: new Date(),
      completedAt: new Date(),
      notes: 'Auto-renewal'
    };

    this.renewalRequests.set(request.id, request);
    const renewals = this.contractRenewals.get(contractId) || [];
    renewals.push(request);
    this.contractRenewals.set(contractId, renewals);

    this.emit('renewal:auto', request);

    return request;
  }
}
