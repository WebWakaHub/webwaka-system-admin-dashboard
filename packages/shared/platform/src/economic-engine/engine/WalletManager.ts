/**
 * Wallet Manager
 * Manages digital wallets and balance tracking
 */

import { Wallet } from '../types/Transaction';
import { WalletError, ValidationError, InsufficientFundsError } from '../errors/EconomicEngineError';

export class WalletManager {
  private wallets: Map<string, Wallet> = new Map();

  /**
   * Create a new wallet
   */
  createWallet(userId: string, tenantId: string, currency: string = 'NGN'): Wallet {
    const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const wallet: Wallet = {
      walletId,
      userId,
      tenantId,
      balance: 0,
      currency,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wallets.set(walletId, wallet);
    return wallet;
  }

  /**
   * Get wallet by ID
   */
  getWallet(walletId: string): Wallet {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new WalletError(`Wallet not found: ${walletId}`);
    }
    return wallet;
  }

  /**
   * Get wallet by user ID
   */
  getWalletByUserId(userId: string, tenantId: string): Wallet | undefined {
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId && wallet.tenantId === tenantId) {
        return wallet;
      }
    }
    return undefined;
  }

  /**
   * Add funds to wallet
   */
  addFunds(walletId: string, amount: number, transactionId: string): Wallet {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    const wallet = this.getWallet(walletId);
    wallet.balance += amount;
    wallet.balance = Math.round(wallet.balance * 100) / 100;
    wallet.transactions.push(transactionId);
    wallet.updatedAt = new Date();

    this.wallets.set(walletId, wallet);
    return wallet;
  }

  /**
   * Withdraw funds from wallet
   */
  withdrawFunds(walletId: string, amount: number, transactionId: string): Wallet {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    const wallet = this.getWallet(walletId);

    if (wallet.balance < amount) {
      throw new InsufficientFundsError(wallet.balance, amount);
    }

    wallet.balance -= amount;
    wallet.balance = Math.round(wallet.balance * 100) / 100;
    wallet.transactions.push(transactionId);
    wallet.updatedAt = new Date();

    this.wallets.set(walletId, wallet);
    return wallet;
  }

  /**
   * Get wallet balance
   */
  getBalance(walletId: string): number {
    const wallet = this.getWallet(walletId);
    return wallet.balance;
  }

  /**
   * Transfer funds between wallets
   */
  transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    transactionId: string
  ): { from: Wallet; to: Wallet } {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    const fromWallet = this.getWallet(fromWalletId);
    const toWallet = this.getWallet(toWalletId);

    if (fromWallet.balance < amount) {
      throw new InsufficientFundsError(fromWallet.balance, amount);
    }

    // Perform transfer
    fromWallet.balance -= amount;
    fromWallet.balance = Math.round(fromWallet.balance * 100) / 100;
    fromWallet.transactions.push(transactionId);
    fromWallet.updatedAt = new Date();

    toWallet.balance += amount;
    toWallet.balance = Math.round(toWallet.balance * 100) / 100;
    toWallet.transactions.push(transactionId);
    toWallet.updatedAt = new Date();

    this.wallets.set(fromWalletId, fromWallet);
    this.wallets.set(toWalletId, toWallet);

    return { from: fromWallet, to: toWallet };
  }

  /**
   * Get all wallets for a user
   */
  getUserWallets(userId: string, tenantId: string): Wallet[] {
    const userWallets: Wallet[] = [];
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId && wallet.tenantId === tenantId) {
        userWallets.push(wallet);
      }
    }
    return userWallets;
  }

  /**
   * Verify wallet exists
   */
  walletExists(walletId: string): boolean {
    return this.wallets.has(walletId);
  }

  /**
   * Get wallet transaction history
   */
  getTransactionHistory(walletId: string): string[] {
    const wallet = this.getWallet(walletId);
    return [...wallet.transactions];
  }

  /**
   * Clear all wallets (for testing)
   */
  clear(): void {
    this.wallets.clear();
  }
}
