import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface FraudAlert {
  id: string;
  userId: string;
  alertType: 'transaction' | 'account' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: number;
  updatedAt: number;
}

export interface AlertNotification {
  alertId: string;
  userId: string;
  channel: 'email' | 'sms' | 'in_app';
  status: 'pending' | 'sent' | 'failed';
  timestamp: number;
}

export class FraudAlertManager {
  private eventBus: EventBus;
  private logger: Logger;
  private alerts: Map<string, FraudAlert> = new Map();
  private notifications: AlertNotification[] = [];
  private alertIdCounter: number = 0;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.transaction.scored', (event: any) => {
      if (event.data.fraudScore.riskLevel !== 'low') {
        this.createAlert(
          event.data.fraudScore.userId,
          'transaction',
          event.data.fraudScore.riskLevel,
          `Transaction fraud risk: ${event.data.fraudScore.riskLevel}`,
          event.data.fraudScore
        );
      }
    });

    this.eventBus.subscribe('fraud.account.takeover.detected', (event: any) => {
      if (event.data.riskLevel !== 'low') {
        this.createAlert(
          event.data.userId,
          'account',
          event.data.riskLevel,
          `Account takeover risk: ${event.data.riskLevel}`,
          event.data
        );
      }
    });

    this.eventBus.subscribe('fraud.behavior.analyzed', (event: any) => {
      if (event.data.deviations.length > 0) {
        this.createAlert(
          event.data.userId,
          'behavior',
          'medium',
          `Behavior deviations detected: ${event.data.deviations.length}`,
          event.data
        );
      }
    });
  }

  async createAlert(
    userId: string,
    alertType: 'transaction' | 'account' | 'behavior',
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata: Record<string, any>
  ): Promise<FraudAlert> {
    try {
      const alertId = `alert_${++this.alertIdCounter}`;
      const now = Date.now();

      const alert: FraudAlert = {
        id: alertId,
        userId,
        alertType,
        severity,
        message,
        metadata,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };

      this.alerts.set(alertId, alert);

      // Send notifications
      await this.sendNotifications(alert);

      // Publish alert created event
      this.eventBus.publish('fraud.alert.created', alert);

      this.logger.info(`Fraud alert created: ${alertId} for user ${userId}, severity: ${severity}`);

      return alert;
    } catch (error) {
      this.logger.error(`Error creating fraud alert for user ${userId}:`, error);
      throw error;
    }
  }

  private async sendNotifications(alert: FraudAlert): Promise<void> {
    try {
      // Send email notification
      const emailNotification: AlertNotification = {
        alertId: alert.id,
        userId: alert.userId,
        channel: 'email',
        status: 'pending',
        timestamp: Date.now(),
      };

      this.notifications.push(emailNotification);
      this.eventBus.publish('fraud.alert.notification.email', emailNotification);

      // Send SMS notification for high/critical severity
      if (alert.severity === 'high' || alert.severity === 'critical') {
        const smsNotification: AlertNotification = {
          alertId: alert.id,
          userId: alert.userId,
          channel: 'sms',
          status: 'pending',
          timestamp: Date.now(),
        };

        this.notifications.push(smsNotification);
        this.eventBus.publish('fraud.alert.notification.sms', smsNotification);
      }

      // Send in-app notification
      const inAppNotification: AlertNotification = {
        alertId: alert.id,
        userId: alert.userId,
        channel: 'in_app',
        status: 'pending',
        timestamp: Date.now(),
      };

      this.notifications.push(inAppNotification);
      this.eventBus.publish('fraud.alert.notification.in_app', inAppNotification);

      this.logger.info(`Notifications sent for alert ${alert.id}`);
    } catch (error) {
      this.logger.error(`Error sending notifications for alert ${alert.id}:`, error);
    }
  }

  async acknowledgeAlert(alertId: string): Promise<FraudAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.updatedAt = Date.now();

    this.eventBus.publish('fraud.alert.acknowledged', alert);
    this.logger.info(`Alert ${alertId} acknowledged`);

    return alert;
  }

  async resolveAlert(alertId: string): Promise<FraudAlert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.updatedAt = Date.now();

    this.eventBus.publish('fraud.alert.resolved', alert);
    this.logger.info(`Alert ${alertId} resolved`);

    return alert;
  }

  getAlert(alertId: string): FraudAlert | undefined {
    return this.alerts.get(alertId);
  }

  getUserAlerts(userId: string): FraudAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.userId === userId);
  }

  getOpenAlerts(userId: string): FraudAlert[] {
    return this.getUserAlerts(userId).filter((alert) => alert.status === 'open');
  }

  getAlertCount(): number {
    return this.alerts.size;
  }

  getNotificationCount(): number {
    return this.notifications.length;
  }

  getNotifications(alertId: string): AlertNotification[] {
    return this.notifications.filter((n) => n.alertId === alertId);
  }
}
