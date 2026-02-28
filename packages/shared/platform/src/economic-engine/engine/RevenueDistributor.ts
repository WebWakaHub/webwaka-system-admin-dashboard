/**
 * Revenue Distributor
 * Implements the 5-level revenue sharing model
 */

import { RevenueDistribution, Transaction } from '../types/Transaction';
import { ValidationError, CommissionCalculationError } from '../errors/EconomicEngineError';

export interface RevenueSharingModel {
  creator: number;        // Level 1: 40%
  aggregator: number;     // Level 2: 25%
  platformPartner: number; // Level 3: 20%
  communityManager: number; // Level 4: 10%
  platform: number;       // Level 5: 5%
}

export class RevenueDistributor {
  private readonly revenueSharingModel: RevenueSharingModel = {
    creator: 0.40,
    aggregator: 0.25,
    platformPartner: 0.20,
    communityManager: 0.10,
    platform: 0.05
  };

  /**
   * Distribute revenue according to the 5-level model
   */
  distributeRevenue(transaction: Transaction): RevenueDistribution {
    this.validateTransaction(transaction);

    const totalAmount = transaction.amount;
    const distributions = {
      creator: this.calculateShare(totalAmount, this.revenueSharingModel.creator),
      aggregator: this.calculateShare(totalAmount, this.revenueSharingModel.aggregator),
      platformPartner: this.calculateShare(totalAmount, this.revenueSharingModel.platformPartner),
      communityManager: this.calculateShare(totalAmount, this.revenueSharingModel.communityManager),
      platform: this.calculateShare(totalAmount, this.revenueSharingModel.platform)
    };

    // Verify total equals original amount (accounting for rounding)
    const total = Object.values(distributions).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - totalAmount) > 0.01) {
      throw new CommissionCalculationError(
        'Revenue distribution total does not match transaction amount',
        { expected: totalAmount, actual: total }
      );
    }

    return {
      transactionId: transaction.transactionId,
      totalAmount,
      distributions,
      timestamp: new Date()
    };
  }

  /**
   * Calculate share for a given percentage
   */
  private calculateShare(amount: number, percentage: number): number {
    const share = amount * percentage;
    // Round to 2 decimal places
    return Math.round(share * 100) / 100;
  }

  /**
   * Validate transaction before distribution
   */
  private validateTransaction(transaction: Transaction): void {
    if (!transaction.transactionId) {
      throw new ValidationError('Transaction ID is required');
    }

    if (transaction.amount <= 0) {
      throw new ValidationError('Transaction amount must be greater than 0', {
        amount: transaction.amount
      });
    }

    if (transaction.status !== 'completed') {
      throw new ValidationError('Only completed transactions can be distributed', {
        status: transaction.status
      });
    }
  }

  /**
   * Get the revenue sharing model
   */
  getRevenueSharingModel(): RevenueSharingModel {
    return { ...this.revenueSharingModel };
  }

  /**
   * Calculate adjusted revenue with tax
   */
  calculateAdjustedRevenue(amount: number, taxRate: number = 0.1): number {
    const tax = this.calculateShare(amount, taxRate);
    return amount - tax;
  }

  /**
   * Verify revenue distribution accuracy
   */
  verifyDistribution(distribution: RevenueDistribution): boolean {
    const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - distribution.totalAmount) < 0.01;
  }

  /**
   * Get distribution percentages
   */
  getDistributionPercentages(): Record<string, number> {
    return {
      creator: this.revenueSharingModel.creator * 100,
      aggregator: this.revenueSharingModel.aggregator * 100,
      platformPartner: this.revenueSharingModel.platformPartner * 100,
      communityManager: this.revenueSharingModel.communityManager * 100,
      platform: this.revenueSharingModel.platform * 100
    };
  }
}
