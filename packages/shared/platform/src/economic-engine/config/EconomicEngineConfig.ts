/**
 * Economic Engine Configuration Module
 */

export interface CommissionConfig {
  level1Percentage: number;
  level2Percentage: number;
  level3Percentage: number;
  level4Percentage: number;
  level5Percentage: number;
  performanceBonusPercentage: number;
  engagementBonusPercentage: number;
}

export interface RevenueSharingConfig {
  level1Percentage: number;
  level2Percentage: number;
  level3Percentage: number;
  level4Percentage: number;
  level5Percentage: number;
  taxPercentage: number;
}

export interface EconomicEngineConfigOptions {
  enabled?: boolean;
  maxTransactionAmount?: number;
  minTransactionAmount?: number;
  maxWalletBalance?: number;
  commissionConfig?: CommissionConfig;
  revenueSharingConfig?: RevenueSharingConfig;
  enableAuditLogging?: boolean;
  enableTransactionVerification?: boolean;
}

export class EconomicEngineConfig {
  private enabled: boolean = true;
  private maxTransactionAmount: number = 1000000;
  private minTransactionAmount: number = 0.01;
  private maxWalletBalance: number = 10000000;
  private commissionConfig: CommissionConfig = {
    level1Percentage: 20,
    level2Percentage: 15,
    level3Percentage: 10,
    level4Percentage: 5,
    level5Percentage: 2,
    performanceBonusPercentage: 10,
    engagementBonusPercentage: 5,
  };
  private revenueSharingConfig: RevenueSharingConfig = {
    level1Percentage: 40,
    level2Percentage: 25,
    level3Percentage: 20,
    level4Percentage: 10,
    level5Percentage: 5,
    taxPercentage: 10,
  };
  private enableAuditLogging: boolean = true;
  private enableTransactionVerification: boolean = true;

  constructor(options?: EconomicEngineConfigOptions) {
    if (options) {
      this.enabled = options.enabled ?? this.enabled;
      this.maxTransactionAmount = options.maxTransactionAmount ?? this.maxTransactionAmount;
      this.minTransactionAmount = options.minTransactionAmount ?? this.minTransactionAmount;
      this.maxWalletBalance = options.maxWalletBalance ?? this.maxWalletBalance;
      this.commissionConfig = options.commissionConfig ?? this.commissionConfig;
      this.revenueSharingConfig = options.revenueSharingConfig ?? this.revenueSharingConfig;
      this.enableAuditLogging = options.enableAuditLogging ?? this.enableAuditLogging;
      this.enableTransactionVerification = options.enableTransactionVerification ?? this.enableTransactionVerification;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public getMaxTransactionAmount(): number {
    return this.maxTransactionAmount;
  }

  public setMaxTransactionAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Max transaction amount must be positive');
    }
    this.maxTransactionAmount = amount;
  }

  public getMinTransactionAmount(): number {
    return this.minTransactionAmount;
  }

  public setMinTransactionAmount(amount: number): void {
    if (amount < 0) {
      throw new Error('Min transaction amount must be non-negative');
    }
    this.minTransactionAmount = amount;
  }

  public getMaxWalletBalance(): number {
    return this.maxWalletBalance;
  }

  public setMaxWalletBalance(balance: number): void {
    if (balance <= 0) {
      throw new Error('Max wallet balance must be positive');
    }
    this.maxWalletBalance = balance;
  }

  public getCommissionConfig(): CommissionConfig {
    return { ...this.commissionConfig };
  }

  public setCommissionConfig(config: CommissionConfig): void {
    const total = config.level1Percentage + config.level2Percentage + config.level3Percentage +
                  config.level4Percentage + config.level5Percentage;
    if (total !== 52) {
      throw new Error('Commission percentages must sum to 52%');
    }
    this.commissionConfig = config;
  }

  public getRevenueSharingConfig(): RevenueSharingConfig {
    return { ...this.revenueSharingConfig };
  }

  public setRevenueSharingConfig(config: RevenueSharingConfig): void {
    const total = config.level1Percentage + config.level2Percentage + config.level3Percentage +
                  config.level4Percentage + config.level5Percentage;
    if (total !== 100) {
      throw new Error('Revenue sharing percentages must sum to 100%');
    }
    this.revenueSharingConfig = config;
  }

  public isAuditLoggingEnabled(): boolean {
    return this.enableAuditLogging;
  }

  public setAuditLoggingEnabled(enabled: boolean): void {
    this.enableAuditLogging = enabled;
  }

  public isTransactionVerificationEnabled(): boolean {
    return this.enableTransactionVerification;
  }

  public setTransactionVerificationEnabled(enabled: boolean): void {
    this.enableTransactionVerification = enabled;
  }
}
