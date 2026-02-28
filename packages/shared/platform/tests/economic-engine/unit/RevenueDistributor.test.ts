/**
 * Unit Tests for RevenueDistributor
 */

import { RevenueDistributor } from '../../../src/economic-engine/engine/RevenueDistributor';
import { Transaction } from '../../../src/economic-engine/types/Transaction';
import { ValidationError, CommissionCalculationError } from '../../../src/economic-engine/errors/EconomicEngineError';

describe('RevenueDistributor', () => {
  let distributor: RevenueDistributor;

  beforeEach(() => {
    distributor = new RevenueDistributor();
  });

  describe('distributeRevenue', () => {
    it('should distribute revenue according to 5-level model', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 1000,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      const distribution = distributor.distributeRevenue(transaction);

      expect(distribution.totalAmount).toBe(1000);
      expect(distribution.distributions.creator).toBe(400);      // 40%
      expect(distribution.distributions.aggregator).toBe(250);   // 25%
      expect(distribution.distributions.platformPartner).toBe(200); // 20%
      expect(distribution.distributions.communityManager).toBe(100); // 10%
      expect(distribution.distributions.platform).toBe(50);      // 5%
    });

    it('should handle decimal amounts with precision', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 999.99,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      const distribution = distributor.distributeRevenue(transaction);

      const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
      expect(Math.abs(total - 999.99)).toBeLessThan(0.01);
    });

    it('should throw error for non-completed transaction', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 1000,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'pending',
        description: 'Test',
        auditTrail: []
      };

      expect(() => {
        distributor.distributeRevenue(transaction);
      }).toThrow(ValidationError);
    });

    it('should throw error for zero amount', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 0,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      expect(() => {
        distributor.distributeRevenue(transaction);
      }).toThrow(ValidationError);
    });

    it('should throw error for negative amount', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: -100,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      expect(() => {
        distributor.distributeRevenue(transaction);
      }).toThrow(ValidationError);
    });

    it('should throw error for missing transaction ID', () => {
      const transaction: Transaction = {
        transactionId: '',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 1000,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      expect(() => {
        distributor.distributeRevenue(transaction);
      }).toThrow(ValidationError);
    });
  });

  describe('getRevenueSharingModel', () => {
    it('should return revenue sharing model', () => {
      const model = distributor.getRevenueSharingModel();

      expect(model.creator).toBe(0.40);
      expect(model.aggregator).toBe(0.25);
      expect(model.platformPartner).toBe(0.20);
      expect(model.communityManager).toBe(0.10);
      expect(model.platform).toBe(0.05);
    });

    it('should return copy of model', () => {
      const model1 = distributor.getRevenueSharingModel();
      const model2 = distributor.getRevenueSharingModel();

      expect(model1).toEqual(model2);
      expect(model1).not.toBe(model2);
    });
  });

  describe('calculateAdjustedRevenue', () => {
    it('should calculate revenue with default tax rate', () => {
      const adjusted = distributor.calculateAdjustedRevenue(1000);

      expect(adjusted).toBe(900); // 1000 - 10%
    });

    it('should calculate revenue with custom tax rate', () => {
      const adjusted = distributor.calculateAdjustedRevenue(1000, 0.2);

      expect(adjusted).toBe(800); // 1000 - 20%
    });

    it('should handle decimal tax rates', () => {
      const adjusted = distributor.calculateAdjustedRevenue(999.99, 0.15);

      expect(Math.abs(adjusted - 849.9915)).toBeLessThan(0.01);
    });
  });

  describe('verifyDistribution', () => {
    it('should verify correct distribution', () => {
      const transaction: Transaction = {
        transactionId: 'txn1',
        tenantId: 'tenant1',
        creatorId: 'creator1',
        amount: 1000,
        currency: 'NGN',
        timestamp: new Date(),
        status: 'completed',
        description: 'Test',
        auditTrail: []
      };

      const distribution = distributor.distributeRevenue(transaction);
      const verified = distributor.verifyDistribution(distribution);

      expect(verified).toBe(true);
    });

    it('should detect incorrect distribution', () => {
      const distribution = {
        transactionId: 'txn1',
        totalAmount: 1000,
        distributions: {
          creator: 400,
          aggregator: 250,
          platformPartner: 200,
          communityManager: 100,
          platform: 60 // Incorrect: should be 50
        },
        timestamp: new Date()
      };

      const verified = distributor.verifyDistribution(distribution);

      expect(verified).toBe(false);
    });
  });

  describe('getDistributionPercentages', () => {
    it('should return distribution percentages', () => {
      const percentages = distributor.getDistributionPercentages();

      expect(percentages.creator).toBe(40);
      expect(percentages.aggregator).toBe(25);
      expect(percentages.platformPartner).toBe(20);
      expect(percentages.communityManager).toBe(10);
      expect(percentages.platform).toBe(5);
    });

    it('should sum to 100 percent', () => {
      const percentages = distributor.getDistributionPercentages();
      const total = Object.values(percentages).reduce((sum, val) => sum + val, 0);

      expect(total).toBe(100);
    });
  });
});
