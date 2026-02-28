/**
 * Unit Tests for EconomicEngine
 */

import { EconomicEngine } from '../../../src/economic-engine/EconomicEngine';

describe('EconomicEngine', () => {
  let engine: EconomicEngine;

  beforeEach(() => {
    engine = new EconomicEngine();
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(engine).toBeDefined();
    });

    it('should have all methods available', () => {
      expect(typeof engine.processTransaction).toBe('function');
      expect(typeof engine.createWallet).toBe('function');
      expect(typeof engine.getWallet).toBe('function');
      expect(typeof engine.addFundsToWallet).toBe('function');
      expect(typeof engine.withdrawFromWallet).toBe('function');
      expect(typeof engine.transferFunds).toBe('function');
      expect(typeof engine.getTransaction).toBe('function');
      expect(typeof engine.getCreatorTransactions).toBe('function');
      expect(typeof engine.getTenantTransactions).toBe('function');
    });
  });

  describe('processTransaction', () => {
    it('should process a complete transaction', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      const result = engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test transaction',
        participantIds
      );

      expect(result.transaction).toBeDefined();
      expect(result.transaction.tenantId).toBe('tenant1');
      expect(result.transaction.creatorId).toBe('creator1');
      expect(result.transaction.amount).toBe(1000);
      expect(result.distribution).toBeDefined();
      expect(result.commissions).toBeDefined();
    });

    it('should distribute revenue correctly', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      const result = engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test transaction',
        participantIds
      );

      expect(result.distribution.distributions.creator).toBe(400);
      expect(result.distribution.distributions.aggregator).toBe(250);
      expect(result.distribution.distributions.platformPartner).toBe(200);
      expect(result.distribution.distributions.communityManager).toBe(100);
      expect(result.distribution.distributions.platform).toBe(50);
    });

    it('should calculate commissions for all participants', () => {
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
        1000,
        'NGN',
        'Test transaction',
        participantIds
      );

      expect(result.commissions).toBeDefined();
      expect(result.commissions.length).toBeGreaterThan(0);
    });

    it('should handle multiple transactions', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      const result1 = engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      const result2 = engine.processTransaction(
        'tenant1',
        'creator2',
        2000,
        'NGN',
        'Transaction 2',
        participantIds
      );

      expect(result1.transaction.transactionId).not.toBe(result2.transaction.transactionId);
      expect(result2.transaction.amount).toBe(2000);
    });
  });

  describe('wallet management', () => {
    it('should create a wallet', () => {
      const wallet = engine.createWallet('user1', 'tenant1', 'NGN');

      expect(wallet).toBeDefined();
      expect(wallet.userId).toBe('user1');
      expect(wallet.tenantId).toBe('tenant1');
      expect(wallet.balance).toBe(0);
    });

    it('should get wallet by ID', () => {
      const createdWallet = engine.createWallet('user1', 'tenant1', 'NGN');
      const retrievedWallet = engine.getWallet(createdWallet.walletId);

      expect(retrievedWallet).toBeDefined();
      expect(retrievedWallet.walletId).toBe(createdWallet.walletId);
    });

    it('should add funds to wallet', () => {
      const wallet = engine.createWallet('user1', 'tenant1', 'NGN');
      const updated = engine.addFundsToWallet(wallet.walletId, 1000, 'txn_001');

      expect(updated.balance).toBe(1000);
    });

    it('should withdraw funds from wallet', () => {
      const wallet = engine.createWallet('user1', 'tenant1', 'NGN');
      engine.addFundsToWallet(wallet.walletId, 1000, 'txn_001');
      const updated = engine.withdrawFromWallet(wallet.walletId, 500, 'txn_002');

      expect(updated.balance).toBe(500);
    });

    it('should get wallet balance', () => {
      const wallet = engine.createWallet('user1', 'tenant1', 'NGN');
      engine.addFundsToWallet(wallet.walletId, 1000, 'txn_001');

      const balance = engine.getWalletBalance(wallet.walletId);

      expect(balance).toBe(1000);
    });

    it('should transfer funds between wallets', () => {
      const wallet1 = engine.createWallet('user1', 'tenant1', 'NGN');
      const wallet2 = engine.createWallet('user2', 'tenant1', 'NGN');

      engine.addFundsToWallet(wallet1.walletId, 1000, 'txn_001');

      const result = engine.transferFunds(wallet1.walletId, wallet2.walletId, 500, 'txn_002');

      expect(result.from.balance).toBe(500);
      expect(result.to.balance).toBe(500);
    });
  });

  describe('transaction retrieval', () => {
    it('should get transaction by ID', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      const result = engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test transaction',
        participantIds
      );

      const retrieved = engine.getTransaction(result.transaction.transactionId);

      expect(retrieved).toBeDefined();
      expect(retrieved.transactionId).toBe(result.transaction.transactionId);
    });

    it('should get creator transactions', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      engine.processTransaction(
        'tenant1',
        'creator1',
        2000,
        'NGN',
        'Transaction 2',
        participantIds
      );

      const transactions = engine.getCreatorTransactions('creator1', 'tenant1');

      expect(transactions.length).toBe(2);
      expect(transactions.every(t => t.creatorId === 'creator1')).toBe(true);
    });

    it('should get tenant transactions', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      engine.processTransaction(
        'tenant1',
        'creator2',
        2000,
        'NGN',
        'Transaction 2',
        participantIds
      );

      const transactions = engine.getTenantTransactions('tenant1');

      expect(transactions.length).toBe(2);
      expect(transactions.every(t => t.tenantId === 'tenant1')).toBe(true);
    });
  });

  describe('configuration and statistics', () => {
    it('should get revenue sharing model', () => {
      const model = engine.getRevenueSharingModel();

      expect(model).toBeDefined();
      expect(model.creator).toBe(0.40);
      expect(model.aggregator).toBe(0.25);
      expect(model.platformPartner).toBe(0.20);
      expect(model.communityManager).toBe(0.10);
      expect(model.platform).toBe(0.05);
    });

    it('should get distribution percentages', () => {
      const percentages = engine.getDistributionPercentages();

      expect(percentages).toBeDefined();
      expect(percentages.creator).toBe(40);
      expect(percentages.aggregator).toBe(25);
    });

    it('should get commission config', () => {
      const config = engine.getCommissionConfig();

      expect(config).toBeDefined();
      expect(config.baseMultipliers).toBeDefined();
      expect(config.performanceBonus).toBe(0.1);
      expect(config.engagementBonus).toBe(0.05);
    });

    it('should get total volume', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      engine.processTransaction(
        'tenant1',
        'creator2',
        2000,
        'NGN',
        'Transaction 2',
        participantIds
      );

      const volume = engine.getTotalVolume('tenant1');

      expect(volume).toBe(3000);
    });

    it('should get transaction count', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      engine.processTransaction(
        'tenant1',
        'creator2',
        2000,
        'NGN',
        'Transaction 2',
        participantIds
      );

      const count = engine.getTransactionCount();

      expect(count).toBe(2);
    });

    it('should get statistics', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      const stats = engine.getStatistics('tenant1');

      expect(stats).toBeDefined();
      expect(stats.transactionCount).toBe(1);
      expect(stats.totalVolume).toBe(1000);
      expect(stats.timestamp).toBeDefined();
    });
  });

  describe('data clearing', () => {
    it('should clear all data', () => {
      const participantIds = {
        aggregatorId: 'agg1',
        platformPartnerId: 'partner1',
        communityManagerId: 'manager1'
      };

      engine.processTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Transaction 1',
        participantIds
      );

      engine.clear();

      const count = engine.getTransactionCount();

      expect(count).toBe(0);
    });
  });
});
