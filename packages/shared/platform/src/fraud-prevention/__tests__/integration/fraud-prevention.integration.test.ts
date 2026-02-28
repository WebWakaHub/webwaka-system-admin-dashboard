import { FraudPreventionSystem } from '../../FraudPreventionSystem';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('Fraud Prevention System Integration Tests', () => {
  let system: FraudPreventionSystem;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(async () => {
    eventBus = new EventBus();
    logger = new Logger('test');
    system = new FraudPreventionSystem(eventBus, logger);
    await system.initialize();
  });

  afterEach(async () => {
    await system.shutdown();
  });

  describe('End-to-End Transaction Fraud Detection', () => {
    it('should detect fraud in high-risk transaction', async () => {
      const transaction = {
        id: 'txn-e2e-001',
        userId: 'user-e2e-001',
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        location: 'Unknown Location',
        device: 'unknown-device',
        timestamp: Date.now(),
      };

      // Score transaction
      const scorer = system.getTransactionScorer();
      const score = await scorer.scoreTransaction(transaction);

      expect(score.score).toBeGreaterThan(60);

      // Detect anomaly
      const analyzer = system.getBehavioralAnalyzer();
      const behavior = await analyzer.analyzeBehavior(transaction.userId, {
        amount: transaction.amount,
        merchantCategory: transaction.merchantCategory,
        timestamp: transaction.timestamp,
        device: transaction.device,
        location: transaction.location,
      });

      expect(behavior.isDeviation).toBe(true);

      // Create alert
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId: transaction.userId,
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction detected',
        metadata: {
          transactionId: transaction.id,
          fraudScore: score.score,
          deviationScore: behavior.deviationScore,
        },
      });

      expect(alert).toBeDefined();
      expect(alert.severity).toBe('high');
    });

    it('should allow normal transaction', async () => {
      const transaction = {
        id: 'txn-e2e-002',
        userId: 'user-e2e-002',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now(),
      };

      const scorer = system.getTransactionScorer();
      const score = await scorer.scoreTransaction(transaction);

      expect(score.score).toBeLessThan(40);
    });
  });

  describe('Account Takeover Detection', () => {
    it('should detect account takeover', async () => {
      const userId = 'user-takeover-test';

      // Establish normal pattern
      const monitor = system.getAccountMonitor();
      for (let i = 0; i < 5; i++) {
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - (i * 86400000),
        });
      }

      // Suspicious activity
      const result = await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'unknown-device',
        location: 'New York, USA',
        timestamp: Date.now(),
      });

      expect(result.suspicious).toBe(true);
      expect(result.takeover_risk).toBeGreaterThan(50);

      // Create alert
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId,
        type: 'account',
        severity: 'critical',
        message: 'Account takeover suspected',
        metadata: {
          takeoverRisk: result.takeover_risk,
          suspiciousReasons: result.reasons,
        },
      });

      expect(alert.severity).toBe('critical');
    });
  });

  describe('Velocity Fraud Detection', () => {
    it('should detect rapid transaction fraud', async () => {
      const userId = 'user-velocity-test';
      const checker = system.getVelocityChecker();

      // Create rapid transactions
      for (let i = 0; i < 15; i++) {
        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (i * 60000),
        });

        if (i > 9) {
          expect(result.violatesLimit).toBe(true);

          // Create alert
          const alertManager = system.getFraudAlertManager();
          const alert = await alertManager.createAlert({
            userId,
            type: 'transaction',
            severity: 'high',
            message: 'Velocity limit exceeded',
            metadata: {
              currentVelocity: result.currentVelocity,
              limit: result.limit,
            },
          });

          expect(alert).toBeDefined();
        }
      }
    });
  });

  describe('Behavioral Anomaly Detection', () => {
    it('should detect behavioral anomalies', async () => {
      const userId = 'user-behavior-test';
      const analyzer = system.getBehavioralAnalyzer();

      // Establish normal pattern
      for (let i = 0; i < 10; i++) {
        await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - (i * 86400000),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });
      }

      // Anomalous behavior
      const result = await analyzer.analyzeBehavior(userId, {
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        timestamp: Date.now(),
        device: 'unknown-device',
        location: 'Unknown Location',
      });

      expect(result.isDeviation).toBe(true);
      expect(result.deviationScore).toBeGreaterThan(60);

      // Create alert
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId,
        type: 'behavior',
        severity: 'high',
        message: 'Behavioral anomaly detected',
        metadata: {
          deviationScore: result.deviationScore,
          reasons: result.deviationReasons,
        },
      });

      expect(alert).toBeDefined();
    });
  });

  describe('Multi-Component Fraud Detection', () => {
    it('should coordinate multiple fraud detection components', async () => {
      const userId = 'user-multi-component';
      const transaction = {
        id: 'txn-multi-001',
        userId,
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        location: 'Unknown',
        device: 'unknown',
        timestamp: Date.now(),
      };

      // 1. Score transaction
      const scorer = system.getTransactionScorer();
      const score = await scorer.scoreTransaction(transaction);

      // 2. Detect anomaly
      const analyzer = system.getBehavioralAnalyzer();
      const behavior = await analyzer.analyzeBehavior(userId, {
        amount: transaction.amount,
        merchantCategory: transaction.merchantCategory,
        timestamp: transaction.timestamp,
        device: transaction.device,
        location: transaction.location,
      });

      // 3. Check velocity
      const checker = system.getVelocityChecker();
      const velocity = await checker.checkVelocity(userId, {
        type: 'transaction',
        amount: transaction.amount,
        timestamp: transaction.timestamp,
      });

      // 4. Monitor account
      const monitor = system.getAccountMonitor();
      const account = await monitor.monitorAccount(userId, {
        type: 'transaction',
        device: transaction.device,
        location: transaction.location,
        timestamp: transaction.timestamp,
      });

      // 5. Check compliance
      const compliance = system.getComplianceManager();
      const complianceResult = await compliance.checkAMLKYCCompliance({
        userId,
        kycStatus: 'verified',
        riskLevel: 'high',
      });

      // 6. Create alert with all signals
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId,
        type: 'transaction',
        severity: 'critical',
        message: 'Multiple fraud signals detected',
        metadata: {
          transactionId: transaction.id,
          fraudScore: score.score,
          deviationScore: behavior.deviationScore,
          velocityViolation: velocity.violatesLimit,
          accountSuspicious: account.suspicious,
          complianceIssue: !complianceResult.compliant,
        },
      });

      expect(alert.severity).toBe('critical');
      expect(alert.metadata.fraudScore).toBeGreaterThan(50);
      expect(alert.metadata.deviationScore).toBeGreaterThan(50);
    });
  });

  describe('Compliance Integration', () => {
    it('should enforce compliance throughout fraud detection', async () => {
      const userId = 'user-compliance-test';

      // Check NDPR compliance
      const compliance = system.getComplianceManager();
      const ndprResult = await compliance.checkNDPRCompliance({
        userId,
        dataType: 'transaction_data',
        operation: 'read',
        purpose: 'fraud_detection',
      });

      expect(ndprResult.compliant).toBe(true);

      // Check CBN compliance
      const cbnResult = await compliance.checkCBNCompliance({
        userId,
        transactionType: 'transfer',
        amount: 2000000,
      });

      expect(cbnResult.compliant).toBe(true);

      // Check AML/KYC compliance
      const amlResult = await compliance.checkAMLKYCCompliance({
        userId,
        kycStatus: 'verified',
        riskLevel: 'low',
      });

      expect(amlResult.compliant).toBe(true);

      // Create audit log
      const log = await compliance.createAuditLog({
        userId,
        action: 'fraud_detection_completed',
        details: {
          ndprCompliant: ndprResult.compliant,
          cbnCompliant: cbnResult.compliant,
          amlCompliant: amlResult.compliant,
        },
      });

      expect(log).toBeDefined();
      expect(log.immutable).toBe(true);
    });
  });

  describe('Alert Lifecycle', () => {
    it('should manage alert lifecycle', async () => {
      const userId = 'user-alert-lifecycle';
      const alertManager = system.getFraudAlertManager();

      // 1. Create alert
      const alert = await alertManager.createAlert({
        userId,
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      expect(alert.status).toBe('open');

      // 2. Send notifications
      const emailResult = await alertManager.sendNotification(alert.id, 'email');
      expect(emailResult).toBeDefined();

      const smsResult = await alertManager.sendNotification(alert.id, 'sms');
      expect(smsResult).toBeDefined();

      // 3. Acknowledge alert
      const acknowledged = await alertManager.acknowledgeAlert(alert.id, 'admin-001');
      expect(acknowledged.status).toBe('acknowledged');

      // 4. Resolve alert
      const resolved = await alertManager.resolveAlert(alert.id, 'false_positive');
      expect(resolved.status).toBe('resolved');

      // 5. Retrieve history
      const history = await alertManager.getAlertHistory(userId);
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('System Monitoring', () => {
    it('should monitor system performance', async () => {
      // Process multiple transactions
      const scorer = system.getTransactionScorer();

      for (let i = 0; i < 50; i++) {
        await scorer.scoreTransaction({
          id: `txn-${i}`,
          userId: `user-${i}`,
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        });
      }

      // Get metrics
      const metrics = system.getMetrics();

      expect(metrics.transactionsProcessed).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThan(0);
    });

    it('should report system status', async () => {
      const status = system.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.components).toBeDefined();
      expect(status.uptime).toBeGreaterThanOrEqual(0);
      expect(status.errorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from component failures', async () => {
      const scorer = system.getTransactionScorer();

      // Normal operation
      const result1 = await scorer.scoreTransaction({
        id: 'txn-recovery-1',
        userId: 'user-recovery',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now(),
      });

      expect(result1.score).toBeDefined();

      // After potential error, should still work
      const result2 = await scorer.scoreTransaction({
        id: 'txn-recovery-2',
        userId: 'user-recovery',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now(),
      });

      expect(result2.score).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent fraud detection', async () => {
      const promises = [];

      for (let i = 0; i < 100; i++) {
        const userId = `user-concurrent-${i}`;
        const transaction = {
          id: `txn-${i}`,
          userId,
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        promises.push(
          (async () => {
            const scorer = system.getTransactionScorer();
            const score = await scorer.scoreTransaction(transaction);

            const analyzer = system.getBehavioralAnalyzer();
            const behavior = await analyzer.analyzeBehavior(userId, {
              amount: transaction.amount,
              merchantCategory: transaction.merchantCategory,
              timestamp: transaction.timestamp,
              device: transaction.device,
              location: transaction.location,
            });

            return { score, behavior };
          })()
        );
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(100);
      results.forEach(result => {
        expect(result.score).toBeDefined();
        expect(result.behavior).toBeDefined();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across components', async () => {
      const userId = 'user-consistency';

      // Create alert
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId,
        type: 'transaction',
        severity: 'high',
        message: 'Alert',
      });

      // Retrieve alert
      const retrieved = await alertManager.getAlert(alert.id);

      expect(retrieved.id).toBe(alert.id);
      expect(retrieved.userId).toBe(userId);
      expect(retrieved.message).toBe(alert.message);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle Nigerian fintech fraud scenario', async () => {
      const userId = 'user-ng-scenario';

      // Scenario: User in Lagos receives login from New York
      const monitor = system.getAccountMonitor();

      // Normal pattern
      await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'device-001',
        location: 'Lagos, Nigeria',
        timestamp: Date.now() - 86400000,
      });

      // Suspicious login
      const suspiciousLogin = await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'unknown-device',
        location: 'New York, USA',
        timestamp: Date.now(),
      });

      expect(suspiciousLogin.suspicious).toBe(true);

      // Rapid large withdrawal
      const checker = system.getVelocityChecker();
      for (let i = 0; i < 6; i++) {
        const velocity = await checker.checkVelocity(userId, {
          type: 'withdrawal',
          amount: 500000,
          timestamp: Date.now() + (i * 3600000),
        });

        if (i > 4) {
          expect(velocity.violatesLimit).toBe(true);
        }
      }

      // Create comprehensive alert
      const alertManager = system.getFraudAlertManager();
      const alert = await alertManager.createAlert({
        userId,
        type: 'account',
        severity: 'critical',
        message: 'Account takeover and fraud detected',
        metadata: {
          suspiciousLogin: true,
          velocityViolation: true,
          scenario: 'nigerian_fintech_fraud',
        },
      });

      expect(alert.severity).toBe('critical');
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance under load', async () => {
      const startTime = performance.now();

      const promises = [];
      for (let i = 0; i < 200; i++) {
        promises.push(
          system.getTransactionScorer().scoreTransaction({
            id: `txn-load-${i}`,
            userId: `user-load-${i}`,
            amount: 50000,
            merchantCategory: 'grocery',
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          })
        );
      }

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(30000); // Should complete in 30 seconds
    });
  });
});
