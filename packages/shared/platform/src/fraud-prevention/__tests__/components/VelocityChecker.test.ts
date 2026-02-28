import { VelocityChecker } from '../../components/VelocityChecker';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('VelocityChecker', () => {
  let checker: VelocityChecker;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    checker = new VelocityChecker(eventBus, logger);
  });

  describe('checkVelocity', () => {
    describe('Basic Functionality', () => {
      it('should check transaction velocity', async () => {
        const userId = 'user-001';
        const transaction = {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        };

        const result = await checker.checkVelocity(userId, transaction);

        expect(result).toBeDefined();
        expect(result.violatesLimit).toBeDefined();
        expect(typeof result.violatesLimit).toBe('boolean');
        expect(result.currentVelocity).toBeDefined();
        expect(result.limit).toBeDefined();
      });

      it('should allow normal velocity', async () => {
        const userId = 'user-002';

        for (let i = 0; i < 5; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 3600000), // Every hour
          });

          expect(result.violatesLimit).toBe(false);
        }
      });

      it('should flag high velocity', async () => {
        const userId = 'user-003';

        // Rapid transactions
        for (let i = 0; i < 15; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 60000), // Every minute
          });

          if (i > 9) {
            expect(result.violatesLimit).toBe(true);
          }
        }
      });
    });

    describe('Transaction Velocity', () => {
      it('should track transaction count per hour', async () => {
        const userId = 'user-tx-velocity';

        // Add 10 transactions within an hour
        for (let i = 0; i < 10; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000), // Every 6 minutes
          });

          expect(result.violatesLimit).toBe(false);
        }

        // 11th transaction should exceed limit
        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (10 * 360000),
        });

        expect(result.violatesLimit).toBe(true);
        expect(result.currentVelocity).toBeGreaterThan(10);
      });

      it('should reset velocity after time window', async () => {
        const userId = 'user-tx-reset';

        // Add 10 transactions
        for (let i = 0; i < 10; i++) {
          await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000),
          });
        }

        // After 1 hour, velocity should reset
        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (3600000 + 360000), // After 1 hour
        });

        expect(result.violatesLimit).toBe(false);
      });

      it('should track velocity per user', async () => {
        const user1 = 'user-velocity-1';
        const user2 = 'user-velocity-2';

        // User 1: 10 transactions
        for (let i = 0; i < 10; i++) {
          await checker.checkVelocity(user1, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000),
          });
        }

        // User 2: 1 transaction
        const result = await checker.checkVelocity(user2, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result.violatesLimit).toBe(false);
        expect(result.currentVelocity).toBe(1);
      });
    });

    describe('Withdrawal Velocity', () => {
      it('should track withdrawal count per day', async () => {
        const userId = 'user-withdrawal';

        // Add 5 withdrawals within a day
        for (let i = 0; i < 5; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'withdrawal',
            amount: 500000,
            timestamp: Date.now() + (i * 3600000), // Every hour
          });

          expect(result.violatesLimit).toBe(false);
        }

        // 6th withdrawal should exceed limit
        const result = await checker.checkVelocity(userId, {
          type: 'withdrawal',
          amount: 500000,
          timestamp: Date.now() + (5 * 3600000),
        });

        expect(result.violatesLimit).toBe(true);
      });

      it('should track withdrawal amount per day', async () => {
        const userId = 'user-withdrawal-amount';

        // Withdrawals totaling 2M NGN
        for (let i = 0; i < 4; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'withdrawal',
            amount: 500000,
            timestamp: Date.now() + (i * 3600000),
          });

          expect(result.violatesLimit).toBe(false);
        }

        // 5th withdrawal (total 2.5M) should exceed 2M limit
        const result = await checker.checkVelocity(userId, {
          type: 'withdrawal',
          amount: 500000,
          timestamp: Date.now() + (4 * 3600000),
        });

        expect(result.violatesLimit).toBe(true);
      });

      it('should reset withdrawal velocity after 24 hours', async () => {
        const userId = 'user-withdrawal-reset';

        // Add 5 withdrawals
        for (let i = 0; i < 5; i++) {
          await checker.checkVelocity(userId, {
            type: 'withdrawal',
            amount: 500000,
            timestamp: Date.now() + (i * 3600000),
          });
        }

        // After 24 hours, velocity should reset
        const result = await checker.checkVelocity(userId, {
          type: 'withdrawal',
          amount: 500000,
          timestamp: Date.now() + (86400000 + 3600000), // After 24 hours
        });

        expect(result.violatesLimit).toBe(false);
      });
    });

    describe('Account Change Velocity', () => {
      it('should track account change count per week', async () => {
        const userId = 'user-account-change';

        // Add 3 account changes within a week
        for (let i = 0; i < 3; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'account_change',
            changeType: 'email_change',
            timestamp: Date.now() + (i * 86400000), // Every day
          });

          expect(result.violatesLimit).toBe(false);
        }

        // 4th account change should exceed limit
        const result = await checker.checkVelocity(userId, {
          type: 'account_change',
          changeType: 'email_change',
          timestamp: Date.now() + (3 * 86400000),
        });

        expect(result.violatesLimit).toBe(true);
      });

      it('should reset account change velocity after 7 days', async () => {
        const userId = 'user-account-change-reset';

        // Add 3 account changes
        for (let i = 0; i < 3; i++) {
          await checker.checkVelocity(userId, {
            type: 'account_change',
            changeType: 'password_change',
            timestamp: Date.now() + (i * 86400000),
          });
        }

        // After 7 days, velocity should reset
        const result = await checker.checkVelocity(userId, {
          type: 'account_change',
          changeType: 'password_change',
          timestamp: Date.now() + (604800000 + 86400000), // After 7 days
        });

        expect(result.violatesLimit).toBe(false);
      });
    });

    describe('Velocity Limits Configuration', () => {
      it('should use default transaction limit', async () => {
        const userId = 'user-default-tx-limit';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result.limit).toBe(10); // Default transaction limit per hour
      });

      it('should use default withdrawal limit', async () => {
        const userId = 'user-default-withdrawal-limit';

        const result = await checker.checkVelocity(userId, {
          type: 'withdrawal',
          amount: 500000,
          timestamp: Date.now(),
        });

        expect(result.limit).toBe(5); // Default withdrawal limit per day
      });

      it('should use default account change limit', async () => {
        const userId = 'user-default-account-change-limit';

        const result = await checker.checkVelocity(userId, {
          type: 'account_change',
          changeType: 'email_change',
          timestamp: Date.now(),
        });

        expect(result.limit).toBe(3); // Default account change limit per week
      });

      it('should allow custom velocity limits', async () => {
        const userId = 'user-custom-limits';

        // Set custom limits
        await checker.setVelocityLimit('transaction', 20); // 20 per hour

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result.limit).toBe(20);
      });
    });

    describe('Velocity Metrics', () => {
      it('should return current velocity', async () => {
        const userId = 'user-current-velocity';

        for (let i = 0; i < 5; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000),
          });

          expect(result.currentVelocity).toBe(i + 1);
        }
      });

      it('should return velocity percentage', async () => {
        const userId = 'user-velocity-percentage';

        for (let i = 0; i < 5; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000),
          });

          expect(result.velocityPercentage).toBeDefined();
          expect(result.velocityPercentage).toBeGreaterThanOrEqual(0);
          expect(result.velocityPercentage).toBeLessThanOrEqual(100);
        }
      });

      it('should return time until reset', async () => {
        const userId = 'user-time-to-reset';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result.timeUntilReset).toBeDefined();
        expect(result.timeUntilReset).toBeGreaterThan(0);
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await checker.checkVelocity('', {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now(),
          });
        }).not.toThrow();
      });

      it('should handle invalid transaction type', async () => {
        const userId = 'user-invalid-type';

        const result = await checker.checkVelocity(userId, {
          type: 'invalid_type',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle missing amount', async () => {
        const userId = 'user-no-amount';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: undefined as any,
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle invalid timestamp', async () => {
        const userId = 'user-bad-timestamp';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: -1,
        });

        expect(result).toBeDefined();
      });

      it('should handle null transaction', async () => {
        const userId = 'user-null-tx';

        expect(async () => {
          await checker.checkVelocity(userId, null as any);
        }).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle first transaction from user', async () => {
        const userId = 'new-user-' + Date.now();

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });

        expect(result.violatesLimit).toBe(false);
        expect(result.currentVelocity).toBe(1);
      });

      it('should handle zero amount', async () => {
        const userId = 'user-zero-amount';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 0,
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle maximum amount', async () => {
        const userId = 'user-max-amount';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: Number.MAX_SAFE_INTEGER,
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle negative amount', async () => {
        const userId = 'user-negative-amount';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: -50000,
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle very old timestamp', async () => {
        const userId = 'user-old-timestamp';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() - (365 * 86400000), // 1 year ago
        });

        expect(result).toBeDefined();
      });

      it('should handle future timestamp', async () => {
        const userId = 'user-future-timestamp';

        const result = await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (86400000), // 1 day in future
        });

        expect(result).toBeDefined();
      });

      it('should handle multiple transactions at same timestamp', async () => {
        const userId = 'user-same-timestamp';
        const timestamp = Date.now();

        for (let i = 0; i < 5; i++) {
          const result = await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp,
          });

          expect(result.currentVelocity).toBe(i + 1);
        }
      });
    });

    describe('Performance', () => {
      it('should check velocity quickly', async () => {
        const userId = 'perf-user';

        const startTime = performance.now();
        await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now(),
        });
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
      });

      it('should handle concurrent velocity checks', async () => {
        const promises = [];

        for (let i = 0; i < 100; i++) {
          promises.push(
            checker.checkVelocity(`user-concurrent-${i}`, {
              type: 'transaction',
              amount: 50000,
              timestamp: Date.now(),
            })
          );
        }

        const results = await Promise.all(promises);

        expect(results.length).toBe(100);
        results.forEach(result => {
          expect(result).toBeDefined();
        });
      });
    });

    describe('Event Publishing', () => {
      it('should publish velocity check event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');
        const userId = 'event-user';

        // Trigger velocity violation
        for (let i = 0; i < 15; i++) {
          await checker.checkVelocity(userId, {
            type: 'transaction',
            amount: 50000,
            timestamp: Date.now() + (i * 360000),
          });
        }

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });
    });
  });

  describe('getVelocityStatus', () => {
    it('should return velocity status', async () => {
      const userId = 'status-user';

      // Add some transactions
      for (let i = 0; i < 5; i++) {
        await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (i * 360000),
        });
      }

      const status = await checker.getVelocityStatus(userId);

      expect(status).toBeDefined();
      expect(status.userId).toBe(userId);
    });
  });

  describe('resetVelocity', () => {
    it('should reset user velocity', async () => {
      const userId = 'reset-user';

      // Add transactions
      for (let i = 0; i < 10; i++) {
        await checker.checkVelocity(userId, {
          type: 'transaction',
          amount: 50000,
          timestamp: Date.now() + (i * 360000),
        });
      }

      // Reset
      await checker.resetVelocity(userId);

      // Next transaction should not violate
      const result = await checker.checkVelocity(userId, {
        type: 'transaction',
        amount: 50000,
        timestamp: Date.now() + (11 * 360000),
      });

      expect(result.currentVelocity).toBe(1);
    });
  });

  describe('setVelocityLimit', () => {
    it('should set custom velocity limit', async () => {
      await checker.setVelocityLimit('transaction', 20);

      const userId = 'custom-limit-user';
      const result = await checker.checkVelocity(userId, {
        type: 'transaction',
        amount: 50000,
        timestamp: Date.now(),
      });

      expect(result.limit).toBe(20);
    });
  });

  describe('getVelocityLimits', () => {
    it('should return all velocity limits', async () => {
      const limits = await checker.getVelocityLimits();

      expect(limits).toBeDefined();
      expect(limits.transaction).toBeDefined();
      expect(limits.withdrawal).toBeDefined();
      expect(limits.account_change).toBeDefined();
    });
  });
});
