/**
 * Unit Tests for CommissionCalculator
 */

import { CommissionCalculator } from '../../../src/economic-engine/engine/CommissionCalculator';
import { ValidationError } from '../../../src/economic-engine/errors/EconomicEngineError';

describe('CommissionCalculator', () => {
  let calculator: CommissionCalculator;

  beforeEach(() => {
    calculator = new CommissionCalculator();
  });

  describe('calculateCommission', () => {
    it('should calculate commission for level 1 (creator)', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);

      expect(commission.participantId).toBe('participant1');
      expect(commission.level).toBe(1);
      expect(commission.baseAmount).toBe(1000);
      expect(commission.multiplier).toBe(1.0);
      expect(commission.finalAmount).toBe(1000);
      expect(commission.status).toBe('calculated');
    });

    it('should calculate commission for level 2 (aggregator)', () => {
      const commission = calculator.calculateCommission('participant2', 2, 1000);

      expect(commission.level).toBe(2);
      expect(commission.multiplier).toBe(0.8);
      expect(commission.finalAmount).toBe(800);
    });

    it('should calculate commission for level 3 (platform partner)', () => {
      const commission = calculator.calculateCommission('participant3', 3, 1000);

      expect(commission.level).toBe(3);
      expect(commission.multiplier).toBe(0.7);
      expect(commission.finalAmount).toBe(700);
    });

    it('should calculate commission for level 4 (community manager)', () => {
      const commission = calculator.calculateCommission('participant4', 4, 1000);

      expect(commission.level).toBe(4);
      expect(commission.multiplier).toBe(0.6);
      expect(commission.finalAmount).toBe(600);
    });

    it('should calculate commission for level 5 (platform)', () => {
      const commission = calculator.calculateCommission('participant5', 5, 1000);

      expect(commission.level).toBe(5);
      expect(commission.multiplier).toBe(0.5);
      expect(commission.finalAmount).toBe(500);
    });

    it('should throw error for invalid participant ID', () => {
      expect(() => {
        calculator.calculateCommission('', 1, 1000);
      }).toThrow(ValidationError);
    });

    it('should throw error for invalid level', () => {
      expect(() => {
        calculator.calculateCommission('participant1', -1 as any, 1000);
      }).toThrow(ValidationError);

      expect(() => {
        calculator.calculateCommission('participant1', 6 as any, 1000);
      }).toThrow(ValidationError);
    });

    it('should throw error for non-positive amount', () => {
      expect(() => {
        calculator.calculateCommission('participant1', 1, 0);
      }).toThrow(ValidationError);

      expect(() => {
        calculator.calculateCommission('participant1', 1, -100);
      }).toThrow(ValidationError);
    });

    it('should apply performance bonus', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000, 0.9);

      expect(commission.finalAmount).toBeGreaterThan(1000);
      expect(commission.finalAmount).toBe(1100); // 1000 + 10% bonus
    });

    it('should apply engagement bonus', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000, 0, 0.8);

      expect(commission.finalAmount).toBeGreaterThan(1000);
      expect(commission.finalAmount).toBe(1050); // 1000 + 5% bonus
    });

    it('should apply both bonuses', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000, 0.9, 0.8);

      expect(commission.finalAmount).toBe(1150); // 1000 + 10% + 5%
    });
  });

  describe('calculateAllCommissions', () => {
    it('should calculate commissions for all levels', () => {
      const revenueDistribution = {
        creator: 400,
        aggregator: 250,
        platformPartner: 200,
        communityManager: 100,
        platform: 50
      };

      const participantIds = {
        creator: 'creator1',
        aggregator: 'agg1',
        platformPartner: 'partner1',
        communityManager: 'manager1',
        platform: 'platform1'
      };

      const commissions = calculator.calculateAllCommissions(revenueDistribution, participantIds);

      expect(commissions).toHaveLength(5);
      expect(commissions[0].level).toBe(1);
      expect(commissions[1].level).toBe(2);
      expect(commissions[2].level).toBe(3);
      expect(commissions[3].level).toBe(4);
      expect(commissions[4].level).toBe(5);
    });
  });

  describe('applyPerformanceBonus', () => {
    it('should apply performance bonus for high score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);
      const withBonus = calculator.applyPerformanceBonus(commission, 0.9);

      expect(withBonus.finalAmount).toBeGreaterThan(commission.finalAmount);
    });

    it('should not apply bonus for low score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);
      const withBonus = calculator.applyPerformanceBonus(commission, 0.7);

      expect(withBonus.finalAmount).toBe(commission.finalAmount);
    });

    it('should throw error for invalid score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);

      expect(() => {
        calculator.applyPerformanceBonus(commission, -0.1);
      }).toThrow(ValidationError);

      expect(() => {
        calculator.applyPerformanceBonus(commission, 1.1);
      }).toThrow(ValidationError);
    });
  });

  describe('applyEngagementBonus', () => {
    it('should apply engagement bonus for high score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);
      const withBonus = calculator.applyEngagementBonus(commission, 0.8);

      expect(withBonus.finalAmount).toBeGreaterThan(commission.finalAmount);
    });

    it('should not apply bonus for low score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);
      const withBonus = calculator.applyEngagementBonus(commission, 0.6);

      expect(withBonus.finalAmount).toBe(commission.finalAmount);
    });

    it('should throw error for invalid score', () => {
      const commission = calculator.calculateCommission('participant1', 1, 1000);

      expect(() => {
        calculator.applyEngagementBonus(commission, -0.1);
      }).toThrow(ValidationError);

      expect(() => {
        calculator.applyEngagementBonus(commission, 1.1);
      }).toThrow(ValidationError);
    });
  });

  describe('getConfig', () => {
    it('should return commission configuration', () => {
      const config = calculator.getConfig();

      expect(config.baseMultipliers).toBeDefined();
      expect(config.performanceBonus).toBe(0.1);
      expect(config.engagementBonus).toBe(0.05);
      expect(config.integrationBonus).toBe(0.08);
    });
  });

  describe('updateConfig', () => {
    it('should update performance bonus', () => {
      calculator.updateConfig({ performanceBonus: 0.15 });
      const config = calculator.getConfig();

      expect(config.performanceBonus).toBe(0.15);
    });

    it('should update engagement bonus', () => {
      calculator.updateConfig({ engagementBonus: 0.08 });
      const config = calculator.getConfig();

      expect(config.engagementBonus).toBe(0.08);
    });

    it('should update base multipliers', () => {
      calculator.updateConfig({ baseMultipliers: { 1: 1.1, 2: 0.9 } });
      const config = calculator.getConfig();

      expect(config.baseMultipliers[1]).toBe(1.1);
      expect(config.baseMultipliers[2]).toBe(0.9);
    });
  });
});
