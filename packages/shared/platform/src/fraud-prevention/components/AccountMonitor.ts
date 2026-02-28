import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface AccountActivity {
  userId: string;
  activityType: 'login' | 'device_change' | 'location_change' | 'account_change';
  device: string;
  location: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TakeoverRisk {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  timestamp: number;
}

export interface AccountProfile {
  userId: string;
  knownDevices: string[];
  knownLocations: string[];
  lastLoginTime: number;
  lastLoginLocation: string;
  lastLoginDevice: string;
  loginAttemptCount: number;
  failedLoginAttempts: number;
  lastUpdated: number;
}

export class AccountMonitor {
  private eventBus: EventBus;
  private logger: Logger;
  private accountProfiles: Map<string, AccountProfile> = new Map();
  private suspiciousActivities: Map<string, AccountActivity[]> = new Map();

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.account.activity.detected', (event: any) => {
      this.monitorActivity(event.data.activity);
    });

    this.eventBus.subscribe('fraud.account.login.attempted', (event: any) => {
      this.monitorLogin(event.data.userId, event.data.device, event.data.location);
    });
  }

  async monitorActivity(activity: AccountActivity): Promise<TakeoverRisk> {
    try {
      // Get or create account profile
      let profile = this.accountProfiles.get(activity.userId);
      if (!profile) {
        profile = this.createDefaultProfile(activity.userId);
      }

      let riskScore = 0;
      const indicators: string[] = [];

      // Check login pattern anomaly
      if (activity.activityType === 'login') {
        const loginRisk = this.checkLoginPatternAnomaly(profile, activity);
        riskScore += loginRisk * 0.30;
        if (loginRisk > 50) indicators.push('unusual_login_pattern');
      }

      // Check device change
      if (activity.activityType === 'device_change') {
        const deviceRisk = this.checkDeviceChange(profile, activity.device);
        riskScore += deviceRisk * 0.25;
        if (deviceRisk > 50) indicators.push('new_device_detected');
      }

      // Check location change
      if (activity.activityType === 'location_change') {
        const locationRisk = this.checkLocationChange(profile, activity.location);
        riskScore += locationRisk * 0.25;
        if (locationRisk > 50) indicators.push('unusual_location');
      }

      // Check account change
      if (activity.activityType === 'account_change') {
        const accountRisk = this.checkAccountChange(profile);
        riskScore += accountRisk * 0.20;
        if (accountRisk > 50) indicators.push('account_modification');
      }

      // Normalize score
      riskScore = Math.min(100, Math.max(0, riskScore));

      const riskLevel = this.getRiskLevel(riskScore);

      const result: TakeoverRisk = {
        userId: activity.userId,
        riskScore: Math.round(riskScore),
        riskLevel,
        indicators,
        timestamp: Date.now(),
      };

      // Update account profile
      this.updateAccountProfile(activity.userId, activity);

      // Track suspicious activities
      if (riskScore > 60) {
        this.trackSuspiciousActivity(activity);
      }

      // Publish account takeover detection event
      this.eventBus.publish('fraud.account.takeover.detected', result);

      this.logger.info(
        `Account monitoring for user ${activity.userId}: risk score ${result.riskScore}, level: ${riskLevel}`
      );

      return result;
    } catch (error) {
      this.logger.error(`Error monitoring account activity for user ${activity.userId}:`, error);
      throw error;
    }
  }

  async monitorLogin(userId: string, device: string, location: string): Promise<TakeoverRisk> {
    const activity: AccountActivity = {
      userId,
      activityType: 'login',
      device,
      location,
      timestamp: Date.now(),
    };

    return this.monitorActivity(activity);
  }

  private createDefaultProfile(userId: string): AccountProfile {
    return {
      userId,
      knownDevices: [],
      knownLocations: [],
      lastLoginTime: 0,
      lastLoginLocation: '',
      lastLoginDevice: '',
      loginAttemptCount: 0,
      failedLoginAttempts: 0,
      lastUpdated: Date.now(),
    };
  }

  private checkLoginPatternAnomaly(profile: AccountProfile, activity: AccountActivity): number {
    // Check if login is at unusual time
    const now = new Date();
    const hour = now.getHours();
    const isNightTime = hour < 6 || hour > 22;

    if (isNightTime) return 40;
    return 10;
  }

  private checkDeviceChange(profile: AccountProfile, device: string): number {
    if (profile.knownDevices.includes(device)) return 0;
    return 80;
  }

  private checkLocationChange(profile: AccountProfile, location: string): number {
    if (profile.knownLocations.includes(location)) return 0;
    return 75;
  }

  private checkAccountChange(profile: AccountProfile): number {
    // Check if account modifications are happening
    // This would typically check for password changes, email changes, etc.
    return 60;
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    if (score < 85) return 'high';
    return 'critical';
  }

  private updateAccountProfile(userId: string, activity: AccountActivity): void {
    let profile = this.accountProfiles.get(userId);
    if (!profile) {
      profile = this.createDefaultProfile(userId);
    }

    if (activity.activityType === 'login') {
      profile.lastLoginTime = activity.timestamp;
      profile.lastLoginLocation = activity.location;
      profile.lastLoginDevice = activity.device;
      profile.loginAttemptCount++;
    }

    if (!profile.knownDevices.includes(activity.device)) {
      profile.knownDevices.push(activity.device);
    }

    if (!profile.knownLocations.includes(activity.location)) {
      profile.knownLocations.push(activity.location);
    }

    profile.lastUpdated = Date.now();
    this.accountProfiles.set(userId, profile);
  }

  private trackSuspiciousActivity(activity: AccountActivity): void {
    const activities = this.suspiciousActivities.get(activity.userId) || [];
    activities.push(activity);

    // Keep only last 100 suspicious activities
    if (activities.length > 100) {
      activities.shift();
    }

    this.suspiciousActivities.set(activity.userId, activities);
  }

  async getTakeoverRisk(userId: string): Promise<TakeoverRisk | null> {
    // This would typically return the latest takeover risk for a user
    return null;
  }

  getAccountProfile(userId: string): AccountProfile | undefined {
    return this.accountProfiles.get(userId);
  }

  getSuspiciousActivities(userId: string): AccountActivity[] {
    return this.suspiciousActivities.get(userId) || [];
  }
}
