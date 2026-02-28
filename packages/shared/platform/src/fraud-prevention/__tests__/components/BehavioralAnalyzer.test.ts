import { BehavioralAnalyzer } from '../../components/BehavioralAnalyzer';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('BehavioralAnalyzer', () => {
  let analyzer: BehavioralAnalyzer;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    analyzer = new BehavioralAnalyzer(eventBus, logger);
  });

  describe('analyzeBehavior', () => {
    describe('Basic Functionality', () => {
      it('should analyze user behavior', async () => {
        const userId = 'user-001';
        const transaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        };

        const result = await analyzer.analyzeBehavior(userId, transaction);

        expect(result).toBeDefined();
        expect(result.userId).toBe(userId);
        expect(result.isDeviation).toBeDefined();
        expect(result.deviationScore).toBeGreaterThanOrEqual(0);
        expect(result.deviationScore).toBeLessThanOrEqual(100);
      });

      it('should identify normal behavior', async () => {
        const userId = 'user-normal';

        // Establish pattern
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Same behavior
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
        expect(result.deviationScore).toBeLessThan(40);
      });

      it('should identify abnormal behavior', async () => {
        const userId = 'user-abnormal';

        // Establish pattern
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Abnormal behavior
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'unknown-device',
          location: 'New York, USA',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationScore).toBeGreaterThan(60);
      });
    });

    describe('Spending Pattern Analysis', () => {
      it('should learn spending patterns', async () => {
        const userId = 'user-spending-pattern';

        // Establish consistent spending pattern
        for (let i = 0; i < 20; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Same pattern should not be deviation
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
      });

      it('should detect spending amount deviations', async () => {
        const userId = 'user-amount-deviation';

        // Establish pattern (50k average)
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Significant deviation
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000, // 100x normal
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationReasons).toContain('spending_amount_deviation');
      });

      it('should detect frequency deviations', async () => {
        const userId = 'user-frequency-deviation';

        // Establish pattern (1 per day)
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Rapid transactions
        for (let i = 0; i < 10; i++) {
          const result = await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() + (i * 360000), // Every 6 minutes
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });

          if (i > 3) {
            expect(result.isDeviation).toBe(true);
            expect(result.deviationReasons).toContain('frequency_deviation');
          }
        }
      });

      it('should detect merchant category deviations', async () => {
        const userId = 'user-merchant-deviation';

        // Establish pattern (grocery only)
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Different category
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationReasons).toContain('merchant_category_deviation');
      });

      it('should detect time-of-day deviations', async () => {
        const userId = 'user-time-deviation';

        // Establish pattern (daytime)
        for (let i = 0; i < 10; i++) {
          const timestamp = new Date();
          timestamp.setHours(10);
          timestamp.setDate(timestamp.getDate() - i);

          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: timestamp.getTime(),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Midnight transaction
        const timestamp = new Date();
        timestamp.setHours(0);

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: timestamp.getTime(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationReasons).toContain('time_of_day_deviation');
      });

      it('should detect device usage deviations', async () => {
        const userId = 'user-device-deviation';

        // Establish pattern (device-001)
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Different device
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'unknown-device',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationReasons).toContain('device_deviation');
      });

      it('should detect location deviations', async () => {
        const userId = 'user-location-deviation';

        // Establish pattern (Lagos)
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Different location
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'New York, USA',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationReasons).toContain('location_deviation');
      });
    });

    describe('Behavior Baseline Establishment', () => {
      it('should establish behavior baseline from first transaction', async () => {
        const userId = 'user-baseline-' + Date.now();

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
      });

      it('should refine baseline with multiple transactions', async () => {
        const userId = 'user-baseline-refine';

        // First 5 transactions establish baseline
        for (let i = 0; i < 5; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Transactions 6-10 refine baseline
        for (let i = 5; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Should recognize pattern
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
      });

      it('should adapt baseline to gradual changes', async () => {
        const userId = 'user-baseline-adapt';

        // Establish initial baseline
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Gradually increase spending
        for (let i = 0; i < 10; i++) {
          const amount = 50000 + (i * 50000);
          await analyzer.analyzeBehavior(userId, {
            amount,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // New baseline should be higher
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 500000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        // Should not be as anomalous
        expect(result.deviationScore).toBeLessThan(60);
      });
    });

    describe('Behavior Pattern Recognition', () => {
      it('should recognize normal behavior patterns', async () => {
        const userId = 'user-pattern-normal';

        // Establish consistent pattern
        for (let i = 0; i < 20; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Same pattern
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
        expect(result.deviationScore).toBeLessThan(30);
      });

      it('should recognize gradual behavior changes', async () => {
        const userId = 'user-pattern-gradual';

        // Gradually increase spending
        for (let i = 0; i < 20; i++) {
          const amount = 50000 + (i * 50000);
          await analyzer.analyzeBehavior(userId, {
            amount,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Slightly higher than latest trend
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 1100000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        // Should not be highly anomalous
        expect(result.deviationScore).toBeLessThan(70);
      });

      it('should recognize sudden behavior changes', async () => {
        const userId = 'user-pattern-sudden';

        // Establish pattern
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Sudden change
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'unknown-device',
          location: 'New York, USA',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationScore).toBeGreaterThan(70);
      });
    });

    describe('Deviation Threshold', () => {
      it('should flag deviations above threshold', async () => {
        const userId = 'user-threshold-high';

        // Establish baseline
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Significant deviation
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000, // 100x baseline
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'unknown-device',
          location: 'Unknown Location',
        });

        expect(result.isDeviation).toBe(true);
        expect(result.deviationScore).toBeGreaterThan(60);
      });

      it('should not flag minor deviations', async () => {
        const userId = 'user-threshold-low';

        // Establish baseline
        for (let i = 0; i < 10; i++) {
          await analyzer.analyzeBehavior(userId, {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now() - (i * 86400000),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }

        // Minor deviation
        const result = await analyzer.analyzeBehavior(userId, {
          amount: 55000, // 10% above baseline
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
        expect(result.deviationScore).toBeLessThan(40);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await analyzer.analyzeBehavior('', {
            amount: 50000,
            merchantCategory: 'grocery',
            timestamp: Date.now(),
            device: 'device-001',
            location: 'Lagos, Nigeria',
          });
        }).not.toThrow();
      });

      it('should handle missing transaction data', async () => {
        const userId = 'user-missing-data';

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: '',
          location: '',
        });

        expect(result).toBeDefined();
      });

      it('should handle invalid amount', async () => {
        const userId = 'user-invalid-amount';

        const result = await analyzer.analyzeBehavior(userId, {
          amount: -50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result).toBeDefined();
      });

      it('should handle null transaction', async () => {
        const userId = 'user-null-tx';

        expect(async () => {
          await analyzer.analyzeBehavior(userId, null as any);
        }).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle first transaction from user', async () => {
        const userId = 'new-user-' + Date.now();

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result.isDeviation).toBe(false);
      });

      it('should handle user with no historical data', async () => {
        const userId = 'no-history-' + Date.now();

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result).toBeDefined();
      });

      it('should handle very limited historical data', async () => {
        const userId = 'limited-history-' + Date.now();

        // Only 1 transaction
        await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - 86400000,
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result).toBeDefined();
      });

      it('should handle zero amount', async () => {
        const userId = 'zero-amount';

        const result = await analyzer.analyzeBehavior(userId, {
          amount: 0,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result).toBeDefined();
      });

      it('should handle maximum amount', async () => {
        const userId = 'max-amount';

        const result = await analyzer.analyzeBehavior(userId, {
          amount: Number.MAX_SAFE_INTEGER,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(result).toBeDefined();
      });
    });

    describe('Performance', () => {
      it('should analyze behavior quickly', async () => {
        const userId = 'perf-user';

        const startTime = performance.now();
        await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
      });

      it('should handle concurrent analysis', async () => {
        const promises = [];

        for (let i = 0; i < 50; i++) {
          promises.push(
            analyzer.analyzeBehavior(`user-concurrent-${i}`, {
              amount: 50000,
              merchantCategory: 'grocery',
              timestamp: Date.now(),
              device: 'device-001',
              location: 'Lagos, Nigeria',
            })
          );
        }

        const results = await Promise.all(promises);

        expect(results.length).toBe(50);
        results.forEach(result => {
          expect(result).toBeDefined();
        });
      });
    });

    describe('Event Publishing', () => {
      it('should publish behavior analysis event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');
        const userId = 'event-user';

        await analyzer.analyzeBehavior(userId, {
          amount: 5000000,
          merchantCategory: 'cryptocurrency',
          timestamp: Date.now(),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });
    });
  });

  describe('getUserBehaviorProfile', () => {
    it('should return user behavior profile', async () => {
      const userId = 'profile-user';

      // Establish pattern
      for (let i = 0; i < 5; i++) {
        await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - (i * 86400000),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });
      }

      const profile = await analyzer.getUserBehaviorProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.transactionCount).toBeGreaterThan(0);
    });

    it('should return empty profile for new user', async () => {
      const userId = 'new-profile-' + Date.now();

      const profile = await analyzer.getUserBehaviorProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.transactionCount).toBe(0);
    });
  });

  describe('resetUserProfile', () => {
    it('should reset user behavior profile', async () => {
      const userId = 'reset-user';

      // Establish pattern
      for (let i = 0; i < 5; i++) {
        await analyzer.analyzeBehavior(userId, {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now() - (i * 86400000),
          device: 'device-001',
          location: 'Lagos, Nigeria',
        });
      }

      // Reset
      await analyzer.resetUserProfile(userId);

      // Next transaction should not be deviation
      const result = await analyzer.analyzeBehavior(userId, {
        amount: 5000000,
        merchantCategory: 'cryptocurrency',
        timestamp: Date.now(),
        device: 'device-001',
        location: 'Lagos, Nigeria',
      });

      expect(result.isDeviation).toBe(false);
    });
  });
});
