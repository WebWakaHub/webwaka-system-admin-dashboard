import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface BehaviorProfile {
  userId: string;
  spendingPatterns: SpendingPattern[];
  transactionFrequency: number;
  merchantPreferences: Map<string, number>;
  timeOfDayPreferences: Map<number, number>;
  devicePreferences: Map<string, number>;
  locationPreferences: Map<string, number>;
  lastUpdated: number;
}

export interface SpendingPattern {
  amount: number;
  frequency: number;
  timestamp: number;
}

export interface BehaviorDeviation {
  userId: string;
  deviationType: 'spending' | 'frequency' | 'merchant' | 'time' | 'device' | 'location';
  deviationScore: number; // 0-100
  isSignificant: boolean;
  timestamp: number;
}

export class BehavioralAnalyzer {
  private eventBus: EventBus;
  private logger: Logger;
  private behaviorProfiles: Map<string, BehaviorProfile> = new Map();
  private deviationThreshold: number = 70;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.behavior.analysis.requested', (event: any) => {
      this.analyzeBehavior(event.data.userId, event.data.transaction);
    });
  }

  async analyzeBehavior(userId: string, transaction: any): Promise<BehaviorDeviation[]> {
    try {
      // Get or create behavior profile
      let profile = this.behaviorProfiles.get(userId);
      if (!profile) {
        profile = this.createDefaultProfile(userId);
      }

      const deviations: BehaviorDeviation[] = [];

      // Analyze spending pattern
      const spendingDeviation = this.analyzeSpendingPattern(profile, transaction.amount);
      if (spendingDeviation.isSignificant) {
        deviations.push(spendingDeviation);
      }

      // Analyze transaction frequency
      const frequencyDeviation = this.analyzeFrequency(profile);
      if (frequencyDeviation.isSignificant) {
        deviations.push(frequencyDeviation);
      }

      // Analyze merchant preference
      const merchantDeviation = this.analyzeMerchantPreference(
        profile,
        transaction.merchantCategory
      );
      if (merchantDeviation.isSignificant) {
        deviations.push(merchantDeviation);
      }

      // Analyze time-of-day preference
      const timeDeviation = this.analyzeTimeOfDayPreference(profile, transaction.timestamp);
      if (timeDeviation.isSignificant) {
        deviations.push(timeDeviation);
      }

      // Analyze device preference
      const deviceDeviation = this.analyzeDevicePreference(profile, transaction.device);
      if (deviceDeviation.isSignificant) {
        deviations.push(deviceDeviation);
      }

      // Analyze location preference
      const locationDeviation = this.analyzeLocationPreference(profile, transaction.location);
      if (locationDeviation.isSignificant) {
        deviations.push(locationDeviation);
      }

      // Update behavior profile
      this.updateBehaviorProfile(userId, transaction);

      // Publish behavior analysis event
      this.eventBus.publish('fraud.behavior.analyzed', {
        userId,
        deviations,
        timestamp: Date.now(),
      });

      if (deviations.length > 0) {
        this.logger.info(
          `Behavior deviations detected for user ${userId}: ${deviations.length} deviations`
        );
      }

      return deviations;
    } catch (error) {
      this.logger.error(`Error analyzing behavior for user ${userId}:`, error);
      throw error;
    }
  }

  private createDefaultProfile(userId: string): BehaviorProfile {
    return {
      userId,
      spendingPatterns: [],
      transactionFrequency: 0,
      merchantPreferences: new Map(),
      timeOfDayPreferences: new Map(),
      devicePreferences: new Map(),
      locationPreferences: new Map(),
      lastUpdated: Date.now(),
    };
  }

  private analyzeSpendingPattern(profile: BehaviorProfile, amount: number): BehaviorDeviation {
    if (profile.spendingPatterns.length === 0) {
      return {
        userId: profile.userId,
        deviationType: 'spending',
        deviationScore: 0,
        isSignificant: false,
        timestamp: Date.now(),
      };
    }

    const avgSpending =
      profile.spendingPatterns.reduce((sum, p) => sum + p.amount, 0) /
      profile.spendingPatterns.length;
    const deviation = Math.abs(amount - avgSpending) / avgSpending;
    const score = Math.min(100, deviation * 50);

    return {
      userId: profile.userId,
      deviationType: 'spending',
      deviationScore: Math.round(score),
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private analyzeFrequency(profile: BehaviorProfile): BehaviorDeviation {
    const expectedFrequency = 5; // Expected 5 transactions per day
    const actualFrequency = profile.transactionFrequency;
    const deviation = Math.abs(actualFrequency - expectedFrequency) / expectedFrequency;
    const score = Math.min(100, deviation * 50);

    return {
      userId: profile.userId,
      deviationType: 'frequency',
      deviationScore: Math.round(score),
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private analyzeMerchantPreference(
    profile: BehaviorProfile,
    merchantCategory: string
  ): BehaviorDeviation {
    const preference = profile.merchantPreferences.get(merchantCategory) || 0;
    const score = preference === 0 ? 80 : Math.max(0, 50 - preference * 10);

    return {
      userId: profile.userId,
      deviationType: 'merchant',
      deviationScore: score,
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private analyzeTimeOfDayPreference(profile: BehaviorProfile, timestamp: number): BehaviorDeviation {
    const hour = new Date(timestamp).getHours();
    const preference = profile.timeOfDayPreferences.get(hour) || 0;
    const score = preference === 0 ? 75 : Math.max(0, 50 - preference * 10);

    return {
      userId: profile.userId,
      deviationType: 'time',
      deviationScore: score,
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private analyzeDevicePreference(profile: BehaviorProfile, device: string): BehaviorDeviation {
    const preference = profile.devicePreferences.get(device) || 0;
    const score = preference === 0 ? 85 : Math.max(0, 50 - preference * 10);

    return {
      userId: profile.userId,
      deviationType: 'device',
      deviationScore: score,
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private analyzeLocationPreference(profile: BehaviorProfile, location: string): BehaviorDeviation {
    const preference = profile.locationPreferences.get(location) || 0;
    const score = preference === 0 ? 80 : Math.max(0, 50 - preference * 10);

    return {
      userId: profile.userId,
      deviationType: 'location',
      deviationScore: score,
      isSignificant: score > this.deviationThreshold,
      timestamp: Date.now(),
    };
  }

  private updateBehaviorProfile(userId: string, transaction: any): void {
    let profile = this.behaviorProfiles.get(userId);
    if (!profile) {
      profile = this.createDefaultProfile(userId);
    }

    // Update spending patterns
    profile.spendingPatterns.push({
      amount: transaction.amount,
      frequency: 1,
      timestamp: transaction.timestamp,
    });

    // Keep only last 30 patterns
    if (profile.spendingPatterns.length > 30) {
      profile.spendingPatterns.shift();
    }

    // Update transaction frequency
    profile.transactionFrequency++;

    // Update merchant preferences
    const merchantCount = (profile.merchantPreferences.get(transaction.merchantCategory) || 0) + 1;
    profile.merchantPreferences.set(transaction.merchantCategory, merchantCount);

    // Update time-of-day preferences
    const hour = new Date(transaction.timestamp).getHours();
    const timeCount = (profile.timeOfDayPreferences.get(hour) || 0) + 1;
    profile.timeOfDayPreferences.set(hour, timeCount);

    // Update device preferences
    const deviceCount = (profile.devicePreferences.get(transaction.device) || 0) + 1;
    profile.devicePreferences.set(transaction.device, deviceCount);

    // Update location preferences
    const locationCount = (profile.locationPreferences.get(transaction.location) || 0) + 1;
    profile.locationPreferences.set(transaction.location, locationCount);

    profile.lastUpdated = Date.now();
    this.behaviorProfiles.set(userId, profile);
  }

  getBehaviorProfile(userId: string): BehaviorProfile | undefined {
    return this.behaviorProfiles.get(userId);
  }

  setDeviationThreshold(threshold: number): void {
    this.deviationThreshold = threshold;
    this.logger.info(`Deviation threshold set to ${threshold}`);
  }
}
