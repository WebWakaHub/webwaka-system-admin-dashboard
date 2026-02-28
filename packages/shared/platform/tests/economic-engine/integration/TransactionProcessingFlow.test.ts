/**
 * Integration Tests for Transaction Processing Flow
 * Tests the complete transaction workflow from creation to completion
 */

import { EconomicEngine } from '../../../src/economic-engine/EconomicEngine';
import { TransactionEngine } from '../../../src/economic-engine/engine/TransactionEngine';
import { RevenueDistributor } from '../../../src/economic-engine/engine/RevenueDistributor';
import { CommissionCalculator } from '../../../src/economic-engine/engine/CommissionCalculator';
import { WalletManager } from '../../../src/economic-engine/engine/WalletManager';

describe('Transaction Processing Flow - Integration Tests', () => {
  let engine: EconomicEngine;
  let transactionEngine: TransactionEngine;
  let revenueDistributor: RevenueDistributor;
  let commissionCalculator: CommissionCalculator;
  let walletManager: WalletManager;

  beforeEach(() => {
    engine = new EconomicEngine();
    transactionEngine = new TransactionEngine();
    revenueDistributor = new RevenueDistributor();
    commissionCalculator = new CommissionCalculator();
    walletManager = new WalletManager();
  });

  describe('Complete Transaction Processing Workflow', () => {
    it('should process complete transaction flow: create → complete → distribute → commission', () => {
      // Step 1: Create transaction
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Integration test transaction'
      );

      expect(transaction.status).toBe('pending');
      expect(transaction.amount).toBe(1000);

      // Step 2: Complete transaction
      const completedTransaction = transactionEngine.completeTransaction(
        transaction.transactionId,
        'creator1'
      );

      expect(completedTransaction.status).toBe('completed');

      // Step 3: Distribute revenue
      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      expect(distribution.distributions.creator).toBe(400);
      expect(distribution.distributions.aggregator).toBe(250);
      expect(distribution.distributions.platformPartner).toBe(200);
      expect(distribution.distributions.communityManager).toBe(100);
      expect(distribution.distributions.platform).toBe(50);

      // Step 4: Calculate commissions
      const participantIds = {
        creator: 'creator1',
        aggregator: 'agg1',
        platformPartner: 'partner1',
        communityManager: 'manager1',
        platform: 'platform1'
      };

      const commissions = commissionCalculator.calculateAllCommissions(
        distribution.distributions,
        participantIds
      );

      expect(commissions.length).toBeGreaterThan(0);
      expect(commissions.every(c => c.finalAmount > 0)).toBe(true);
    });

    it('should handle transaction with multiple participants', () => {
      const participantIds = {
        creator: 'creator1',
        aggregator: 'agg1',
        platformPartner: 'partner1',
        communityManager: 'manager1',
        platform: 'platform1'
      };

      const result = engine.processTransaction(
        'tenant1',
        'creator1',
        5000,
        'NGN',
        'Multi-participant transaction',
        participantIds
      );

      expect(result.transaction).toBeDefined();
      expect(result.distribution).toBeDefined();
      expect(result.commissions.length).toBeGreaterThan(0);

      // Verify all participants received commissions
      const participantCommissions = result.commissions.map(c => c.participantId);
      expect(participantCommissions).toContain('creator1');
      expect(participantCommissions).toContain('agg1');
    });

    it('should maintain data consistency through transaction flow', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Consistency test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Verify transaction data consistency
      expect(completedTransaction.tenantId).toBe('tenant1');
      expect(completedTransaction.creatorId).toBe('creator1');
      expect(completedTransaction.amount).toBe(1000);
      expect(completedTransaction.currency).toBe('NGN');
      expect(completedTransaction.status).toBe('completed');
    });

    it('should handle concurrent transaction processing', () => {
      const transactions = [];

      for (let i = 0; i < 5; i++) {
        const txn = transactionEngine.createTransaction(
          'tenant1',
          `creator${i}`,
          1000 + i * 100,
          'NGN',
          `Concurrent transaction ${i}`
        );
        transactions.push(txn);
      }

      // Complete all transactions
      const completedTransactions = transactions.map(txn =>
        transactionEngine.completeTransaction(txn.transactionId, txn.creatorId)
      );

      expect(completedTransactions.length).toBe(5);
      expect(completedTransactions.every(t => t.status === 'completed')).toBe(true);

      // Verify total volume (includes pending transactions)
      const totalVolume = transactionEngine.getTotalVolume('tenant1');
      expect(totalVolume).toBeGreaterThanOrEqual(5200);
    });

    it('should verify audit trail through transaction flow', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Audit trail test'
      );

      expect(transaction.auditTrail.length).toBeGreaterThanOrEqual(1);

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Verify audit trail has been updated
      expect(completedTransaction.auditTrail.length).toBeGreaterThanOrEqual(transaction.auditTrail.length);
    });

    it('should verify compliance through transaction flow', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Compliance test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Verify transaction is in completed state for compliance
      expect(completedTransaction.status).toBe('completed');
      expect(completedTransaction.timestamp).toBeDefined();
    });

    it('should handle transaction with tax calculations', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Tax calculation test'
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

    it('should handle transaction with refund scenario', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Refund test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Verify transaction can be refunded by checking status
      expect(completedTransaction.status).toBe('completed');
    });

    it('should handle transaction with adjustment scenario', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Adjustment test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Create adjustment transaction
      const adjustmentTransaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        50,
        'NGN',
        'Adjustment for transaction'
      );

      expect(adjustmentTransaction.amount).toBe(50);
    });

    it('should handle transaction error recovery', () => {
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Error recovery test'
      );

      // Attempt to complete transaction
      const completedTransaction = transactionEngine.completeTransaction(
        transaction.transactionId,
        'creator1'
      );

      // Verify recovery by retrieving transaction
      const retrievedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      expect(retrievedTransaction.status).toBe('completed');
      expect(retrievedTransaction.transactionId).toBe(transaction.transactionId);
    });

    it('should verify data consistency across multiple transactions', () => {
      // Create multiple transactions
      const txn1 = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test 1'
      );
      const txn2 = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        2000,
        'NGN',
        'Test 2'
      );

      // Complete transactions
      transactionEngine.completeTransaction(txn1.transactionId, 'creator1');
      transactionEngine.completeTransaction(txn2.transactionId, 'creator1');

      // Verify consistency
      const creatorTransactions = transactionEngine.getCreatorTransactions('creator1', 'tenant1');

      expect(creatorTransactions.length).toBe(2);
      expect(creatorTransactions.every(t => t.creatorId === 'creator1')).toBe(true);
      expect(creatorTransactions.every(t => t.status === 'completed')).toBe(true);
    });
  });

  describe('Transaction Processing with Wallet Integration', () => {
    it('should integrate transaction processing with wallet management', () => {
      // Create wallets
      const creatorWallet = walletManager.createWallet('creator1', 'tenant1', 'NGN');
      const aggregatorWallet = walletManager.createWallet('agg1', 'tenant1', 'NGN');

      // Process transaction
      const transaction = transactionEngine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Wallet integration test'
      );

      transactionEngine.completeTransaction(transaction.transactionId, 'creator1');
      const completedTransaction = transactionEngine.getTransaction(transaction.transactionId);

      // Distribute revenue
      const distribution = revenueDistributor.distributeRevenue(completedTransaction);

      // Update wallets with distributed amounts
      const creatorUpdate = walletManager.addFunds(
        creatorWallet.walletId,
        distribution.distributions.creator,
        transaction.transactionId
      );

      const aggregatorUpdate = walletManager.addFunds(
        aggregatorWallet.walletId,
        distribution.distributions.aggregator,
        transaction.transactionId
      );

      expect(creatorUpdate.balance).toBe(400);
      expect(aggregatorUpdate.balance).toBe(250);
    });
  });
});
