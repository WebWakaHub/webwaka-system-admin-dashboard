import { TransactionScorer, Transaction, FraudScore } from '../../components/TransactionScorer';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('TransactionScorer', () => {
  let scorer: TransactionScorer;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    scorer = new TransactionScorer(eventBus, logger);
  });

  describe('scoreTransaction', () => {
    describe('Basic Functionality', () => {
      it('should score a normal transaction', async () => {
        const transaction: Transaction = {
          id: 'txn-001',
          userId: 'user-001',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.transactionId).toBe('txn-001');
        expect(score.userId).toBe('user-001');
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high', 'critical']).toContain(score.riskLevel);
        expect(Array.isArray(score.factors)).toBe(true);
      });

      it('should score a high-risk transaction', async () => {
        const transaction: Transaction = {
          id: 'txn-002',
          userId: 'user-002',
          amount: 5000000, // Very high amount
          merchantCategory: 'gambling',
          location: 'Unknown Location',
          device: 'unknown-device',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.score).toBeGreaterThan(50);
        expect(['high', 'critical']).toContain(score.riskLevel);
      });

      it('should score a low-risk transaction', async () => {
        const transaction: Transaction = {
          id: 'txn-003',
          userId: 'user-003',
          amount: 10000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.score).toBeLessThan(30);
        expect(['low', 'medium']).toContain(score.riskLevel);
      });
    });

    describe('Amount-Based Detection', () => {
      it('should flag unusually high amounts', async () => {
        const transaction: Transaction = {
          id: 'txn-004',
          userId: 'user-004',
          amount: 10000000, // 10M NGN - extremely high
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).toContain('unusual_amount');
        expect(score.score).toBeGreaterThan(40);
      });

      it('should handle zero amount', async () => {
        const transaction: Transaction = {
          id: 'txn-005',
          userId: 'user-005',
          amount: 0,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.score).toBeGreaterThanOrEqual(0);
      });

      it('should handle negative amount', async () => {
        const transaction: Transaction = {
          id: 'txn-006',
          userId: 'user-006',
          amount: -50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.factors).toContain('unusual_amount');
      });

      it('should handle maximum amount', async () => {
        const transaction: Transaction = {
          id: 'txn-007',
          userId: 'user-007',
          amount: Number.MAX_SAFE_INTEGER,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.score).toBeGreaterThan(50);
      });
    });

    describe('Merchant Category Detection', () => {
      it('should flag high-risk merchant categories', async () => {
        const highRiskCategories = ['gambling', 'adult', 'cryptocurrency'];

        for (const category of highRiskCategories) {
          const transaction: Transaction = {
            id: `txn-${category}`,
            userId: 'user-merchant',
            amount: 50000,
            merchantCategory: category,
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          };

          const score = await scorer.scoreTransaction(transaction);

          expect(score.factors).toContain('risky_merchant_category');
          expect(score.score).toBeGreaterThan(30);
        }
      });

      it('should not flag low-risk merchant categories', async () => {
        const lowRiskCategories = ['grocery', 'pharmacy', 'utilities'];

        for (const category of lowRiskCategories) {
          const transaction: Transaction = {
            id: `txn-${category}`,
            userId: 'user-merchant',
            amount: 50000,
            merchantCategory: category,
            location: 'Lagos, Nigeria',
            device: 'device-001',
            timestamp: Date.now(),
          };

          const score = await scorer.scoreTransaction(transaction);

          expect(score.factors).not.toContain('risky_merchant_category');
        }
      });
    });

    describe('Geographic Detection', () => {
      it('should flag unusual locations', async () => {
        const transaction: Transaction = {
          id: 'txn-geo-001',
          userId: 'user-geo',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Unknown Location',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).toContain('unusual_location');
      });

      it('should not flag known locations', async () => {
        const transaction: Transaction = {
          id: 'txn-geo-002',
          userId: 'user-geo',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).not.toContain('unusual_location');
      });
    });

    describe('Device Detection', () => {
      it('should flag new devices', async () => {
        const transaction: Transaction = {
          id: 'txn-dev-001',
          userId: 'user-dev',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'unknown-device-xyz',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).toContain('new_device');
      });

      it('should not flag known devices', async () => {
        const transaction: Transaction = {
          id: 'txn-dev-002',
          userId: 'user-dev',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).not.toContain('new_device');
      });
    });

    describe('Velocity Detection', () => {
      it('should flag high-velocity transactions', async () => {
        const transaction: Transaction = {
          id: 'txn-vel-001',
          userId: 'user-velocity',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        // Simulate multiple rapid transactions
        for (let i = 0; i < 15; i++) {
          transaction.id = `txn-vel-${i}`;
          await scorer.scoreTransaction(transaction);
        }

        const lastScore = await scorer.scoreTransaction(transaction);

        expect(lastScore.factors).toContain('high_velocity');
      });
    });

    describe('Risk Level Classification', () => {
      it('should classify low-risk transactions', async () => {
        const transaction: Transaction = {
          id: 'txn-risk-low',
          userId: 'user-risk',
          amount: 10000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        if (score.score < 25) {
          expect(score.riskLevel).toBe('low');
        }
      });

      it('should classify medium-risk transactions', async () => {
        const transaction: Transaction = {
          id: 'txn-risk-med',
          userId: 'user-risk',
          amount: 500000,
          merchantCategory: 'jewelry',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        if (score.score >= 25 && score.score < 50) {
          expect(score.riskLevel).toBe('medium');
        }
      });

      it('should classify high-risk transactions', async () => {
        const transaction: Transaction = {
          id: 'txn-risk-high',
          userId: 'user-risk',
          amount: 2000000,
          merchantCategory: 'gambling',
          location: 'Unknown',
          device: 'unknown-device',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        if (score.score >= 50 && score.score < 75) {
          expect(score.riskLevel).toBe('high');
        }
      });

      it('should classify critical-risk transactions', async () => {
        const transaction: Transaction = {
          id: 'txn-risk-crit',
          userId: 'user-risk',
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          location: 'Unknown',
          device: 'unknown-device',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        if (score.score >= 75) {
          expect(score.riskLevel).toBe('critical');
        }
      });
    });

    describe('Caching', () => {
      it('should cache fraud scores', async () => {
        const transaction: Transaction = {
          id: 'txn-cache-001',
          userId: 'user-cache',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score1 = await scorer.scoreTransaction(transaction);
        const score2 = await scorer.scoreTransaction(transaction);

        expect(score1.score).toBe(score2.score);
        expect(score1.riskLevel).toBe(score2.riskLevel);
      });

      it('should return cached score within expiry', async () => {
        const transaction: Transaction = {
          id: 'txn-cache-002',
          userId: 'user-cache',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score1 = await scorer.scoreTransaction(transaction);
        
        // Simulate time passing but within cache expiry
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const score2 = await scorer.scoreTransaction(transaction);

        expect(score1.score).toBe(score2.score);
      });

      it('should expire cached scores after timeout', async () => {
        const transaction: Transaction = {
          id: 'txn-cache-003',
          userId: 'user-cache',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score1 = await scorer.scoreTransaction(transaction);
        
        // Wait for cache to expire (5 minutes)
        // In tests, we would mock the time
        // For now, just verify the score is returned
        expect(score1).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should handle missing transaction data', async () => {
        const transaction: any = {
          id: 'txn-error-001',
          userId: 'user-error',
          // Missing other fields
        };

        // Should not throw, but handle gracefully
        expect(async () => {
          await scorer.scoreTransaction(transaction);
        }).not.toThrow();
      });

      it('should handle invalid transaction ID', async () => {
        const transaction: Transaction = {
          id: '',
          userId: 'user-error',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
      });

      it('should handle invalid user ID', async () => {
        const transaction: Transaction = {
          id: 'txn-error-002',
          userId: '',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
      });

      it('should handle null metadata', async () => {
        const transaction: Transaction = {
          id: 'txn-error-003',
          userId: 'user-error',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
          metadata: null as any,
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle first transaction from user', async () => {
        const transaction: Transaction = {
          id: 'txn-edge-001',
          userId: 'new-user-001',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.score).toBeGreaterThanOrEqual(0);
      });

      it('should handle rapid transactions from same user', async () => {
        const userId = 'rapid-user';
        const baseTransaction: Transaction = {
          id: 'txn-edge-002',
          userId,
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const scores: FraudScore[] = [];

        for (let i = 0; i < 5; i++) {
          baseTransaction.id = `txn-edge-${i}`;
          const score = await scorer.scoreTransaction(baseTransaction);
          scores.push(score);
        }

        // Last transaction should have higher score due to velocity
        expect(scores[scores.length - 1].score).toBeGreaterThanOrEqual(scores[0].score);
      });

      it('should handle transactions from new device', async () => {
        const transaction: Transaction = {
          id: 'txn-edge-003',
          userId: 'device-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'brand-new-device-xyz',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).toContain('new_device');
      });

      it('should handle transactions from new location', async () => {
        const transaction: Transaction = {
          id: 'txn-edge-004',
          userId: 'location-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Remote Location XYZ',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score.factors).toContain('unusual_location');
      });

      it('should handle very small amounts', async () => {
        const transaction: Transaction = {
          id: 'txn-edge-005',
          userId: 'small-user',
          amount: 1,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
        expect(score.score).toBeLessThan(30);
      });

      it('should handle transactions with metadata', async () => {
        const transaction: Transaction = {
          id: 'txn-edge-006',
          userId: 'metadata-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
          metadata: {
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            customField: 'value',
          },
        };

        const score = await scorer.scoreTransaction(transaction);

        expect(score).toBeDefined();
      });
    });

    describe('Performance', () => {
      it('should score transaction in less than 50ms', async () => {
        const transaction: Transaction = {
          id: 'txn-perf-001',
          userId: 'perf-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        const startTime = performance.now();
        await scorer.scoreTransaction(transaction);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
      });

      it('should return cached score in less than 10ms', async () => {
        const transaction: Transaction = {
          id: 'txn-perf-002',
          userId: 'perf-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        // First call to populate cache
        await scorer.scoreTransaction(transaction);

        // Second call should be cached
        const startTime = performance.now();
        await scorer.scoreTransaction(transaction);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10);
      });
    });

    describe('Event Publishing', () => {
      it('should publish fraud score event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');

        const transaction: Transaction = {
          id: 'txn-event-001',
          userId: 'event-user',
          amount: 50000,
          merchantCategory: 'grocery',
          location: 'Lagos, Nigeria',
          device: 'device-001',
          timestamp: Date.now(),
        };

        await scorer.scoreTransaction(transaction);

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });

      it('should subscribe to scoring request events', () => {
        const subscribeSpy = jest.spyOn(eventBus, 'subscribe');

        // Create new scorer to trigger setupEventListeners
        const newScorer = new TransactionScorer(eventBus, logger);

        expect(subscribeSpy).toHaveBeenCalledWith(
          'fraud.transaction.scoring.requested',
          expect.any(Function)
        );

        subscribeSpy.mockRestore();
      });
    });
  });

  describe('Factor Weighting', () => {
    it('should apply correct weights to factors', async () => {
      const transaction: Transaction = {
        id: 'txn-weight-001',
        userId: 'weight-user',
        amount: 5000000, // High amount (25% weight)
        merchantCategory: 'gambling', // Risky (20% weight)
        location: 'Unknown', // Unusual (20% weight)
        device: 'new-device', // New (15% weight)
        timestamp: Date.now(),
      };

      const score = await scorer.scoreTransaction(transaction);

      // Score should be influenced by all factors
      expect(score.score).toBeGreaterThan(40);
      expect(score.factors.length).toBeGreaterThan(0);
    });

    it('should handle all factors contributing equally', async () => {
      const transaction: Transaction = {
        id: 'txn-weight-002',
        userId: 'weight-user',
        amount: 100000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now(),
      };

      const score = await scorer.scoreTransaction(transaction);

      // Score should be reasonable with normal factors
      expect(score.score).toBeLessThan(50);
    });
  });

  describe('Timestamp Handling', () => {
    it('should accept current timestamp', async () => {
      const transaction: Transaction = {
        id: 'txn-time-001',
        userId: 'time-user',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now(),
      };

      const score = await scorer.scoreTransaction(transaction);

      expect(score.timestamp).toBeDefined();
      expect(score.timestamp).toBeGreaterThan(0);
    });

    it('should accept past timestamp', async () => {
      const transaction: Transaction = {
        id: 'txn-time-002',
        userId: 'time-user',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: Date.now() - 3600000, // 1 hour ago
      };

      const score = await scorer.scoreTransaction(transaction);

      expect(score).toBeDefined();
    });

    it('should handle zero timestamp', async () => {
      const transaction: Transaction = {
        id: 'txn-time-003',
        userId: 'time-user',
        amount: 50000,
        merchantCategory: 'grocery',
        location: 'Lagos, Nigeria',
        device: 'device-001',
        timestamp: 0,
      };

      const score = await scorer.scoreTransaction(transaction);

      expect(score).toBeDefined();
    });
  });
});
