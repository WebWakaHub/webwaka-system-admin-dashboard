import { AccountMonitor } from '../../components/AccountMonitor';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('AccountMonitor', () => {
  let monitor: AccountMonitor;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    monitor = new AccountMonitor(eventBus, logger);
  });

  describe('monitorAccount', () => {
    describe('Basic Functionality', () => {
      it('should monitor account activity', async () => {
        const userId = 'user-001';
        const activity = {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        };

        const result = await monitor.monitorAccount(userId, activity);

        expect(result).toBeDefined();
        expect(result.userId).toBe(userId);
        expect(result.suspicious).toBeDefined();
        expect(typeof result.suspicious).toBe('boolean');
      });

      it('should detect normal account activity', async () => {
        const userId = 'user-002';
        const activity = {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        };

        const result = await monitor.monitorAccount(userId, activity);

        expect(result.suspicious).toBe(false);
      });

      it('should detect suspicious account activity', async () => {
        const userId = 'user-003';
        
        // Establish normal pattern
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // Suspicious activity (new device, new location)
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'unknown-device',
          location: 'New York, USA',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(true);
      });
    });

    describe('Login Pattern Detection', () => {
      it('should detect normal login patterns', async () => {
        const userId = 'user-login-normal';

        // Establish normal pattern
        for (let i = 0; i < 5; i++) {
          const timestamp = new Date();
          timestamp.setHours(10);
          timestamp.setDate(timestamp.getDate() - i);

          await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: timestamp.getTime(),
          });
        }

        // Same pattern
        const timestamp = new Date();
        timestamp.setHours(10);

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: timestamp.getTime(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should detect abnormal login patterns', async () => {
        const userId = 'user-login-abnormal';

        // Establish normal pattern (daytime)
        for (let i = 0; i < 5; i++) {
          const timestamp = new Date();
          timestamp.setHours(10);
          timestamp.setDate(timestamp.getDate() - i);

          await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: timestamp.getTime(),
          });
        }

        // Abnormal pattern (midnight)
        const timestamp = new Date();
        timestamp.setHours(0);

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: timestamp.getTime(),
        });

        expect(result.suspicious).toBe(true);
      });

      it('should detect rapid logins', async () => {
        const userId = 'user-rapid-login';

        // Rapid logins
        for (let i = 0; i < 10; i++) {
          const result = await monitor.monitorAccount(userId, {
            type: 'login',
            device: `device-${i}`,
            location: 'Lagos, Nigeria',
            timestamp: Date.now() + (i * 60000), // Every minute
          });

          if (i > 3) {
            expect(result.suspicious).toBe(true);
          }
        }
      });
    });

    describe('Device Change Detection', () => {
      it('should detect new devices', async () => {
        const userId = 'user-device-new';

        // Establish normal device
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // New device
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'unknown-device-xyz',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(true);
        expect(result.reasons).toContain('new_device');
      });

      it('should not flag known devices', async () => {
        const userId = 'user-device-known';

        // Establish device
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // Same device
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should detect rapid device changes', async () => {
        const userId = 'user-device-rapid';

        // Rapid device changes
        for (let i = 0; i < 5; i++) {
          const result = await monitor.monitorAccount(userId, {
            type: 'login',
            device: `device-${i}`,
            location: 'Lagos, Nigeria',
            timestamp: Date.now() + (i * 60000),
          });

          if (i > 1) {
            expect(result.suspicious).toBe(true);
          }
        }
      });
    });

    describe('Location Change Detection', () => {
      it('should detect new locations', async () => {
        const userId = 'user-location-new';

        // Establish normal location
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // New location
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'New York, USA',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(true);
        expect(result.reasons).toContain('new_location');
      });

      it('should not flag known locations', async () => {
        const userId = 'user-location-known';

        // Establish location
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // Same location
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should detect impossible travel', async () => {
        const userId = 'user-impossible-travel';

        // Location 1
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 60000, // 1 minute ago
        });

        // Location 2 (impossible to reach in 1 minute)
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'New York, USA',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(true);
        expect(result.reasons).toContain('impossible_travel');
      });

      it('should detect rapid location changes', async () => {
        const userId = 'user-location-rapid';
        const locations = ['Lagos, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria', 'Kano, Nigeria'];

        // Rapid location changes
        for (let i = 0; i < locations.length; i++) {
          const result = await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: locations[i],
            timestamp: Date.now() + (i * 3600000), // Every hour
          });

          if (i > 1) {
            expect(result.suspicious).toBe(true);
          }
        }
      });
    });

    describe('Account Change Detection', () => {
      it('should detect account modifications', async () => {
        const userId = 'user-account-change';

        // Establish normal account
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // Account change
        const result = await monitor.monitorAccount(userId, {
          type: 'account_change',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
          changeType: 'password_change',
        });

        expect(result).toBeDefined();
      });

      it('should detect rapid account changes', async () => {
        const userId = 'user-account-rapid';

        // Rapid account changes
        for (let i = 0; i < 5; i++) {
          const result = await monitor.monitorAccount(userId, {
            type: 'account_change',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now() + (i * 60000),
            changeType: 'email_change',
          });

          if (i > 2) {
            expect(result.suspicious).toBe(true);
          }
        }
      });
    });

    describe('Account Takeover Detection', () => {
      it('should detect account takeover indicators', async () => {
        const userId = 'user-takeover';

        // Establish normal pattern
        for (let i = 0; i < 5; i++) {
          await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        // Takeover indicators
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'unknown-device',
          location: 'New York, USA',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(true);
        expect(result.takeover_risk).toBeGreaterThan(50);
      });

      it('should calculate takeover risk score', async () => {
        const userId = 'user-takeover-score';

        // Establish normal pattern
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - 86400000,
        });

        // Multiple takeover indicators
        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'unknown-device',
          location: 'Unknown Location',
          timestamp: Date.now(),
        });

        expect(result.takeover_risk).toBeDefined();
        expect(result.takeover_risk).toBeGreaterThanOrEqual(0);
        expect(result.takeover_risk).toBeLessThanOrEqual(100);
      });
    });

    describe('Suspicious Activity Tracking', () => {
      it('should track suspicious activities', async () => {
        const userId = 'user-suspicious-track';

        // Multiple suspicious activities
        for (let i = 0; i < 3; i++) {
          await monitor.monitorAccount(userId, {
            type: 'login',
            device: `device-${i}`,
            location: `Location ${i}`,
            timestamp: Date.now() + (i * 60000),
          });
        }

        const activities = await monitor.getSuspiciousActivities(userId);

        expect(Array.isArray(activities)).toBe(true);
        expect(activities.length).toBeGreaterThan(0);
      });

      it('should return activity history', async () => {
        const userId = 'user-activity-history';

        // Multiple activities
        for (let i = 0; i < 5; i++) {
          await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now() - (i * 86400000),
          });
        }

        const activities = await monitor.getSuspiciousActivities(userId);

        expect(activities).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should handle missing user ID', async () => {
        expect(async () => {
          await monitor.monitorAccount('', {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now(),
          });
        }).not.toThrow();
      });

      it('should handle missing activity type', async () => {
        const userId = 'user-error-type';

        expect(async () => {
          await monitor.monitorAccount(userId, {
            type: '',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now(),
          });
        }).not.toThrow();
      });

      it('should handle missing device', async () => {
        const userId = 'user-error-device';

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: '',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle missing location', async () => {
        const userId = 'user-error-location';

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: '',
          timestamp: Date.now(),
        });

        expect(result).toBeDefined();
      });

      it('should handle invalid timestamp', async () => {
        const userId = 'user-error-timestamp';

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: -1,
        });

        expect(result).toBeDefined();
      });

      it('should handle null activity', async () => {
        const userId = 'user-error-null';

        expect(async () => {
          await monitor.monitorAccount(userId, null as any);
        }).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle first login from user', async () => {
        const userId = 'new-user-' + Date.now();

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should handle first device for user', async () => {
        const userId = 'first-device-' + Date.now();

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should handle first location for user', async () => {
        const userId = 'first-location-' + Date.now();

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });

        expect(result.suspicious).toBe(false);
      });

      it('should handle multiple activities in quick succession', async () => {
        const userId = 'quick-succession';

        for (let i = 0; i < 10; i++) {
          const result = await monitor.monitorAccount(userId, {
            type: 'login',
            device: 'device-001',
            location: 'Lagos, Nigeria',
            timestamp: Date.now() + (i * 1000), // Every second
          });

          expect(result).toBeDefined();
        }
      });

      it('should handle very old timestamps', async () => {
        const userId = 'old-timestamp';

        const result = await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now() - (365 * 86400000), // 1 year ago
        });

        expect(result).toBeDefined();
      });
    });

    describe('Performance', () => {
      it('should monitor account quickly', async () => {
        const userId = 'perf-user';

        const startTime = performance.now();
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'device-001',
          location: 'Lagos, Nigeria',
          timestamp: Date.now(),
        });
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
      });

      it('should handle concurrent monitoring', async () => {
        const promises = [];

        for (let i = 0; i < 50; i++) {
          promises.push(
            monitor.monitorAccount(`user-concurrent-${i}`, {
              type: 'login',
              device: 'device-001',
              location: 'Lagos, Nigeria',
              timestamp: Date.now(),
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
      it('should publish account monitoring event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');
        const userId = 'event-user';

        await monitor.monitorAccount(userId, {
          type: 'login',
          device: 'unknown-device',
          location: 'Unknown Location',
          timestamp: Date.now(),
        });

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });
    });
  });

  describe('getAccountProfile', () => {
    it('should return account profile', async () => {
      const userId = 'profile-user';

      // Establish profile
      await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'device-001',
        location: 'Lagos, Nigeria',
        timestamp: Date.now(),
      });

      const profile = await monitor.getAccountProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
    });

    it('should return empty profile for new user', async () => {
      const userId = 'new-profile-' + Date.now();

      const profile = await monitor.getAccountProfile(userId);

      expect(profile).toBeDefined();
    });
  });

  describe('resetAccountProfile', () => {
    it('should reset account profile', async () => {
      const userId = 'reset-user';

      // Establish profile
      await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'device-001',
        location: 'Lagos, Nigeria',
        timestamp: Date.now(),
      });

      // Reset
      await monitor.resetAccountProfile(userId);

      // Next activity should not be suspicious
      const result = await monitor.monitorAccount(userId, {
        type: 'login',
        device: 'unknown-device',
        location: 'Unknown Location',
        timestamp: Date.now(),
      });

      expect(result.suspicious).toBe(false);
    });
  });

  describe('getSuspiciousActivities', () => {
    it('should return suspicious activities', async () => {
      const userId = 'suspicious-user';

      // Create suspicious activities
      for (let i = 0; i < 3; i++) {
        await monitor.monitorAccount(userId, {
          type: 'login',
          device: `device-${i}`,
          location: `Location ${i}`,
          timestamp: Date.now() + (i * 60000),
        });
      }

      const activities = await monitor.getSuspiciousActivities(userId);

      expect(Array.isArray(activities)).toBe(true);
    });

    it('should return empty list for user with no suspicious activities', async () => {
      const userId = 'normal-user-' + Date.now();

      const activities = await monitor.getSuspiciousActivities(userId);

      expect(Array.isArray(activities)).toBe(true);
    });
  });
});
