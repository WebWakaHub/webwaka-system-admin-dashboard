/**
 * Unit Tests for WalletManager
 */

import { WalletManager } from '../../../src/economic-engine/engine/WalletManager';
import { WalletError, ValidationError, InsufficientFundsError } from '../../../src/economic-engine/errors/EconomicEngineError';

describe('WalletManager', () => {
  let manager: WalletManager;

  beforeEach(() => {
    manager = new WalletManager();
  });

  describe('createWallet', () => {
    it('should create a wallet with default currency', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(wallet.walletId).toBeDefined();
      expect(wallet.userId).toBe('user1');
      expect(wallet.tenantId).toBe('tenant1');
      expect(wallet.balance).toBe(0);
      expect(wallet.currency).toBe('NGN');
      expect(wallet.transactions).toHaveLength(0);
    });

    it('should create a wallet with custom currency', () => {
      const wallet = manager.createWallet('user1', 'tenant1', 'USD');

      expect(wallet.currency).toBe('USD');
    });
  });

  describe('getWallet', () => {
    it('should retrieve a wallet by ID', () => {
      const created = manager.createWallet('user1', 'tenant1');
      const retrieved = manager.getWallet(created.walletId);

      expect(retrieved).toEqual(created);
    });

    it('should throw error for non-existent wallet', () => {
      expect(() => {
        manager.getWallet('non-existent');
      }).toThrow(WalletError);
    });
  });

  describe('getWalletByUserId', () => {
    it('should retrieve wallet by user ID', () => {
      const created = manager.createWallet('user1', 'tenant1');
      const retrieved = manager.getWalletByUserId('user1', 'tenant1');

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for non-existent user', () => {
      const retrieved = manager.getWalletByUserId('non-existent', 'tenant1');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('addFunds', () => {
    it('should add funds to wallet', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      const updated = manager.addFunds(wallet.walletId, 1000, 'txn1');

      expect(updated.balance).toBe(1000);
      expect(updated.transactions).toContain('txn1');
    });

    it('should throw error for negative amount', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(() => {
        manager.addFunds(wallet.walletId, -100, 'txn1');
      }).toThrow(ValidationError);
    });

    it('should throw error for zero amount', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(() => {
        manager.addFunds(wallet.walletId, 0, 'txn1');
      }).toThrow(ValidationError);
    });

    it('should accumulate funds', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      manager.addFunds(wallet.walletId, 1000, 'txn1');
      const updated = manager.addFunds(wallet.walletId, 500, 'txn2');

      expect(updated.balance).toBe(1500);
    });
  });

  describe('withdrawFunds', () => {
    it('should withdraw funds from wallet', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      manager.addFunds(wallet.walletId, 1000, 'txn1');
      const updated = manager.withdrawFunds(wallet.walletId, 300, 'txn2');

      expect(updated.balance).toBe(700);
      expect(updated.transactions).toContain('txn2');
    });

    it('should throw error for insufficient funds', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      manager.addFunds(wallet.walletId, 100, 'txn1');

      expect(() => {
        manager.withdrawFunds(wallet.walletId, 200, 'txn2');
      }).toThrow(InsufficientFundsError);
    });

    it('should throw error for negative amount', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(() => {
        manager.withdrawFunds(wallet.walletId, -100, 'txn1');
      }).toThrow(ValidationError);
    });

    it('should throw error for zero amount', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(() => {
        manager.withdrawFunds(wallet.walletId, 0, 'txn1');
      }).toThrow(ValidationError);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      manager.addFunds(wallet.walletId, 1000, 'txn1');

      const balance = manager.getBalance(wallet.walletId);

      expect(balance).toBe(1000);
    });

    it('should throw error for non-existent wallet', () => {
      expect(() => {
        manager.getBalance('non-existent');
      }).toThrow(WalletError);
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', () => {
      const wallet1 = manager.createWallet('user1', 'tenant1');
      const wallet2 = manager.createWallet('user2', 'tenant1');

      manager.addFunds(wallet1.walletId, 1000, 'txn1');
      const result = manager.transfer(wallet1.walletId, wallet2.walletId, 300, 'txn2');

      expect(result.from.balance).toBe(700);
      expect(result.to.balance).toBe(300);
    });

    it('should throw error for insufficient funds', () => {
      const wallet1 = manager.createWallet('user1', 'tenant1');
      const wallet2 = manager.createWallet('user2', 'tenant1');

      manager.addFunds(wallet1.walletId, 100, 'txn1');

      expect(() => {
        manager.transfer(wallet1.walletId, wallet2.walletId, 200, 'txn2');
      }).toThrow(InsufficientFundsError);
    });

    it('should throw error for negative amount', () => {
      const wallet1 = manager.createWallet('user1', 'tenant1');
      const wallet2 = manager.createWallet('user2', 'tenant1');

      expect(() => {
        manager.transfer(wallet1.walletId, wallet2.walletId, -100, 'txn1');
      }).toThrow(ValidationError);
    });
  });

  describe('getUserWallets', () => {
    it('should retrieve all wallets for a user', () => {
      manager.createWallet('user1', 'tenant1');
      manager.createWallet('user1', 'tenant1');
      manager.createWallet('user2', 'tenant1');

      const wallets = manager.getUserWallets('user1', 'tenant1');

      expect(wallets).toHaveLength(2);
      expect(wallets.every(w => w.userId === 'user1')).toBe(true);
    });

    it('should return empty array for user with no wallets', () => {
      const wallets = manager.getUserWallets('non-existent', 'tenant1');

      expect(wallets).toHaveLength(0);
    });
  });

  describe('walletExists', () => {
    it('should return true for existing wallet', () => {
      const wallet = manager.createWallet('user1', 'tenant1');

      expect(manager.walletExists(wallet.walletId)).toBe(true);
    });

    it('should return false for non-existent wallet', () => {
      expect(manager.walletExists('non-existent')).toBe(false);
    });
  });

  describe('getTransactionHistory', () => {
    it('should retrieve transaction history', () => {
      const wallet = manager.createWallet('user1', 'tenant1');
      manager.addFunds(wallet.walletId, 1000, 'txn1');
      manager.addFunds(wallet.walletId, 500, 'txn2');

      const history = manager.getTransactionHistory(wallet.walletId);

      expect(history).toHaveLength(2);
      expect(history).toContain('txn1');
      expect(history).toContain('txn2');
    });
  });
});
