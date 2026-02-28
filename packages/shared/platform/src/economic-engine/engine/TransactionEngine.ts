/**
 * Transaction Engine
 * Processes and records financial transactions
 */

import { Transaction, AuditEntry } from '../types/Transaction';
import { TransactionError, ValidationError } from '../errors/EconomicEngineError';
import * as crypto from 'crypto';

export class TransactionEngine {
  private transactions: Map<string, Transaction> = new Map();

  /**
   * Create a new transaction
   */
  createTransaction(
    tenantId: string,
    creatorId: string,
    amount: number,
    currency: string,
    description: string,
    metadata?: Record<string, any>
  ): Transaction {
    this.validateTransaction(amount, currency);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      action: 'CREATED',
      actor: creatorId,
      details: { amount, currency, description }
    };

    const transaction: Transaction = {
      transactionId,
      tenantId,
      creatorId,
      amount,
      currency,
      timestamp: new Date(),
      status: 'pending',
      description,
      metadata,
      auditTrail: [auditEntry]
    };

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): Transaction {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new TransactionError(`Transaction not found: ${transactionId}`);
    }
    return transaction;
  }

  /**
   * Complete a transaction
   */
  completeTransaction(transactionId: string, actor: string): Transaction {
    const transaction = this.getTransaction(transactionId);

    if (transaction.status !== 'pending') {
      throw new TransactionError(
        `Cannot complete transaction with status: ${transaction.status}`
      );
    }

    transaction.status = 'completed';
    transaction.auditTrail.push({
      timestamp: new Date(),
      action: 'COMPLETED',
      actor,
      details: { previousStatus: 'pending' }
    });

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  /**
   * Fail a transaction
   */
  failTransaction(transactionId: string, actor: string, reason: string): Transaction {
    const transaction = this.getTransaction(transactionId);

    transaction.status = 'failed';
    transaction.auditTrail.push({
      timestamp: new Date(),
      action: 'FAILED',
      actor,
      details: { reason }
    });

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  /**
   * Refund a transaction
   */
  refundTransaction(transactionId: string, actor: string, reason: string): Transaction {
    const transaction = this.getTransaction(transactionId);

    if (transaction.status !== 'completed') {
      throw new TransactionError(
        `Cannot refund transaction with status: ${transaction.status}`
      );
    }

    transaction.status = 'refunded';
    transaction.auditTrail.push({
      timestamp: new Date(),
      action: 'REFUNDED',
      actor,
      details: { reason, originalAmount: transaction.amount }
    });

    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  /**
   * Get transactions for a creator
   */
  getCreatorTransactions(creatorId: string, tenantId: string): Transaction[] {
    const creatorTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.creatorId === creatorId && transaction.tenantId === tenantId) {
        creatorTransactions.push(transaction);
      }
    }
    return creatorTransactions;
  }

  /**
   * Get transactions for a tenant
   */
  getTenantTransactions(tenantId: string): Transaction[] {
    const tenantTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.tenantId === tenantId) {
        tenantTransactions.push(transaction);
      }
    }
    return tenantTransactions;
  }

  /**
   * Calculate transaction hash for integrity verification
   */
  calculateTransactionHash(transaction: Transaction): string {
    const data = JSON.stringify({
      transactionId: transaction.transactionId,
      tenantId: transaction.tenantId,
      creatorId: transaction.creatorId,
      amount: transaction.amount,
      currency: transaction.currency,
      timestamp: transaction.timestamp.toISOString(),
      status: transaction.status
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify transaction integrity
   */
  verifyTransactionIntegrity(transaction: Transaction, hash: string): boolean {
    const calculatedHash = this.calculateTransactionHash(transaction);
    return calculatedHash === hash;
  }

  /**
   * Validate transaction
   */
  private validateTransaction(amount: number, currency: string): void {
    if (amount <= 0) {
      throw new ValidationError('Transaction amount must be greater than 0');
    }

    if (!currency || currency.length === 0) {
      throw new ValidationError('Currency is required');
    }

    if (currency.length > 3) {
      throw new ValidationError('Currency code must be 3 characters or less');
    }
  }

  /**
   * Get transaction count
   */
  getTransactionCount(): number {
    return this.transactions.size;
  }

  /**
   * Get total transaction volume
   */
  getTotalVolume(tenantId?: string): number {
    let total = 0;
    for (const transaction of this.transactions.values()) {
      if (!tenantId || transaction.tenantId === tenantId) {
        if (transaction.status === 'completed') {
          total += transaction.amount;
        }
      }
    }
    return Math.round(total * 100) / 100;
  }

  /**
   * Clear all transactions (for testing)
   */
  clear(): void {
    this.transactions.clear();
  }
}
