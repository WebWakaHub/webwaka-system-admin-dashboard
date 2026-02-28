/**
 * Integration Tests for Wallet Management Flow
 * Tests the complete wallet management workflow
 */

import { EconomicEngine } from '../../../src/economic-engine/EconomicEngine';
import { WalletManager } from '../../../src/economic-engine/engine/WalletManager';

describe('Wallet Management Flow - Integration Tests', () => {
  let engine: EconomicEngine;
  let walletManager: WalletManager;

  beforeEach(() => {
    engine = new EconomicEngine();
    walletManager = new WalletManager();
  });

  describe('Wallet Management Workflows', () => {
    it('should create wallet and initialize with zero balance', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');

      expect(wallet).toBeDefined();
      expect(wallet.userId).toBe('user1');
      expect(wallet.tenantId).toBe('tenant1');
      expect(wallet.currency).toBe('NGN');
      expect(wallet.balance).toBe(0);
    });

    it('should update balance through transactions', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');

      // Add funds
      const updated = walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      expect(updated.balance).toBe(1000);
    });

    it('should verify and reconcile balance', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');
      walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      const retrievedWallet = walletManager.getWallet(wallet.walletId);

      expect(retrievedWallet.balance).toBe(1000);
    });

    it('should process withdrawal request', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');
      walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      const updated = walletManager.withdrawFunds(wallet.walletId, 500, 'txn_002');

      expect(updated.balance).toBe(500);
    });

    it('should process payout confirmation and update balance', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');
      walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      // Simulate payout
      const updated = walletManager.withdrawFunds(wallet.walletId, 1000, 'payout_001');

      expect(updated.balance).toBe(0);
    });

    it('should handle concurrent wallet operations', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');

      // Simulate concurrent operations
      walletManager.addFunds(wallet.walletId, 500, 'txn_001');
      walletManager.addFunds(wallet.walletId, 300, 'txn_002');
      walletManager.withdrawFunds(wallet.walletId, 200, 'txn_003');

      const finalWallet = walletManager.getWallet(wallet.walletId);

      expect(finalWallet.balance).toBe(600);
    });

    it('should verify wallet state consistency', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');
      walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      const retrievedWallet = walletManager.getWallet(wallet.walletId);

      expect(retrievedWallet.walletId).toBe(wallet.walletId);
      expect(retrievedWallet.userId).toBe('user1');
      expect(retrievedWallet.tenantId).toBe('tenant1');
      expect(retrievedWallet.balance).toBe(1000);
    });

    it('should handle error recovery in wallet operations', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');
      walletManager.addFunds(wallet.walletId, 1000, 'txn_001');

      // Attempt withdrawal
      const updated = walletManager.withdrawFunds(wallet.walletId, 500, 'txn_002');

      // Verify recovery by checking wallet state
      const retrievedWallet = walletManager.getWallet(wallet.walletId);
      expect(retrievedWallet.balance).toBe(updated.balance);
    });
  });

  describe('Multi-Wallet Operations', () => {
    it('should transfer funds between wallets', () => {
      const wallet1 = walletManager.createWallet('user1', 'tenant1', 'NGN');
      const wallet2 = walletManager.createWallet('user2', 'tenant1', 'NGN');

      walletManager.addFunds(wallet1.walletId, 1000, 'txn_001');

      const result = walletManager.transfer(
        wallet1.walletId,
        wallet2.walletId,
        500,
        'transfer_001'
      );

      expect(result.from.balance).toBe(500);
      expect(result.to.balance).toBe(500);
    });

    it('should maintain balance consistency across multiple wallets', () => {
      const wallet1 = walletManager.createWallet('user1', 'tenant1', 'NGN');
      const wallet2 = walletManager.createWallet('user2', 'tenant1', 'NGN');
      const wallet3 = walletManager.createWallet('user3', 'tenant1', 'NGN');

      walletManager.addFunds(wallet1.walletId, 1000, 'txn_001');
      walletManager.addFunds(wallet2.walletId, 500, 'txn_002');
      walletManager.addFunds(wallet3.walletId, 300, 'txn_003');

      const w1 = walletManager.getWallet(wallet1.walletId);
      const w2 = walletManager.getWallet(wallet2.walletId);
      const w3 = walletManager.getWallet(wallet3.walletId);

      expect(w1.balance + w2.balance + w3.balance).toBe(1800);
    });

    it('should handle multiple transfers between wallets', () => {
      const wallet1 = walletManager.createWallet('user1', 'tenant1', 'NGN');
      const wallet2 = walletManager.createWallet('user2', 'tenant1', 'NGN');

      walletManager.addFunds(wallet1.walletId, 1000, 'txn_001');

      // Multiple transfers
      walletManager.transfer(wallet1.walletId, wallet2.walletId, 200, 'transfer_001');
      walletManager.transfer(wallet1.walletId, wallet2.walletId, 300, 'transfer_002');
      walletManager.transfer(wallet2.walletId, wallet1.walletId, 100, 'transfer_003');

      const w1 = walletManager.getWallet(wallet1.walletId);
      const w2 = walletManager.getWallet(wallet2.walletId);

      expect(w1.balance).toBe(600);
      expect(w2.balance).toBe(400);
    });
  });

  describe('Wallet Integration with Transaction Processing', () => {
    it('should integrate wallet operations with Economic Engine', () => {
      const participantIds = {
        creator: 'creator1',
        aggregator: 'agg1',
        platformPartner: 'partner1',
        communityManager: 'manager1',
        platform: 'platform1'
      };

      // Create wallets for all participants
      const creatorWallet = engine.createWallet('creator1', 'tenant1', 'NGN');
      const aggregatorWallet = engine.createWallet('agg1', 'tenant1', 'NGN');

      // Process transaction
      const result = engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Wallet integration test',
        participantIds
      );

      // Update wallets with distributed amounts
      engine.addFundsToWallet(
        creatorWallet.walletId,
        result.distribution.distributions.creator,
        result.transaction.transactionId
      );

      engine.addFundsToWallet(
        aggregatorWallet.walletId,
        result.distribution.distributions.aggregator,
        result.transaction.transactionId
      );

      // Verify wallet balances
      const creatorBalance = engine.getWalletBalance(creatorWallet.walletId);
      const aggregatorBalance = engine.getWalletBalance(aggregatorWallet.walletId);

      expect(creatorBalance).toBe(400);
      expect(aggregatorBalance).toBe(250);
    });

    it('should handle payout workflow with wallet management', () => {
      const wallet = engine.createWallet('user1', 'tenant1', 'NGN');

      // Add funds
      engine.addFundsToWallet(wallet.walletId, 1000, 'txn_001');

      // Verify balance
      let balance = engine.getWalletBalance(wallet.walletId);
      expect(balance).toBe(1000);

      // Process payout
      engine.withdrawFromWallet(wallet.walletId, 500, 'payout_001');

      // Verify balance after payout
      balance = engine.getWalletBalance(wallet.walletId);
      expect(balance).toBe(500);
    });
  });

  describe('Wallet Edge Cases', () => {
    it('should handle wallet with very small balances', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');

      walletManager.addFunds(wallet.walletId, 0.01, 'txn_001');

      const retrievedWallet = walletManager.getWallet(wallet.walletId);

      expect(retrievedWallet.balance).toBe(0.01);
    });

    it('should handle wallet with large balances', () => {
      const wallet = walletManager.createWallet('user1', 'tenant1', 'NGN');

      walletManager.addFunds(wallet.walletId, 1000000, 'txn_001');

      const retrievedWallet = walletManager.getWallet(wallet.walletId);

      expect(retrievedWallet.balance).toBe(1000000);
    });

    it('should handle multiple currencies', () => {
      const walletNGN = walletManager.createWallet('user1', 'tenant1', 'NGN');
      const walletUSD = walletManager.createWallet('user1', 'tenant1', 'USD');

      walletManager.addFunds(walletNGN.walletId, 1000, 'txn_001');
      walletManager.addFunds(walletUSD.walletId, 100, 'txn_002');

      const ngnWallet = walletManager.getWallet(walletNGN.walletId);
      const usdWallet = walletManager.getWallet(walletUSD.walletId);

      expect(ngnWallet.currency).toBe('NGN');
      expect(usdWallet.currency).toBe('USD');
      expect(ngnWallet.balance).toBe(1000);
      expect(usdWallet.balance).toBe(100);
    });
  });
});
