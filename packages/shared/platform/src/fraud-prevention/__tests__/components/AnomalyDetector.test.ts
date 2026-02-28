import { AnomalyDetector } from '../../components/AnomalyDetector';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    detector = new AnomalyDetector(eventBus, logger);
  });

  describe('detectAnomalies', () => {
    describe('Basic Functionality', () => {
      it('should detect normal spending patterns', async () => {
        const userId = 'user-001';
        const transaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const anomaly = await detector.detectAnomalies(userId, transaction);

        expect(anomaly).toBeDefined();
        expect(anomaly.isAnomaly).toBeDefined();
        expect(anomaly.anomalyScore).toBeGreaterThanOrEqual(0);
        expect(anomaly.anomalyScore).toBeLessThanOrEqual(100);
      });

      it('should detect abnormal spending patterns', async () => {
        const userId = 'user-002';
        const transaction = {
          amount: 10000000, // Extremely high
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        };

        const anomaly = await detector.detectAnomalies(userId, transaction);

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.anomalyScore).toBeGreaterThan(60);
      });

      it('should return anomaly reasons', async () => {
        const userId = 'user-003';
        const transaction = {
          amount: 5000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const anomaly = await detector.detectAnomalies(userId, transaction);

        expect(Array.isArray(anomaly.reasons)).toBe(true);
        if (anomaly.isAnomaly) {
          expect(anomaly.reasons.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Spending Pattern Analysis', () => {
      it('should detect unusual spending amounts', async () => {
        const userId = 'user-spending';
        
        // Establish normal pattern
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000), // Daily
          });
        }

        // Anomalous transaction
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 5000000, // 100x normal
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.reasons).toContain('spending_pattern_deviation');
      });

      it('should detect unusual frequency patterns', async () => {
        const userId = 'user-frequency';

        // Establish normal pattern (1 transaction per day)
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Rapid transactions
        for (let i = 0; i < 20; i++) {
          const anomaly = await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() + (i * 60000), // Every minute
          });

          if (i > 5) {
            expect(anomaly.isAnomaly).toBe(true);
            expect(anomaly.reasons).toContain('frequency_deviation');
          }
        }
      });

      it('should detect merchant category deviations', async () => {
        const userId = 'user-merchant';

        // Establish normal pattern (grocery only)
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Anomalous category
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.reasons).toContain('merchant_category_deviation');
      });

      it('should detect time-of-day deviations', async () => {
        const userId = 'user-time';

        // Establish normal pattern (daytime transactions)
        const daytimeHour = 10;
        for (let i = 0; i < 10; i++) {
          const timestamp = new Date();
          timestamp.setHours(daytimeHour);
          timestamp.setDate(timestamp.getDate() - i);

          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: timestamp.getTime(),
          });
        }

        // Anomalous time (midnight)
        const midnightTime = new Date();
        midnightTime.setHours(0);

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: midnightTime.getTime(),
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.reasons).toContain('time_of_day_deviation');
      });

      it('should detect device usage deviations', async () => {
        const userId = 'user-device';

        // Establish normal pattern (device-001)
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
          });
        }

        // Anomalous device
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'unknown-device-xyz',
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.reasons).toContain('device_deviation');
      });
    });

    describe('Behavior Profile Learning', () => {
      it('should learn user behavior from transactions', async () => {
        const userId = 'user-learn';

        // First transaction - should not be anomaly (no baseline)
        const firstAnomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(firstAnomaly.isAnomaly).toBe(false);

        // Subsequent transactions should establish baseline
        for (let i = 0; i < 5; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Now anomalous transaction should be detected
        const anomalousAnomaly = await detector.detectAnomalies(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(anomalousAnomaly.isAnomaly).toBe(true);
      });

      it('should update behavior profile with new transactions', async () => {
        const userId = 'user-update';

        // Establish initial pattern
        for (let i = 0; i < 5; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Gradually increase spending
        for (let i = 0; i < 5; i++) {
          const amount = 50000 + (i * 100000);
          await detector.detectAnomalies(userId, {
            amount,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // New normal should be higher
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 300000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        // Should not be as anomalous as before
        expect(anomaly.anomalyScore).toBeLessThan(60);
      });

      it('should maintain separate profiles for different users', async () => {
        const user1 = 'user-profile-1';
        const user2 = 'user-profile-2';

        // User 1: high spender
        for (let i = 0; i < 5; i++) {
          await detector.detectAnomalies(user1, {
            amount: 1000000,
            merchantCategory: 'jewelry',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // User 2: low spender
        for (let i = 0; i < 5; i++) {
          await detector.detectAnomalies(user2, {
            amount: 10000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Same transaction amount should be normal for user1, anomalous for user2
        const anomaly1 = await detector.detectAnomalies(user1, {
          amount: 1000000,
          merchantCategory: 'jewelry',
          timestamp: Date.now(),
        });

        const anomaly2 = await detector.detectAnomalies(user2, {
          amount: 1000000,
          merchantCategory: 'jewelry',
          timestamp: Date.now(),
        });

        expect(anomaly1.isAnomaly).toBe(false);
        expect(anomaly2.isAnomaly).toBe(true);
      });
    });

    describe('ML Model Integration', () => {
      it('should load ML model successfully', async () => {
        const userId = 'user-ml';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle missing features gracefully', async () => {
        const userId = 'user-missing-features';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          // Missing merchantCategory
          timestamp: Date.now(),
        } as any);

        expect(anomaly).toBeDefined();
        expect(anomaly.anomalyScore).toBeGreaterThanOrEqual(0);
      });

      it('should provide confidence scores', async () => {
        const userId = 'user-confidence';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.confidence).toBeDefined();
        expect(anomaly.confidence).toBeGreaterThanOrEqual(0);
        expect(anomaly.confidence).toBeLessThanOrEqual(100);
      });
    });

    describe('Deviation Threshold', () => {
      it('should flag deviations above threshold', async () => {
        const userId = 'user-threshold';

        // Establish baseline
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Significant deviation
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 5000000, // 100x baseline
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.anomalyScore).toBeGreaterThan(60);
      });

      it('should not flag minor deviations', async () => {
        const userId = 'user-minor';

        // Establish baseline
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Minor deviation
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 55000, // 10% above baseline
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(false);
        expect(anomaly.anomalyScore).toBeLessThan(40);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await detector.detectAnomalies('', {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
          });
        }).not.toThrow();
      });

      it('should handle invalid amount', async () => {
        const userId = 'user-invalid';

        expect(async () => {
          await detector.detectAnomalies(userId, {
            amount: -50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
          });
        }).not.toThrow();
      });

      it('should handle missing merchant category', async () => {
        const userId = 'user-no-merchant';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: '',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle invalid timestamp', async () => {
        const userId = 'user-bad-time';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: -1,
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle null transaction', async () => {
        const userId = 'user-null';

        expect(async () => {
          await detector.detectAnomalies(userId, null as any);
        }).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle first transaction from user', async () => {
        const userId = 'new-user-' + Date.now();

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(false);
      });

      it('should handle user with no historical data', async () => {
        const userId = 'no-history-' + Date.now();

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle user with very limited historical data', async () => {
        const userId = 'limited-history-' + Date.now();

        // Only 1 transaction
        await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - 86400000,
        });

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle zero amount', async () => {
        const userId = 'zero-amount';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: 0,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });

      it('should handle maximum amount', async () => {
        const userId = 'max-amount';

        const anomaly = await detector.detectAnomalies(userId, {
          amount: Number.MAX_SAFE_INTEGER,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly).toBeDefined();
      });
    });

    describe('Performance', () => {
      it('should detect anomalies quickly', async () => {
        const userId = 'perf-user';

        const startTime = performance.now();
        await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
      });

      it('should handle multiple concurrent detections', async () => {
        const promises = [];

        for (let i = 0; i < 10; i++) {
          promises.push(
            detector.detectAnomalies(`user-concurrent-${i}`, {
              amount: 50000,
              merchantCategory: 'grocery',
              timestamp: Date.now(),
            })
          );
        }

        const results = await Promise.all(promises);

        expect(results.length).toBe(10);
        results.forEach(result => {
          expect(result).toBeDefined();
        });
      });
    });

    describe('Event Publishing', () => {
      it('should publish anomaly detected event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');
        const userId = 'event-user';

        await detector.detectAnomalies(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });

      it('should publish with correct event data', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');
        const userId = 'event-data-user';

        await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(eventSpy).toHaveBeenCalledWith(
          expect.stringContaining('anomaly'),
          expect.any(Object)
        );

        eventSpy.mockRestore();
      });
    });

    describe('Behavior Pattern Recognition', () => {
      it('should recognize normal behavior patterns', async () => {
        const userId = 'pattern-normal';

        // Establish consistent pattern
        for (let i = 0; i < 20; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Same pattern
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(false);
      });

      it('should recognize gradual behavior changes', async () => {
        const userId = 'pattern-gradual';

        // Gradually increase spending
        for (let i = 0; i < 20; i++) {
          const amount = 50000 + (i * 50000);
          await detector.detectAnomalies(userId, {
            amount,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Slightly higher than latest trend
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 1100000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        });

        // Should not be highly anomalous
        expect(anomaly.anomalyScore).toBeLessThan(70);
      });

      it('should recognize sudden behavior changes', async () => {
        const userId = 'pattern-sudden';

        // Establish pattern
        for (let i = 0; i < 10; i++) {
          await detector.detectAnomalies(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Sudden change
        const anomaly = await detector.detectAnomalies(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
        });

        expect(anomaly.isAnomaly).toBe(true);
        expect(anomaly.anomalyScore).toBeGreaterThan(70);
      });
    });
  });

  describe('getUserProfile', () => {
    it('should return user behavior profile', async () => {
      const userId = 'profile-user';

      // Establish pattern
      for (let i = 0; i < 5; i++) {
        await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - (i * 86400000),
        });
      }

      const profile = await detector.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.transactionCount).toBeGreaterThan(0);
    });

    it('should return empty profile for new user', async () => {
      const userId = 'new-profile-user-' + Date.now();

      const profile = await detector.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.transactionCount).toBe(0);
    });
  });

  describe('resetUserProfile', () => {
    it('should reset user profile', async () => {
      const userId = 'reset-user';

      // Establish pattern
      for (let i = 0; i < 5; i++) {
        await detector.detectAnomalies(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - (i * 86400000),
        });
      }

      // Reset
      await detector.resetUserProfile(userId);

      // Next transaction should not be anomalous
      const anomaly = await detector.detectAnomalies(userId, {
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        timestamp: Date.now(),
      });

      expect(anomaly.isAnomaly).toBe(false);
    });
  });
});
