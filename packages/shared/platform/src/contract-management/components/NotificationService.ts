import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  recipientId: string;
  type: 'contract_created' | 'contract_signed' | 'contract_executed' | 'renewal_reminder' | 'compliance_alert' | 'milestone_due' | 'contract_expired';
  title: string;
  message: string;
  contractId?: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  channels: NotificationChannel[];
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface NotificationTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}

export class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<string, Notification[]> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default notification templates
   */
  private initializeDefaultTemplates(): void {
    this.templates.set('contract_created', {
      id: 'tpl-001',
      type: 'contract_created',
      subject: 'New Contract Created: {{contractTitle}}',
      body: 'A new contract "{{contractTitle}}" has been created by {{createdBy}}. Please review and sign.',
      variables: ['contractTitle', 'createdBy']
    });

    this.templates.set('contract_signed', {
      id: 'tpl-002',
      type: 'contract_signed',
      subject: 'Contract Signed: {{contractTitle}}',
      body: 'Contract "{{contractTitle}}" has been signed by {{signedBy}}.',
      variables: ['contractTitle', 'signedBy']
    });

    this.templates.set('renewal_reminder', {
      id: 'tpl-003',
      type: 'renewal_reminder',
      subject: 'Contract Renewal Reminder: {{contractTitle}}',
      body: 'Contract "{{contractTitle}}" will expire in {{daysUntilExpiration}} days. Please renew if needed.',
      variables: ['contractTitle', 'daysUntilExpiration']
    });

    this.templates.set('compliance_alert', {
      id: 'tpl-004',
      type: 'compliance_alert',
      subject: 'Compliance Alert: {{contractTitle}}',
      body: 'Contract "{{contractTitle}}" has a {{severity}} compliance violation: {{violation}}',
      variables: ['contractTitle', 'severity', 'violation']
    });
  }

  /**
   * Send notification
   */
  async sendNotification(
    recipientId: string,
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      contractId?: string;
      data?: Record<string, any>;
      channels?: NotificationChannel[];
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      recipientId,
      type,
      title,
      message,
      contractId: options?.contractId,
      data: options?.data || {},
      read: false,
      createdAt: new Date(),
      channels: options?.channels || ['email', 'in_app']
    };

    this.notifications.set(notification.id, notification);
    const userNotifications = this.userNotifications.get(recipientId) || [];
    userNotifications.push(notification);
    this.userNotifications.set(recipientId, userNotifications);

    this.emit('notification:sent', notification);

    // Send through channels
    for (const channel of notification.channels) {
      await this.sendThroughChannel(notification, channel);
    }

    return notification;
  }

  /**
   * Send through channel
   */
  private async sendThroughChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel) {
      case 'email':
        this.emit('email:send', {
          to: notification.recipientId,
          subject: notification.title,
          body: notification.message
        });
        break;
      case 'sms':
        this.emit('sms:send', {
          to: notification.recipientId,
          message: notification.message
        });
        break;
      case 'push':
        this.emit('push:send', {
          userId: notification.recipientId,
          title: notification.title,
          body: notification.message
        });
        break;
      case 'in_app':
        // In-app notification is stored in the database
        break;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    filters?: {
      read?: boolean;
      type?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ notifications: Notification[]; total: number }> {
    let notifications = this.userNotifications.get(userId) || [];

    if (filters?.read !== undefined) {
      notifications = notifications.filter(n => n.read === filters.read);
    }

    if (filters?.type) {
      notifications = notifications.filter(n => n.type === filters.type);
    }

    const total = notifications.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      notifications: notifications.slice(offset, offset + limit),
      total
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);

    this.emit('notification:read', notification);

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = this.userNotifications.get(userId) || [];
    for (const notification of notifications) {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        this.notifications.set(notification.id, notification);
      }
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);
    this.emit('notification:deleted', notificationId);
  }

  /**
   * Send contract created notification
   */
  async notifyContractCreated(
    contractId: string,
    contractTitle: string,
    parties: any[]
  ): Promise<void> {
    for (const party of parties) {
      await this.sendNotification(
        party.id,
        'contract_created',
        `New Contract: ${contractTitle}`,
        `A new contract "${contractTitle}" has been created. Please review and sign.`,
        {
          contractId,
          data: { contractTitle }
        }
      );
    }
  }

  /**
   * Send contract signed notification
   */
  async notifyContractSigned(
    contractId: string,
    contractTitle: string,
    signerName: string,
    parties: any[]
  ): Promise<void> {
    for (const party of parties) {
      await this.sendNotification(
        party.id,
        'contract_signed',
        `Contract Signed: ${contractTitle}`,
        `Contract "${contractTitle}" has been signed by ${signerName}.`,
        {
          contractId,
          data: { contractTitle, signerName }
        }
      );
    }
  }

  /**
   * Send renewal reminder
   */
  async sendRenewalReminder(
    contractId: string,
    contractTitle: string,
    daysUntilExpiration: number,
    recipientId: string
  ): Promise<void> {
    await this.sendNotification(
      recipientId,
      'renewal_reminder',
      `Renewal Reminder: ${contractTitle}`,
      `Contract "${contractTitle}" will expire in ${daysUntilExpiration} days.`,
      {
        contractId,
        data: { contractTitle, daysUntilExpiration },
        channels: ['email', 'sms', 'in_app']
      }
    );
  }

  /**
   * Send compliance alert
   */
  async sendComplianceAlert(
    contractId: string,
    contractTitle: string,
    violation: string,
    severity: string,
    recipientId: string
  ): Promise<void> {
    await this.sendNotification(
      recipientId,
      'compliance_alert',
      `Compliance Alert: ${contractTitle}`,
      `Contract "${contractTitle}" has a ${severity} compliance violation: ${violation}`,
      {
        contractId,
        data: { contractTitle, violation, severity },
        channels: ['email', 'push', 'in_app']
      }
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = this.userNotifications.get(userId) || [];
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Get notification template
   */
  async getTemplate(type: string): Promise<NotificationTemplate | null> {
    return this.templates.get(type) || null;
  }

  /**
   * Render template
   */
  async renderTemplate(
    type: string,
    variables: Record<string, any>
  ): Promise<{ subject: string; body: string }> {
    const template = await this.getTemplate(type);
    if (!template) {
      throw new Error('Template not found');
    }

    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return { subject, body };
  }
}
