/**
 * Commission Calculator
 * Calculates commissions for all participants in the 5-level model
 */

import { Commission } from '../types/Transaction';
import { CommissionCalculationError, ValidationError } from '../errors/EconomicEngineError';

export interface CommissionConfig {
  baseMultipliers: Record<number, number>;
  performanceBonus: number;
  engagementBonus: number;
  integrationBonus: number;
}

export class CommissionCalculator {
  private readonly config: CommissionConfig = {
    baseMultipliers: {
      1: 1.0,  // Creator: 1.0x
      2: 0.8,  // Aggregator: 0.8x
      3: 0.7,  // Platform Partner: 0.7x
      4: 0.6,  // Community Manager: 0.6x
      5: 0.5   // Platform: 0.5x
    },
    performanceBonus: 0.1,   // 10% performance bonus
    engagementBonus: 0.05,   // 5% engagement bonus
    integrationBonus: 0.08   // 8% integration bonus
  };

  /**
   * Calculate commission for a participant
   */
  calculateCommission(
    participantId: string,
    level: 1 | 2 | 3 | 4 | 5,
    baseAmount: number,
    performanceMetric?: number,
    engagementMetric?: number
  ): Commission {
    this.validateInputs(participantId, level, baseAmount);

    const multiplier = this.config.baseMultipliers[level];
    let finalAmount = baseAmount * multiplier;

    // Apply performance bonus
    if (performanceMetric && performanceMetric > 0.8) {
      finalAmount += baseAmount * this.config.performanceBonus;
    }

    // Apply engagement bonus
    if (engagementMetric && engagementMetric > 0.7) {
      finalAmount += baseAmount * this.config.engagementBonus;
    }

    return {
      commissionId: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantId,
      level,
      baseAmount: Math.round(baseAmount * 100) / 100,
      multiplier,
      finalAmount: Math.round(finalAmount * 100) / 100,
      timestamp: new Date(),
      status: 'calculated'
    };
  }

  /**
   * Calculate commissions for all levels
   */
  calculateAllCommissions(
    revenueDistribution: Record<string, number>,
    participantIds: Record<string, string>
  ): Commission[] {
    const commissions: Commission[] = [];

    const levels: Array<[number, string, string]> = [
      [1, 'creator', 'creator'],
      [2, 'aggregator', 'aggregator'],
      [3, 'platformPartner', 'platformPartner'],
      [4, 'communityManager', 'communityManager'],
      [5, 'platform', 'platform']
    ];

    for (const [level, key, participantKey] of levels) {
      const participantId = participantIds[participantKey];
      const amount = revenueDistribution[key];

      if (participantId && amount > 0) {
        const commission = this.calculateCommission(
          participantId,
          level as 1 | 2 | 3 | 4 | 5,
          amount
        );
        commissions.push(commission);
      }
    }

    return commissions;
  }

  /**
   * Apply performance bonus
   */
  applyPerformanceBonus(commission: Commission, performanceScore: number): Commission {
    if (performanceScore < 0 || performanceScore > 1) {
      throw new ValidationError('Performance score must be between 0 and 1');
    }

    if (performanceScore > 0.8) {
      const bonusAmount = commission.baseAmount * this.config.performanceBonus;
      return {
        ...commission,
        finalAmount: Math.round((commission.finalAmount + bonusAmount) * 100) / 100
      };
    }

    return commission;
  }

  /**
   * Apply engagement bonus
   */
  applyEngagementBonus(commission: Commission, engagementScore: number): Commission {
    if (engagementScore < 0 || engagementScore > 1) {
      throw new ValidationError('Engagement score must be between 0 and 1');
    }

    if (engagementScore > 0.7) {
      const bonusAmount = commission.baseAmount * this.config.engagementBonus;
      return {
        ...commission,
        finalAmount: Math.round((commission.finalAmount + bonusAmount) * 100) / 100
      };
    }

    return commission;
  }

  /**
   * Validate inputs
   */
  private validateInputs(participantId: string, level: number, baseAmount: number): void {
    if (!participantId) {
      throw new ValidationError('Participant ID is required');
    }

    if (level < 1 || level > 5) {
      throw new ValidationError('Level must be between 1 and 5');
    }

    if (baseAmount <= 0) {
      throw new ValidationError('Base amount must be greater than 0');
    }
  }

  /**
   * Get commission config
   */
  getConfig(): CommissionConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Update commission config
   */
  updateConfig(config: Partial<CommissionConfig>): void {
    if (config.baseMultipliers) {
      this.config.baseMultipliers = { ...this.config.baseMultipliers, ...config.baseMultipliers };
    }
    if (config.performanceBonus !== undefined) {
      this.config.performanceBonus = config.performanceBonus;
    }
    if (config.engagementBonus !== undefined) {
      this.config.engagementBonus = config.engagementBonus;
    }
    if (config.integrationBonus !== undefined) {
      this.config.integrationBonus = config.integrationBonus;
    }
  }
}
