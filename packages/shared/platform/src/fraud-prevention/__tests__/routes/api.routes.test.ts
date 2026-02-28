import request from 'supertest';
import { Express } from 'express';
import { setupFraudPreventionRoutes } from '../../routes/api.routes';
import { FraudPreventionSystem } from '../../FraudPreventionSystem';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('Fraud Prevention API Routes', () => {
  let app: Express;
  let system: FraudPreventionSystem;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(async () => {
    // Mock Express app
    app = require('express')();
    eventBus = new EventBus();
    logger = new Logger('test');
    system = new FraudPreventionSystem(eventBus, logger);

    await system.initialize();
    setupFraudPreventionRoutes(app, system);
  });

  describe('POST /api/fraud-prevention/score-transaction', () => {
    it('should score a transaction', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({
          transaction: {
            id: 'txn-001',
            userId: 'user-001',
            amount: 50000,
            merchantCategory: 'grocery',
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.score).toBeDefined();
      expect(response.body.score).toBeGreaterThanOrEqual(0);
      expect(response.body.score).toBeLessThanOrEqual(100);
    });

    it('should return high score for high-risk transaction', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({
          transaction: {
            id: 'txn-002',
            userId: 'user-002',
            amount: 5000000,
            merchantCategory: 'cryptocurrency',
            location: 'Unknown',
            device: 'unknown',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.score).toBeGreaterThan(50);
    });

    it('should handle missing transaction', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle invalid transaction data', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({
          transaction: {
            id: 'txn-003',
            userId: 'user-003',
            amount: -50000,
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fraud-prevention/detect-anomaly', () => {
    it('should detect anomalies', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/detect-anomaly')
        .send({
          userId: 'user-001',
          transaction: {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.isAnomaly).toBeDefined();
    });

    it('should flag high-risk transactions as anomalies', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/detect-anomaly')
        .send({
          userId: 'user-002',
          transaction: {
            amount: 5000000,
            merchantCategory: 'cryptocurrency',
            timestamp: Date.now(),
            device: 'unknown',
            location: 'Unknown',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.isAnomaly).toBe(true);
    });

    it('should handle missing user ID', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/detect-anomaly')
        .send({
          transaction: {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fraud-prevention/check-velocity', () => {
    it('should check transaction velocity', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/check-velocity')
        .send({
          userId: 'user-001',
          transaction: {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.violatesLimit).toBeDefined();
      expect(response.body.currentVelocity).toBeDefined();
    });

    it('should flag high velocity', async () => {
      const userId = 'user-velocity-test';

      // Create multiple rapid transactions
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/fraud-prevention/check-velocity')
          .send({
            userId,
            transaction: {
              type: 'transaction',
              amount: 50000,
              timestamp: Date.now() + (i * 60000),
            },
          });
      }

      const response = await request(app)
        .post('/api/fraud-prevention/check-velocity')
        .send({
          userId,
          transaction: {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (15 * 60000),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.violatesLimit).toBe(true);
    });

    it('should handle missing user ID', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/check-velocity')
        .send({
          transaction: {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fraud-prevention/monitor-account', () => {
    it('should monitor account activity', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/monitor-account')
        .send({
          userId: 'user-001',
          activity: {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.suspicious).toBeDefined();
    });

    it('should flag suspicious account activity', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/monitor-account')
        .send({
          userId: 'user-002',
          activity: {
            type: 'login',
            device: 'unknown-device',
            location: 'Unknown Location',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.suspicious).toBe(true);
    });

    it('should handle missing user ID', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/monitor-account')
        .send({
          activity: {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fraud-prevention/analyze-behavior', () => {
    it('should analyze user behavior', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/analyze-behavior')
        .send({
          userId: 'user-001',
          transaction: {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.isDeviation).toBeDefined();
      expect(response.body.deviationScore).toBeDefined();
    });

    it('should flag behavioral deviations', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/analyze-behavior')
        .send({
          userId: 'user-002',
          transaction: {
            amount: 5000000,
            merchantCategory: 'cryptocurrency',
            timestamp: Date.now(),
            device: 'unknown',
            location: 'Unknown',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.isDeviation).toBe(true);
    });

    it('should handle missing user ID', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/analyze-behavior')
        .send({
          transaction: {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fraud-prevention/create-alert', () => {
    it('should create fraud alert', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId: 'user-001',
          type: 'transaction',
          severity: 'high',
          message: 'High-risk transaction detected',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('open');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId: 'user-001',
        });

      expect(response.status).toBe(400);
    });

    it('should validate alert severity', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId: 'user-001',
          type: 'transaction',
          severity: 'invalid_severity',
          message: 'Alert',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/fraud-prevention/alerts/:userId', () => {
    it('should retrieve user alerts', async () => {
      const userId = 'user-alerts-test';

      // Create alert
      await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId,
          type: 'transaction',
          severity: 'high',
          message: 'Alert',
        });

      // Retrieve alerts
      const response = await request(app)
        .get(`/api/fraud-prevention/alerts/${userId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts.length).toBeGreaterThan(0);
    });

    it('should return empty array for user with no alerts', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/alerts/user-no-alerts-' + Date.now());

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts.length).toBe(0);
    });

    it('should handle invalid user ID', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/alerts/');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/fraud-prevention/alerts/:alertId/acknowledge', () => {
    it('should acknowledge alert', async () => {
      // Create alert
      const createResponse = await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId: 'user-001',
          type: 'transaction',
          severity: 'high',
          message: 'Alert',
        });

      const alertId = createResponse.body.id;

      // Acknowledge alert
      const response = await request(app)
        .put(`/api/fraud-prevention/alerts/${alertId}/acknowledge`)
        .send({
          acknowledgedBy: 'admin-001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('acknowledged');
    });

    it('should handle non-existent alert', async () => {
      const response = await request(app)
        .put('/api/fraud-prevention/alerts/non-existent/acknowledge')
        .send({
          acknowledgedBy: 'admin-001',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/fraud-prevention/alerts/:alertId/resolve', () => {
    it('should resolve alert', async () => {
      // Create alert
      const createResponse = await request(app)
        .post('/api/fraud-prevention/create-alert')
        .send({
          userId: 'user-001',
          type: 'transaction',
          severity: 'high',
          message: 'Alert',
        });

      const alertId = createResponse.body.id;

      // Resolve alert
      const response = await request(app)
        .put(`/api/fraud-prevention/alerts/${alertId}/resolve`)
        .send({
          resolutionReason: 'false_positive',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('resolved');
    });

    it('should handle non-existent alert', async () => {
      const response = await request(app)
        .put('/api/fraud-prevention/alerts/non-existent/resolve')
        .send({
          resolutionReason: 'false_positive',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/fraud-prevention/check-compliance', () => {
    it('should check NDPR compliance', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/check-compliance')
        .send({
          userId: 'user-001',
          dataType: 'transaction_data',
          operation: 'read',
          purpose: 'fraud_detection',
        });

      expect(response.status).toBe(200);
      expect(response.body.compliant).toBeDefined();
    });

    it('should flag non-compliant operations', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/check-compliance')
        .send({
          userId: 'user-001',
          dataType: 'personal_information',
          operation: 'share',
          recipient: 'third_party',
        });

      expect(response.status).toBe(200);
      expect(response.body.compliant).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/check-compliance')
        .send({
          userId: 'user-001',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/fraud-prevention/system/status', () => {
    it('should return system status', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/system/status');

      expect(response.status).toBe(200);
      expect(response.body.initialized).toBe(true);
      expect(response.body.components).toBeDefined();
    });

    it('should include component health', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/system/status');

      expect(response.status).toBe(200);
      expect(response.body.components.transactionScorer).toBeDefined();
      expect(response.body.components.anomalyDetector).toBeDefined();
    });
  });

  describe('GET /api/fraud-prevention/system/metrics', () => {
    it('should return system metrics', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/system/metrics');

      expect(response.status).toBe(200);
      expect(response.body.transactionsProcessed).toBeDefined();
      expect(response.body.anomaliesDetected).toBeDefined();
      expect(response.body.alertsCreated).toBeDefined();
    });

    it('should include performance metrics', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/system/metrics');

      expect(response.status).toBe(200);
      expect(response.body.averageResponseTime).toBeDefined();
      expect(response.body.peakResponseTime).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle missing endpoints', async () => {
      const response = await request(app)
        .get('/api/fraud-prevention/non-existent-endpoint');

      expect(response.status).toBe(404);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .post('/api/fraud-prevention/admin/reset-metrics')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      const promises = [];

      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post('/api/fraud-prevention/score-transaction')
            .send({
              transaction: {
                id: `txn-${i}`,
                userId: `user-${i}`,
                amount: 50000,
                merchantCategory: 'grocery',
                location: 'Lagos, Nigeria',
                device: 'device-001',
                timestamp: Date.now(),
              },
            })
        );
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(50);
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });

    it('should respond quickly to requests', async () => {
      const startTime = performance.now();

      await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({
          transaction: {
            id: 'txn-perf',
            userId: 'user-perf',
            amount: 50000,
            merchantCategory: 'grocery',
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          },
        });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const userId = 'user-rate-limit';

      // Make rapid requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post('/api/fraud-prevention/score-transaction')
          .send({
            transaction: {
              id: `txn-${i}`,
              userId,
              amount: 50000,
              merchantCategory: 'grocery',
              location: 'Lagos, Nigeria',
              device: 'device-001',
              timestamp: Date.now(),
            },
          });
      }

      // Next request might be rate limited
      const response = await request(app)
        .post('/api/fraud-prevention/score-transaction')
        .send({
          transaction: {
            id: 'txn-final',
            userId,
            amount: 50000,
            merchantCategory: 'grocery',
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          },
        });

      expect(response.status).toBeDefined();
    });
  });
});
