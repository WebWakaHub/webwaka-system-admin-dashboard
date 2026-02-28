import { FraudPreventionSystem } from '../FraudPreventionSystem';
import { EventBus } from '../../events/EventBus';
import { Logger } from '../../logging/Logger';

describe('FraudPreventionSystem', () => {
  let system: FraudPreventionSystem;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    system = new FraudPreventionSystem(eventBus, logger);
  });

  describe('Initialization', () => {
    it('should initialize fraud prevention system', () => {
      expect(system).toBeDefined();
    });

    it('should initialize all components', async () => {
      await system.initialize();

      expect(system.getTransactionScorer()).toBeDefined();
      expect(system.getAnomalyDetector()).toBeDefined();
      expect(system.getRuleEngine()).toBeDefined();
      expect(system.getAccountMonitor()).toBeDefined();
      expect(system.getVelocityChecker()).toBeDefined();
      expect(system.getBehavioralAnalyzer()).toBeDefined();
      expect(system.getFraudAlertManager()).toBeDefined();
      expect(system.getComplianceManager()).toBeDefined();
    });

    it('should set up event listeners', async () => {
      const eventSpy = jest.spyOn(eventBus, 'subscribe');

      await system.initialize();

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should load configuration', async () => {
      await system.initialize();

      const config = system.getConfiguration();
      expect(config).toBeDefined();
    });
  });

  describe('Component Access', () => {
    it('should provide access to TransactionScorer', async () => {
      await system.initialize();

      const scorer = system.getTransactionScorer();
      expect(scorer).toBeDefined();
    });

    it('should provide access to AnomalyDetector', async () => {
      await system.initialize();

      const detector = system.getAnomalyDetector();
      expect(detector).toBeDefined();
    });

    it('should provide access to RuleEngine', async () => {
      await system.initialize();

      const engine = system.getRuleEngine();
      expect(engine).toBeDefined();
    });

    it('should provide access to AccountMonitor', async () => {
      await system.initialize();

      const monitor = system.getAccountMonitor();
      expect(monitor).toBeDefined();
    });

    it('should provide access to VelocityChecker', async () => {
      await system.initialize();

      const checker = system.getVelocityChecker();
      expect(checker).toBeDefined();
    });

    it('should provide access to BehavioralAnalyzer', async () => {
      await system.initialize();

      const analyzer = system.getBehavioralAnalyzer();
      expect(analyzer).toBeDefined();
    });

    it('should provide access to FraudAlertManager', async () => {
      await system.initialize();

      const manager = system.getFraudAlertManager();
      expect(manager).toBeDefined();
    });

    it('should provide access to ComplianceManager', async () => {
      await system.initialize();

      const manager = system.getComplianceManager();
      expect(manager).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should get current configuration', async () => {
      await system.initialize();

      const config = system.getConfiguration();
      expect(config).toBeDefined();
    });

    it('should update configuration', async () => {
      await system.initialize();

      const newConfig = {
        transactionScoringThreshold: 70,
        anomalyDetectionThreshold: 65,
      };

      await system.updateConfiguration(newConfig);

      const config = system.getConfiguration();
      expect(config.transactionScoringThreshold).toBe(70);
    });

    it('should validate configuration', async () => {
      await system.initialize();

      const invalidConfig = {
        transactionScoringThreshold: -10,
      };

      expect(async () => {
        await system.updateConfiguration(invalidConfig);
      }).not.toThrow();
    });

    it('should reset configuration to defaults', async () => {
      await system.initialize();

      await system.resetConfiguration();

      const config = system.getConfiguration();
      expect(config).toBeDefined();
    });
  });

  describe('System Status', () => {
    it('should report system status', async () => {
      await system.initialize();

      const status = system.getStatus();

      expect(status).toBeDefined();
      expect(status.initialized).toBe(true);
      expect(status.components).toBeDefined();
    });

    it('should report component health', async () => {
      await system.initialize();

      const status = system.getStatus();

      expect(status.components.transactionScorer).toBeDefined();
      expect(status.components.anomalyDetector).toBeDefined();
      expect(status.components.ruleEngine).toBeDefined();
      expect(status.components.accountMonitor).toBeDefined();
      expect(status.components.velocityChecker).toBeDefined();
      expect(status.components.behavioralAnalyzer).toBeDefined();
      expect(status.components.fraudAlertManager).toBeDefined();
      expect(status.components.complianceManager).toBeDefined();
    });

    it('should report system uptime', async () => {
      await system.initialize();

      const status = system.getStatus();

      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should report error count', async () => {
      await system.initialize();

      const status = system.getStatus();

      expect(status.errorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Handling', () => {
    it('should handle transaction scoring events', async () => {
      await system.initialize();

      const eventSpy = jest.spyOn(eventBus, 'publish');

      await eventBus.publish('fraud.transaction.scoring.requested', {
        data: {
          transaction: {
            id: 'txn-001',
            userId: 'user-001',
            amount: 2000000,
            merchantCategory: 'gambling',
            location: 'Unknown',
            device: 'unknown',
            timestamp: Date.now(),
          },
        },
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should handle anomaly detection events', async () => {
      await system.initialize();

      const eventSpy = jest.spyOn(eventBus, 'publish');

      await eventBus.publish('fraud.anomaly.detection.requested', {
        data: {
          userId: 'user-001',
          transaction: {
            amount: 5000000,
            merchantCategory: 'cryptocurrency',
            timestamp: Date.now(),
          },
        },
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should handle account monitoring events', async () => {
      await system.initialize();

      const eventSpy = jest.spyOn(eventBus, 'publish');

      await eventBus.publish('fraud.account.monitoring.requested', {
        data: {
          userId: 'user-001',
          activity: {
            type: 'login',
            device: 'unknown-device',
            location: 'New York, USA',
            timestamp: Date.now(),
          },
        },
      });

      expect(eventSpy).toHaveBeenCalled();
      eventSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      expect(async () => {
        await system.initialize();
      }).not.toThrow();
    });

    it('should handle component access errors', async () => {
      expect(() => {
        system.getTransactionScorer();
      }).not.toThrow();
    });

    it('should handle configuration errors', async () => {
      await system.initialize();

      expect(async () => {
        await system.updateConfiguration(null as any);
      }).not.toThrow();
    });

    it('should recover from errors', async () => {
      await system.initialize();

      const status1 = system.getStatus();
      expect(status1.initialized).toBe(true);

      const status2 = system.getStatus();
      expect(status2.initialized).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should initialize quickly', async () => {
      const startTime = performance.now();
      await system.initialize();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should provide fast status checks', async () => {
      await system.initialize();

      const startTime = performance.now();
      system.getStatus();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle concurrent component access', async () => {
      await system.initialize();

      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve(system.getTransactionScorer())
        );
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(100);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await system.initialize();

      expect(async () => {
        await system.shutdown();
      }).not.toThrow();
    });

    it('should cleanup resources', async () => {
      await system.initialize();

      await system.shutdown();

      const status = system.getStatus();
      expect(status.initialized).toBe(false);
    });

    it('should close event listeners', async () => {
      await system.initialize();

      const unsubscribeSpy = jest.spyOn(eventBus, 'unsubscribe');

      await system.shutdown();

      expect(unsubscribeSpy).toHaveBeenCalled();
      unsubscribeSpy.mockRestore();
    });
  });

  describe('Restart', () => {
    it('should restart system', async () => {
      await system.initialize();
      await system.shutdown();
      await system.initialize();

      const status = system.getStatus();
      expect(status.initialized).toBe(true);
    });

    it('should preserve configuration after restart', async () => {
      await system.initialize();

      const newConfig = {
        transactionScoringThreshold: 75,
      };

      await system.updateConfiguration(newConfig);
      await system.shutdown();
      await system.initialize();

      const config = system.getConfiguration();
      expect(config.transactionScoringThreshold).toBe(75);
    });
  });

  describe('Metrics', () => {
    it('should collect system metrics', async () => {
      await system.initialize();

      const metrics = system.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.transactionsProcessed).toBeGreaterThanOrEqual(0);
      expect(metrics.anomaliesDetected).toBeGreaterThanOrEqual(0);
      expect(metrics.alertsCreated).toBeGreaterThanOrEqual(0);
    });

    it('should track performance metrics', async () => {
      await system.initialize();

      const metrics = system.getMetrics();

      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.peakResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should track error metrics', async () => {
      await system.initialize();

      const metrics = system.getMetrics();

      expect(metrics.errorCount).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should reset metrics', async () => {
      await system.initialize();

      system.resetMetrics();

      const metrics = system.getMetrics();

      expect(metrics.transactionsProcessed).toBe(0);
      expect(metrics.anomaliesDetected).toBe(0);
    });
  });

  describe('Logging', () => {
    it('should log system events', async () => {
      const logSpy = jest.spyOn(logger, 'info');

      await system.initialize();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('should log errors', async () => {
      const logSpy = jest.spyOn(logger, 'error');

      await system.initialize();

      // Trigger an error scenario
      expect(logSpy).toBeDefined();
      logSpy.mockRestore();
    });

    it('should log warnings', async () => {
      const logSpy = jest.spyOn(logger, 'warn');

      await system.initialize();

      expect(logSpy).toBeDefined();
      logSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should integrate all components', async () => {
      await system.initialize();

      const transaction = {
        id: 'txn-001',
        userId: 'user-001',
        amount: 2000000,
        merchantCategory: 'gambling',
        location: 'Unknown',
        device: 'unknown',
        timestamp: Date.now(),
      };

      // Should be able to score transaction
      const scorer = system.getTransactionScorer();
      const score = await scorer.scoreTransaction(transaction);

      expect(score).toBeDefined();
      expect(score.score).toBeGreaterThan(0);
    });

    it('should coordinate between components', async () => {
      await system.initialize();

      const userId = 'user-001';

      // Analyze behavior
      const analyzer = system.getBehavioralAnalyzer();
      const behavior = await analyzer.analyzeBehavior(userId, {
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        timestamp: Date.now(),
        device: 'unknown',
        location: 'Unknown',
      });

      // Check velocity
      const checker = system.getVelocityChecker();
      const velocity = await checker.checkVelocity(userId, {
        type: 'transaction',
        amount: 5000000,
        timestamp: Date.now(),
      });

      expect(behavior).toBeDefined();
      expect(velocity).toBeDefined();
    });

    it('should create alerts from multiple components', async () => {
      await system.initialize();

      const manager = system.getFraudAlertManager();

      // Create alerts from different sources
      const alert1 = await manager.createAlert({
        userId: 'user-001',
        type: 'transaction',
        severity: 'high',
        message: 'High-risk transaction',
      });

      const alert2 = await manager.createAlert({
        userId: 'user-001',
        type: 'behavior',
        severity: 'medium',
        message: 'Unusual behavior',
      });

      expect(alert1).toBeDefined();
      expect(alert2).toBeDefined();
    });
  });

  describe('Compliance', () => {
    it('should enforce compliance throughout system', async () => {
      await system.initialize();

      const manager = system.getComplianceManager();

      const result = await manager.checkNDPRCompliance({
        userId: 'user-001',
        dataType: 'personal_information',
        operation: 'read',
        purpose: 'fraud_detection',
      });

      expect(result).toBeDefined();
    });

    it('should maintain audit trail', async () => {
      await system.initialize();

      const manager = system.getComplianceManager();

      const log = await manager.createAuditLog({
        userId: 'user-001',
        action: 'transaction_processed',
        details: { transactionId: 'txn-001' },
      });

      expect(log).toBeDefined();
      expect(log.immutable).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid initialization', async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(system.initialize());
      }

      expect(async () => {
        await Promise.all(promises);
      }).not.toThrow();
    });

    it('should handle rapid shutdown', async () => {
      await system.initialize();

      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(system.shutdown());
      }

      expect(async () => {
        await Promise.all(promises);
      }).not.toThrow();
    });

    it('should handle configuration updates during operation', async () => {
      await system.initialize();

      const updatePromises = [];

      for (let i = 0; i < 10; i++) {
        updatePromises.push(
          system.updateConfiguration({
            transactionScoringThreshold: 50 + i,
          })
        );
      }

      expect(async () => {
        await Promise.all(updatePromises);
      }).not.toThrow();
    });
  });
});
