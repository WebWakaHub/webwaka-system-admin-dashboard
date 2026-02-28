/**
 * Economic Engine (MLAS Core)
 * Main orchestrator for the Economic Engine module
 */

import { Transaction, RevenueDistribution, Commission, Wallet, Payout } from './types/Transaction';
import { RevenueDistributor } from './engine/RevenueDistributor';
import { CommissionCalculator } from './engine/CommissionCalculator';
import { WalletManager } from './engine/WalletManager';
import { TransactionEngine } from './engine/TransactionEngine';

export class EconomicEngine {
  private transactionEngine: TransactionEngine;
  private revenueDistributor: RevenueDistributor;
  private commissionCalculator: CommissionCalculator;
  private walletManager: WalletManager;

  constructor() {
    this.transactionEngine = new TransactionEngine();
    this.revenueDistributor = new RevenueDistributor();
    this.commissionCalculator = new CommissionCalculator();
    this.walletManager = new WalletManager();
  }

  /**
   * Process a complete transaction with revenue distribution
   */
  processTransaction(
    tenantId: string,
    creatorId: string,
    amount: number,
    currency: string,
    description: string,
    participantIds: Record<string, string>,
    metadata?: Record<string, any>
  ): {
    transaction: Transaction;
    distribution: RevenueDistribution;
    commissions: Commission[];
  } {
    // Create transaction
    const transaction = this.transactionEngine.createTransaction(
      tenantId,
      creatorId,
      amount,
      currency,
      description,
      metadata
    );

    // Complete transaction
    this.transactionEngine.completeTransaction(transaction.transactionId, creatorId);
    const completedTransaction = this.transactionEngine.getTransaction(transaction.transactionId);

    // Distribute revenue
    const distribution = this.revenueDistributor.distributeRevenue(completedTransaction);

    // Calculate commissions
    const commissions = this.commissionCalculator.calculateAllCommissions(
      distribution.distributions,
      participantIds
    );

    return {
      transaction: completedTransaction,
      distribution,
      commissions
    };
  }

  /**
   * Create a wallet for a user
   */
  createWallet(userId: string, tenantId: string, currency?: string): Wallet {
    return this.walletManager.createWallet(userId, tenantId, currency);
  }

  /**
   * Get wallet by ID
   */
  getWallet(walletId: string): Wallet {
    return this.walletManager.getWallet(walletId);
  }

  /**
   * Add funds to wallet
   */
  addFundsToWallet(walletId: string, amount: number, transactionId: string): Wallet {
    return this.walletManager.addFunds(walletId, amount, transactionId);
  }

  /**
   * Withdraw funds from wallet
   */
  withdrawFromWallet(walletId: string, amount: number, transactionId: string): Wallet {
    return this.walletManager.withdrawFunds(walletId, amount, transactionId);
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(walletId: string): number {
    return this.walletManager.getBalance(walletId);
  }

  /**
   * Transfer funds between wallets
   */
  transferFunds(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    transactionId: string
  ): { from: Wallet; to: Wallet } {
    return this.walletManager.transfer(fromWalletId, toWalletId, amount, transactionId);
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): Transaction {
    return this.transactionEngine.getTransaction(transactionId);
  }

  /**
   * Get creator transactions
   */
  getCreatorTransactions(creatorId: string, tenantId: string): Transaction[] {
    return this.transactionEngine.getCreatorTransactions(creatorId, tenantId);
  }

  /**
   * Get tenant transactions
   */
  getTenantTransactions(tenantId: string): Transaction[] {
    return this.transactionEngine.getTenantTransactions(tenantId);
  }

  /**
   * Get revenue sharing model
   */
  getRevenueSharingModel() {
    return this.revenueDistributor.getRevenueSharingModel();
  }

  /**
   * Get revenue distribution percentages
   */
  getDistributionPercentages(): Record<string, number> {
    return this.revenueDistributor.getDistributionPercentages();
  }

  /**
   * Get commission config
   */
  getCommissionConfig() {
    return this.commissionCalculator.getConfig();
  }

  /**
   * Get total transaction volume
   */
  getTotalVolume(tenantId?: string): number {
    return this.transactionEngine.getTotalVolume(tenantId);
  }

  /**
   * Get transaction count
   */
  getTransactionCount(): number {
    return this.transactionEngine.getTransactionCount();
  }

  /**
   * Get statistics
   */
  getStatistics(tenantId?: string) {
    return {
      transactionCount: this.transactionEngine.getTransactionCount(),
      totalVolume: this.transactionEngine.getTotalVolume(tenantId),
      timestamp: new Date()
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.transactionEngine.clear();
    this.walletManager.clear();
  }
}
