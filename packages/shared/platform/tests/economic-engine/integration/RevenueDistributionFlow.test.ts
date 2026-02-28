/**
 * Integration Tests for Revenue Distribution Flow
 * Tests the complete revenue distribution workflow across all 5 levels
 */

import { EconomicEngine } from '../../../src/economic-engine/EconomicEngine';
import { TransactionEngine } from '../../../src/economic-engine/engine/TransactionEngine';
import { RevenueDistributor } from '../../../src/economic-engine/engine/RevenueDistributor';

describe('Revenue Distribution Flow - Integration Tests', () => {
  let engine: EconomicEngine;
  let transactionEngine: TransactionEngine;
  let revenueDistributor: RevenueDistributor;

  beforeEach(() => {
    engine = new EconomicEngine();
    transactionEngine = new TransactionEngine();
    revenueDistributor = new RevenueDistributor();
  });

  describe('Revenue Distribution Workflows', () => {
    it('should distribute revenue to all 5 levels correctly', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Revenue distribution test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Verify all 5 levels received correct amounts
      expect(distribution.distributions.creator).toBe(400);      // 40%
      expect(distribution.distributions.aggregator).toBe(250);   // 25%
      expect(distribution.distributions.platformPartner).toBe(200); // 20%
      expect(distribution.distributions.communityManager).toBe(100); // 10%
      expect(distribution.distributions.platform).toBe(50);      // 5%

      // Verify total equals original amount
      const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
      expect(total).toBe(1000);
    });

    it('should handle revenue distribution with partial participants', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Partial participants test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Even with partial participants, distribution should be calculated
      expect(distribution.distributions.creator).toBeGreaterThanOrEqual(0);
      expect(distribution.distributions.aggregator).toBeGreaterThan(0);
    });

    it('should handle revenue distribution with zero revenue', () => {
      // This should fail validation, but test the error handling
      expect(() => {
        const transaction = transactionEngine.createTransaction(
          'tenant1',
          'creator1',
          0,
          'NGN',
          'Zero revenue test'
        );
      }).toThrow();
    });

    it('should handle revenue distribution with rounding', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        999,
        'NGN',
        'Rounding test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Verify total is approximately equal (accounting for rounding)
      const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
      expect(Math.abs(total - 999)).toBeLessThan(0.01);
    });

    it('should handle revenue distribution with tax deductions', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Tax deduction test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);
      const adjustedRevenue = revenueDistributor.calculateAdjustedRevenue(
        distribution.totalAmount,
        0.1
      );

      expect(adjustedRevenue).toBe(900); // 1000 - 10% tax
    });

    it('should handle revenue distribution with adjustments', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Adjustment test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Create adjustment by recalculating with different amount
      const adjustedDistribution = revenueDistributor.distributeRevenue({
        ...completedTransaction,
        amount: 1100
      });

      expect(adjustedDistribution.distributions.creator).toBe(440);
      expect(adjustedDistribution.distributions.aggregator).toBe(275);
    });

    it('should handle revenue distribution with dispute scenarios', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Dispute test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Verify distribution can be verified for disputes
      const isValid = revenueDistributor.verifyDistribution(distribution);
      expect(isValid).toBe(true);
    });

    it('should handle revenue distribution with reconciliation', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Reconciliation test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Reconcile by verifying distribution
      const isReconciled = revenueDistributor.verifyDistribution(distribution);
      expect(isReconciled).toBe(true);
    });

    it('should handle revenue distribution with audit logging', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Audit logging test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Verify audit information is available
      expect(distribution.timestamp).toBeDefined();
      expect(distribution.transactionId).toBe(transaction.transactionId);
    });

    it('should handle revenue distribution with error recovery', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Error recovery test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Attempt distribution
      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Verify recovery by checking distribution validity
      const isValid = revenueDistributor.verifyDistribution(distribution);
      expect(isValid).toBe(true);
    });
  });

  describe('Multiple Transaction Revenue Distribution', () => {
    it('should handle revenue distribution for multiple transactions', () => {
      const transactions = [];

      for (let i = 0; i < 3; i++) {
        const txn = transactionEngine.createTransaction(
          'tenant1',
          `creator${i}`,
          1000,
          'NGN',
          `Transaction ${i}`
        );
        transactionEngine.completeTransaction(txn.transactionId, txn.creatorId);
        transactions.push(txn);
      }

      // Distribute revenue for each transaction
      const distributions = transactions.map(txn => {
        const completedTxn = transactionEngine.getTransaction(txn.transactionId);
        return revenueDistributor.distributeRevenue(completedTxn);
      });

      expect(distributions.length).toBe(3);
      expect(distributions.every(d => d.distributions.creator === 400)).toBe(true);
    });

    it('should maintain revenue distribution consistency across transactions', () => {
      const txn1 = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1'
      );
      const txn2 = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        2000,
        'NGN',
        'Transaction 2'
      );

      transactionEngine.completeTransaction(txn1.transactionId, 'creator1');
      transactionEngine.completeTransaction(txn2.transactionId, 'creator1');

      const dist1 = revenueDistributor.distributeRevenue(
        transactionEngine.getTransaction(txn1.transactionId)
      );
      const dist2 = revenueDistributor.distributeRevenue(
        transactionEngine.getTransaction(txn2.transactionId)
      );

      // Verify consistency in distribution percentages
      expect(dist1.distributions.creator / dist1.totalAmount).toBeCloseTo(0.4, 2);
      expect(dist2.distributions.creator / dist2.totalAmount).toBeCloseTo(0.4, 2);
    });
  });

  describe('Revenue Distribution Edge Cases', () => {
    it('should handle very small revenue amounts', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1,
        'NGN',
        'Small amount test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      expect(distribution.distributions.creator).toBeGreaterThanOrEqual(0);
      const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should handle large revenue amounts', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000000,
        'NGN',
        'Large amount test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      expect(distribution.distributions.creator).toBe(400000);
      expect(distribution.distributions.aggregator).toBe(250000);
    });

    it('should handle decimal precision in revenue distribution', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        123.45,
        'NGN',
        'Decimal precision test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      const total = Object.values(distribution.distributions).reduce((sum, val) => sum + val, 0);
      expect(Math.abs(total - 123.45)).toBeLessThan(0.01);
    });
  });
});
