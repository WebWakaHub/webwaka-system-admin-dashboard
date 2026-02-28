import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface VelocityLimit {
  type: 'transaction' | 'withdrawal' | 'account_change';
  timeWindow: number; // milliseconds
  maxCount: number;
  maxAmount?: number;
}

export interface VelocityCheck {
  userId: string;
  checkType: 'transaction' | 'withdrawal' | 'account_change';
  currentCount: number;
  limit: number;
  exceeded: boolean;
  timestamp: number;
}

export class VelocityChecker {
  private eventBus: EventBus;
  private logger: Logger;
  private velocityLimits: Map<string, VelocityLimit> = new Map();
  private userVelocity: Map<string, Map<string, number[]>> = new Map();

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
    this.loadDefaultLimits();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.velocity.check.requested', (event: any) => {
      this.checkVelocity(event.data.userId, event.data.checkType);
    });
  }

  private loadDefaultLimits(): void {
    // Load default velocity limits
    const defaultLimits: VelocityLimit[] = [
      {
        type: 'transaction',
        timeWindow: 60 * 60 * 1000, // 1 hour
        maxCount: 10,
        maxAmount: 5000000, // 5M NGN
      },
      {
        type: 'withdrawal',
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        maxCount: 5,
        maxAmount: 2000000, // 2M NGN
      },
      {
        type: 'account_change',
        timeWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxCount: 3,
      },
    ];

    defaultLimits.forEach((limit) => {
      const key = `${limit.type}_${limit.timeWindow}`;
      this.velocityLimits.set(key, limit);
    });
  }

  async checkVelocity(userId: string, checkType: 'transaction' | 'withdrawal' | 'account_change'): Promise<VelocityCheck> {
    try {
      // Get or create user velocity tracking
      let userVelocityMap = this.userVelocity.get(userId);
      if (!userVelocityMap) {
        userVelocityMap = new Map();
        this.userVelocity.set(userId, userVelocityMap);
      }

      // Get the velocity limit for this check type
      const limit = this.getVelocityLimit(checkType);
      if (!limit) {
        throw new Error(`No velocity limit found for type ${checkType}`);
      }

      // Get current velocity for this user and check type
      const key = `${checkType}_${limit.timeWindow}`;
      let timestamps = userVelocityMap.get(key) || [];

      // Remove old timestamps outside the time window
      const now = Date.now();
      timestamps = timestamps.filter((ts) => now - ts < limit.timeWindow);

      // Check if velocity limit is exceeded
      const exceeded = timestamps.length >= limit.maxCount;

      // Add current timestamp
      timestamps.push(now);
      userVelocityMap.set(key, timestamps);

      const result: VelocityCheck = {
        userId,
        checkType,
        currentCount: timestamps.length,
        limit: limit.maxCount,
        exceeded,
        timestamp: now,
      };

      // Publish velocity check event
      this.eventBus.publish('fraud.velocity.checked', result);

      if (exceeded) {
        this.logger.warn(
          `Velocity limit exceeded for user ${userId}, type: ${checkType}, count: ${timestamps.length}/${limit.maxCount}`
        );
        this.eventBus.publish('fraud.velocity.limit.exceeded', result);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error checking velocity for user ${userId}:`, error);
      throw error;
    }
  }

  private getVelocityLimit(checkType: string): VelocityLimit | undefined {
    // Get the default limit for this check type
    for (const [, limit] of this.velocityLimits) {
      if (limit.type === checkType) {
        return limit;
      }
    }
    return undefined;
  }

  setVelocityLimit(limit: VelocityLimit): void {
    const key = `${limit.type}_${limit.timeWindow}`;
    this.velocityLimits.set(key, limit);
    this.logger.info(`Velocity limit set for type ${limit.type}: ${limit.maxCount} per ${limit.timeWindow}ms`);
  }

  getVelocityLimits(): VelocityLimit[] {
    return Array.from(this.velocityLimits.values());
  }

  resetUserVelocity(userId: string): void {
    this.userVelocity.delete(userId);
    this.logger.info(`Velocity tracking reset for user ${userId}`);
  }

  getUserVelocityCount(userId: string, checkType: string): number {
    const userVelocityMap = this.userVelocity.get(userId);
    if (!userVelocityMap) return 0;

    const limit = this.getVelocityLimit(checkType);
    if (!limit) return 0;

    const key = `${checkType}_${limit.timeWindow}`;
    const timestamps = userVelocityMap.get(key) || [];

    // Remove old timestamps
    const now = Date.now();
    return timestamps.filter((ts) => now - ts < limit.timeWindow).length;
  }
}
