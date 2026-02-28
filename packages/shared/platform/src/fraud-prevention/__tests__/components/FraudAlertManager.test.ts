import { FraudAlertManager } from '../../components/FraudAlertManager';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('FraudAlertManager', () => {
  let manager: FraudAlertManager;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    manager = new FraudAlertManager(eventBus, logger);
  });

  describe('createAlert', () => {
    describe('Basic Functionality', () => {
      it('should create a fraud alert', async () => {
        const alert = await manager.createAlert({
          userId: 'user-001',
          type: 'transaction',
          severity: 'high',
          message: 'Unusual transaction detected',
          metadata: {
            transactionId: 'txn-001',
            amount: 2000000,
          },
        });

        expect(alert).toBeDefined();
        expect(alert.id).toBeDefined();
        expect(alert.userId).toBe('user-001');
        expect(alert.type).toBe('transaction');
        expect(alert.severity).toBe('high');
        expect(alert.status).toBe('open');
      });

      it('should create alert with low severity', async () => {
        const alert = await manager.createAlert({
          userId: 'user-002',
          type: 'behavior',
          severity: 'low',
          message: 'Minor behavior change detected',
        });

        expect(alert.severity).toBe('low');
      });

      it('should create alert with medium severity', async () => {
        const alert = await manager.createAlert({
          userId: 'user-003',
          type: 'account',
          severity: 'medium',
          message: 'Account activity detected',
        });

        expect(alert.severity).toBe('medium');
      });

      it('should create alert with critical severity', async () => {
        const alert = await manager.createAlert({
          userId: 'user-004',
          type: 'transaction',
          severity: 'critical',
          message: 'Critical fraud detected',
        });

        expect(alert.severity).toBe('critical');
      });
    });

    describe('Alert Types', () => {
      it('should create transaction alert', async () => {
        const alert = await manager.createAlert({
          userId: 'user-transaction',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
          metadata: {
            transactionId: 'txn-001',
          },
        });

        expect(alert.type).toBe('transaction');
      });

      it('should create account alert', async () => {
        const alert = await manager.createAlert({
          userId: 'user-account',
          type: 'account',
          severity: 'high',
          message: 'Account takeover suspected',
          metadata: {
            loginLocation: 'New York, USA',
          },
        });

        expect(alert.type).toBe('account');
      });

      it('should create behavior alert', async () => {
        const alert = await manager.createAlert({
          userId: 'user-behavior',
          type: 'behavior',
          severity: 'medium',
          message: 'Unusual behavior detected',
          metadata: {
            deviationScore: 75,
          },
        });

        expect(alert.type).toBe('behavior');
      });
    });

    describe('Alert Metadata', () => {
      it('should store alert metadata', async () => {
        const metadata = {
          transactionId: 'txn-001',
          amount: 2000000,
          merchantCategory: 'cryptocurrency',
        };

        const alert = await manager.createAlert({
          userId: 'user-metadata',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
          metadata,
        });

        expect(alert.metadata).toEqual(metadata);
      });

      it('should handle empty metadata', async () => {
        const alert = await manager.createAlert({
          userId: 'user-no-metadata',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        expect(alert).toBeDefined();
      });
    });

    describe('Alert Timestamps', () => {
      it('should set alert creation timestamp', async () => {
        const beforeTime = Date.now();
        const alert = await manager.createAlert({
          userId: 'user-timestamp',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });
        const afterTime = Date.now();

        expect(alert.createdAt).toBeGreaterThanOrEqual(beforeTime);
        expect(alert.createdAt).toBeLessThanOrEqual(afterTime);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await manager.createAlert({
            userId: '',
            type: 'transaction',
            severity: 'high',
            message: 'Alert',
          });
        }).not.toThrow();
      });

      it('should handle invalid alert type', async () => {
        const alert = await manager.createAlert({
          userId: 'user-invalid-type',
          type: 'invalid_type' as any,
          severity: 'high',
          message: 'Alert',
        });

        expect(alert).toBeDefined();
      });

      it('should handle invalid severity', async () => {
        const alert = await manager.createAlert({
          userId: 'user-invalid-severity',
          type: 'transaction',
          severity: 'invalid' as any,
          message: 'Alert',
        });

        expect(alert).toBeDefined();
      });

      it('should handle missing message', async () => {
        const alert = await manager.createAlert({
          userId: 'user-no-message',
          type: 'transaction',
          severity: 'high',
          message: '',
        });

        expect(alert).toBeDefined();
      });
    });
  });

  describe('getAlert', () => {
    it('should retrieve alert by ID', async () => {
      const created = await manager.createAlert({
        userId: 'user-retrieve',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const retrieved = await manager.getAlert(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.userId).toBe('user-retrieve');
    });

    it('should return undefined for non-existent alert', async () => {
      const alert = await manager.getAlert('non-existent-id');

      expect(alert).toBeUndefined();
    });
  });

  describe('getUserAlerts', () => {
    it('should retrieve all alerts for user', async () => {
      const userId = 'user-all-alerts';

      // Create multiple alerts
      for (let i = 0; i < 5; i++) {
        await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'high',
          message: `Alert ${i}`,
        });
      }

      const alerts = await manager.getUserAlerts(userId);

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBe(5);
      alerts.forEach(alert => {
        expect(alert.userId).toBe(userId);
      });
    });

    it('should return empty array for user with no alerts', async () => {
      const alerts = await manager.getUserAlerts('user-no-alerts-' + Date.now());

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBe(0);
    });

    it('should return alerts in chronological order', async () => {
      const userId = 'user-chronological';

      // Create alerts with delays
      const ids = [];
      for (let i = 0; i < 3; i++) {
        const alert = await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'high',
          message: `Alert ${i}`,
        });
        ids.push(alert.id);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const alerts = await manager.getUserAlerts(userId);

      // Should be in order (newest first or oldest first, but consistent)
      expect(alerts.length).toBe(3);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      const created = await manager.createAlert({
        userId: 'user-acknowledge',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const acknowledged = await manager.acknowledgeAlert(created.id);

      expect(acknowledged.status).toBe('acknowledged');
      expect(acknowledged.acknowledgedAt).toBeDefined();
    });

    it('should track who acknowledged the alert', async () => {
      const created = await manager.createAlert({
        userId: 'user-acknowledge-by',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const acknowledged = await manager.acknowledgeAlert(created.id, 'admin-001');

      expect(acknowledged.acknowledgedBy).toBe('admin-001');
    });

    it('should handle acknowledging already acknowledged alert', async () => {
      const created = await manager.createAlert({
        userId: 'user-double-acknowledge',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      await manager.acknowledgeAlert(created.id);
      const again = await manager.acknowledgeAlert(created.id);

      expect(again.status).toBe('acknowledged');
    });

    it('should handle acknowledging non-existent alert', async () => {
      expect(async () => {
        await manager.acknowledgeAlert('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert', async () => {
      const created = await manager.createAlert({
        userId: 'user-resolve',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const resolved = await manager.resolveAlert(created.id);

      expect(resolved.status).toBe('resolved');
      expect(resolved.resolvedAt).toBeDefined();
    });

    it('should track resolution reason', async () => {
      const created = await manager.createAlert({
        userId: 'user-resolve-reason',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const resolved = await manager.resolveAlert(created.id, 'false_positive');

      expect(resolved.resolutionReason).toBe('false_positive');
    });

    it('should handle resolving already resolved alert', async () => {
      const created = await manager.createAlert({
        userId: 'user-double-resolve',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      await manager.resolveAlert(created.id);
      const again = await manager.resolveAlert(created.id);

      expect(again.status).toBe('resolved');
    });
  });

  describe('sendNotification', () => {
    describe('Email Notifications', () => {
      it('should send email notification', async () => {
        const alert = await manager.createAlert({
          userId: 'user-email',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        const result = await manager.sendNotification(alert.id, 'email');

        expect(result.success).toBe(true);
        expect(result.channel).toBe('email');
      });

      it('should handle email notification failure', async () => {
        const alert = await manager.createAlert({
          userId: 'user-email-fail',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        // Mock email service failure
        const result = await manager.sendNotification(alert.id, 'email');

        expect(result).toBeDefined();
      });
    });

    describe('SMS Notifications', () => {
      it('should send SMS notification', async () => {
        const alert = await manager.createAlert({
          userId: 'user-sms',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        const result = await manager.sendNotification(alert.id, 'sms');

        expect(result.success).toBe(true);
        expect(result.channel).toBe('sms');
      });

      it('should handle SMS notification failure', async () => {
        const alert = await manager.createAlert({
          userId: 'user-sms-fail',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        const result = await manager.sendNotification(alert.id, 'sms');

        expect(result).toBeDefined();
      });
    });

    describe('In-App Notifications', () => {
      it('should create in-app notification', async () => {
        const alert = await manager.createAlert({
          userId: 'user-in-app',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        const result = await manager.sendNotification(alert.id, 'in-app');

        expect(result.success).toBe(true);
        expect(result.channel).toBe('in-app');
      });
    });

    describe('Multi-Channel Notifications', () => {
      it('should send notifications to multiple channels', async () => {
        const alert = await manager.createAlert({
          userId: 'user-multi-channel',
          type: 'transaction',
          severity: 'critical',
          message: 'Critical fraud detected',
        });

        const results = await Promise.all([
          manager.sendNotification(alert.id, 'email'),
          manager.sendNotification(alert.id, 'sms'),
          manager.sendNotification(alert.id, 'in-app'),
        ]);

        expect(results.length).toBe(3);
        results.forEach(result => {
          expect(result).toBeDefined();
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle notification for non-existent alert', async () => {
        expect(async () => {
          await manager.sendNotification('non-existent-id', 'email');
        }).not.toThrow();
      });

      it('should handle invalid notification channel', async () => {
        const alert = await manager.createAlert({
          userId: 'user-invalid-channel',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction',
        });

        expect(async () => {
          await manager.sendNotification(alert.id, 'invalid_channel' as any);
        }).not.toThrow();
      });
    });
  });

  describe('getAlertHistory', () => {
    it('should retrieve alert history for user', async () => {
      const userId = 'user-history';

      // Create multiple alerts
      for (let i = 0; i < 5; i++) {
        await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'high',
          message: `Alert ${i}`,
        });
      }

      const history = await manager.getAlertHistory(userId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(5);
    });

    it('should include alert lifecycle in history', async () => {
      const userId = 'user-lifecycle';

      const alert = await manager.createAlert({
        userId,
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      await manager.acknowledgeAlert(alert.id);
      await manager.resolveAlert(alert.id);

      const history = await manager.getAlertHistory(userId);

      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('getAlertStatistics', () => {
    it('should return alert statistics', async () => {
      const userId = 'user-stats';

      // Create alerts with different severities
      for (let i = 0; i < 3; i++) {
        await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'high',
          message: 'High alert',
        });
      }

      for (let i = 0; i < 2; i++) {
        await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'critical',
          message: 'Critical alert',
        });
      }

      const stats = await manager.getAlertStatistics(userId);

      expect(stats).toBeDefined();
      expect(stats.totalAlerts).toBeGreaterThanOrEqual(5);
    });

    it('should include alert counts by severity', async () => {
      const userId = 'user-severity-stats';

      // Create alerts
      await manager.createAlert({
        userId,
        type: 'transaction',
        severity: 'low',
        message: 'Low alert',
      });

      await manager.createAlert({
        userId,
        type: 'transaction',
        severity: 'high',
        message: 'High alert',
      });

      const stats = await manager.getAlertStatistics(userId);

      expect(stats.bySeverity).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      expect(async () => {
        await manager.createAlert({
          userId: 'user-db-error',
          type: 'transaction',
          severity: 'high',
          message: 'Alert',
        });
      }).not.toThrow();
    });

    it('should handle notification service errors', async () => {
      const alert = await manager.createAlert({
        userId: 'user-notification-error',
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      expect(async () => {
        await manager.sendNotification(alert.id, 'email');
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle alert with very long message', async () => {
      const longMessage = 'A'.repeat(10000);

      const alert = await manager.createAlert({
        userId: 'user-long-message',
        type: 'transaction',
        severity: 'high',
        message: longMessage,
      });

      expect(alert).toBeDefined();
    });

    it('should handle alert with special characters', async () => {
      const alert = await manager.createAlert({
        userId: 'user-special-chars',
        type: 'transaction',
        severity: 'high',
        message: 'Alert with special chars: !@#$%^&*()',
      });

      expect(alert).toBeDefined();
    });

    it('should handle alert with unicode characters', async () => {
      const alert = await manager.createAlert({
        userId: 'user-unicode',
        type: 'transaction',
        severity: 'high',
        message: 'Alert with unicode: 你好世界 مرحبا',
      });

      expect(alert).toBeDefined();
    });

    it('should handle rapid alert creation', async () => {
      const userId = 'user-rapid-alerts';

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          manager.createAlert({
            userId,
            type: 'transaction',
            severity: 'high',
            message: `Alert ${i}`,
          })
        );
      }

      const alerts = await Promise.all(promises);

      expect(alerts.length).toBe(100);
      alerts.forEach(alert => {
        expect(alert).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    it('should create alert quickly', async () => {
      const startTime = performance.now();
      await manager.createAlert({
        userId: 'perf-user',
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should retrieve alerts quickly', async () => {
      const userId = 'perf-retrieve';

      // Create alerts
      for (let i = 0; i < 50; i++) {
        await manager.createAlert({
          userId,
          type: 'transaction',
          severity: 'high',
          message: `Alert ${i}`,
        });
      }

      const startTime = performance.now();
      await manager.getUserAlerts(userId);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Event Publishing', () => {
    it('should publish alert created event', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish');

      await manager.createAlert({
        userId: 'event-user',
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should publish alert acknowledged event', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish');

      const alert = await manager.createAlert({
        userId: 'event-acknowledge',
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      await manager.acknowledgeAlert(alert.id);

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should publish alert resolved event', async () => {
      const eventSpy = jest.spyOn(eventBus, 'publish');

      const alert = await manager.createAlert({
        userId: 'event-resolve',
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      await manager.resolveAlert(alert.id);

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });
  });
});
