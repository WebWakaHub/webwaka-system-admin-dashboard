import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface UserBehavior {
  userId: string;
  spendingPattern: number[];
  transactionFrequency: number;
  merchantCategories: string[];
  timeOfDayPattern: number[];
  deviceUsagePattern: string[];
  lastUpdated: number;
}

export interface AnomalyScore {
  userId: string;
  anomalyScore: number; // 0-100
  isAnomaly: boolean;
  detectedAnomalies: string[];
  timestamp: number;
}

export class AnomalyDetector {
  private eventBus: EventBus;
  private logger: Logger;
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private anomalyThreshold: number = 60;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.anomaly.detection.requested', (event: any) => {
      this.detectAnomalies(event.data.userId, event.data.transaction);
    });
  }

  async detectAnomalies(userId: string, transaction: any): Promise<AnomalyScore> {
    try {
      // Get or create user behavior profile
      let behavior = this.userBehaviors.get(userId);
      if (!behavior) {
        behavior = this.createDefaultBehavior(userId);
      }

      let anomalyScore = 0;
      const detectedAnomalies: string[] = [];

      // Check spending pattern anomaly
      const spendingAnomaly = this.checkSpendingPatternAnomaly(
        transaction.amount,
        behavior.spendingPattern
      );
      if (spendingAnomaly > 50) {
        anomalyScore += spendingAnomaly * 0.25;
        detectedAnomalies.push('spending_pattern_anomaly');
      }

      // Check transaction frequency anomaly
      const frequencyAnomaly = this.checkFrequencyAnomaly(behavior.transactionFrequency);
      if (frequencyAnomaly > 50) {
        anomalyScore += frequencyAnomaly * 0.20;
        detectedAnomalies.push('frequency_anomaly');
      }

      // Check merchant category anomaly
      const merchantAnomaly = this.checkMerchantAnomaly(
        transaction.merchantCategory,
        behavior.merchantCategories
      );
      if (merchantAnomaly > 50) {
        anomalyScore += merchantAnomaly * 0.20;
        detectedAnomalies.push('merchant_category_anomaly');
      }

      // Check time-of-day anomaly
      const timeAnomaly = this.checkTimeOfDayAnomaly(
        new Date(transaction.timestamp).getHours(),
        behavior.timeOfDayPattern
      );
      if (timeAnomaly > 50) {
        anomalyScore += timeAnomaly * 0.15;
        detectedAnomalies.push('time_of_day_anomaly');
      }

      // Check device usage anomaly
      const deviceAnomaly = this.checkDeviceAnomaly(
        transaction.device,
        behavior.deviceUsagePattern
      );
      if (deviceAnomaly > 50) {
        anomalyScore += deviceAnomaly * 0.20;
        detectedAnomalies.push('device_anomaly');
      }

      // Normalize score
      anomalyScore = Math.min(100, Math.max(0, anomalyScore));

      const result: AnomalyScore = {
        userId,
        anomalyScore: Math.round(anomalyScore),
        isAnomaly: anomalyScore > this.anomalyThreshold,
        detectedAnomalies,
        timestamp: Date.now(),
      };

      // Update user behavior profile
      this.updateBehaviorProfile(userId, transaction);

      // Publish anomaly detection event
      this.eventBus.publish('fraud.anomaly.detected', result);

      this.logger.info(
        `Anomaly detection for user ${userId}: score ${result.anomalyScore}, isAnomaly: ${result.isAnomaly}`
      );

      return result;
    } catch (error) {
      this.logger.error(`Error detecting anomalies for user ${userId}:`, error);
      throw error;
    }
  }

  private createDefaultBehavior(userId: string): UserBehavior {
    return {
      userId,
      spendingPattern: [5000, 10000, 15000, 20000, 25000],
      transactionFrequency: 5,
      merchantCategories: ['retail', 'food', 'utilities'],
      timeOfDayPattern: [6, 8, 12, 14, 18, 20],
      deviceUsagePattern: ['mobile', 'web'],
      lastUpdated: Date.now(),
    };
  }

  private checkSpendingPatternAnomaly(amount: number, pattern: number[]): number {
    const average = pattern.reduce((a, b) => a + b, 0) / pattern.length;
    const deviation = Math.abs(amount - average) / average;
    return Math.min(100, deviation * 50);
  }

  private checkFrequencyAnomaly(frequency: number): number {
    // Expected frequency is around 5 transactions per day
    const expectedFrequency = 5;
    const deviation = Math.abs(frequency - expectedFrequency) / expectedFrequency;
    return Math.min(100, deviation * 50);
  }

  private checkMerchantAnomaly(category: string, knownCategories: string[]): number {
    if (knownCategories.includes(category)) return 0;
    return 70;
  }

  private checkTimeOfDayAnomaly(hour: number, pattern: number[]): number {
    if (pattern.includes(hour)) return 0;
    return 60;
  }

  private checkDeviceAnomaly(device: string, knownDevices: string[]): number {
    if (knownDevices.includes(device)) return 0;
    return 75;
  }

  private updateBehaviorProfile(userId: string, transaction: any): void {
    let behavior = this.userBehaviors.get(userId);
    if (!behavior) {
      behavior = this.createDefaultBehavior(userId);
    }

    // Update spending pattern
    behavior.spendingPattern.push(transaction.amount);
    if (behavior.spendingPattern.length > 30) {
      behavior.spendingPattern.shift();
    }

    // Update merchant categories
    if (!behavior.merchantCategories.includes(transaction.merchantCategory)) {
      behavior.merchantCategories.push(transaction.merchantCategory);
    }

    // Update device usage
    if (!behavior.deviceUsagePattern.includes(transaction.device)) {
      behavior.deviceUsagePattern.push(transaction.device);
    }

    behavior.lastUpdated = Date.now();
    this.userBehaviors.set(userId, behavior);
  }

  async getAnomalyScore(userId: string): Promise<AnomalyScore | null> {
    // This would typically return the latest anomaly score for a user
    // For now, return null
    return null;
  }
}
