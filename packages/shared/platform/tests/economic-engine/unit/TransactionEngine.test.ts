/**
 * Unit Tests for TransactionEngine
 */

import { TransactionEngine } from '../../../src/economic-engine/engine/TransactionEngine';
import { TransactionError, ValidationError } from '../../../src/economic-engine/errors/EconomicEngineError';

describe('TransactionEngine', () => {
  let engine: TransactionEngine;

  beforeEach(() => {
    engine = new TransactionEngine();
  });

  describe('createTransaction', () => {
    it('should create a transaction with valid data', () => {
      const transaction = engine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test transaction'
      );

      expect(transaction.transactionId).toBeDefined();
      expect(transaction.tenantId).toBe('tenant1');
      expect(transaction.creatorId).toBe('creator1');
      expect(transaction.amount).toBe(1000);
      expect(transaction.currency).toBe('NGN');
      expect(transaction.status).toBe('pending');
      expect(transaction.auditTrail).toHaveLength(1);
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        engine.createTransaction('tenant1', 'creator1', -100, 'NGN', 'Test');
      }).toThrow(ValidationError);
    });

    it('should throw error for zero amount', () => {
      expect(() => {
        engine.createTransaction('tenant1', 'creator1', 0, 'NGN', 'Test');
      }).toThrow(ValidationError);
    });

    it('should throw error for empty currency', () => {
      expect(() => {
        engine.createTransaction('tenant1', 'creator1', 100, '', 'Test');
      }).toThrow(ValidationError);
    });

    it('should throw error for currency longer than 3 characters', () => {
      expect(() => {
        engine.createTransaction('tenant1', 'creator1', 100, 'NGNN', 'Test');
      }).toThrow(ValidationError);
    });

    it('should create transaction with metadata', () => {
      const metadata = { reference: 'REF123', category: 'service' };
      const transaction = engine.createTransaction(
        'tenant1',
        'creator1',
        1000,
        'NGN',
        'Test',
        metadata
      );

      expect(transaction.metadata).toEqual(metadata);
    });
  });

  describe('getTransaction', () => {
    it('should retrieve a transaction by ID', () => {
      const created = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      const retrieved = engine.getTransaction(created.transactionId);

      expect(retrieved).toEqual(created);
    });

    it('should throw error for non-existent transaction', () => {
      expect(() => {
        engine.getTransaction('non-existent');
      }).toThrow(TransactionError);
    });
  });

  describe('completeTransaction', () => {
    it('should complete a pending transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      const completed = engine.completeTransaction(transaction.transactionId, 'actor1');

      expect(completed.status).toBe('completed');
      expect(completed.auditTrail).toHaveLength(2);
      expect(completed.auditTrail[1].action).toBe('COMPLETED');
    });

    it('should throw error when completing non-pending transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      engine.completeTransaction(transaction.transactionId, 'actor1');

      expect(() => {
        engine.completeTransaction(transaction.transactionId, 'actor1');
      }).toThrow(TransactionError);
    });
  });

  describe('failTransaction', () => {
    it('should fail a transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      const failed = engine.failTransaction(transaction.transactionId, 'actor1', 'Invalid data');

      expect(failed.status).toBe('failed');
      expect(failed.auditTrail).toHaveLength(2);
      expect(failed.auditTrail[1].action).toBe('FAILED');
      expect(failed.auditTrail[1].details.reason).toBe('Invalid data');
    });
  });

  describe('refundTransaction', () => {
    it('should refund a completed transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      engine.completeTransaction(transaction.transactionId, 'actor1');
      const refunded = engine.refundTransaction(transaction.transactionId, 'actor1', 'Customer request');

      expect(refunded.status).toBe('refunded');
      expect(refunded.auditTrail).toHaveLength(3);
      expect(refunded.auditTrail[2].action).toBe('REFUNDED');
    });

    it('should throw error when refunding non-completed transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');

      expect(() => {
        engine.refundTransaction(transaction.transactionId, 'actor1', 'Refund');
      }).toThrow(TransactionError);
    });
  });

  describe('getCreatorTransactions', () => {
    it('should retrieve all transactions for a creator', () => {
      engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test1');
      engine.createTransaction('tenant1', 'creator1', 2000, 'NGN', 'Test2');
      engine.createTransaction('tenant1', 'creator2', 3000, 'NGN', 'Test3');

      const transactions = engine.getCreatorTransactions('creator1', 'tenant1');

      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.creatorId === 'creator1')).toBe(true);
    });

    it('should return empty array for creator with no transactions', () => {
      const transactions = engine.getCreatorTransactions('non-existent', 'tenant1');

      expect(transactions).toHaveLength(0);
    });
  });

  describe('getTenantTransactions', () => {
    it('should retrieve all transactions for a tenant', () => {
      engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test1');
      engine.createTransaction('tenant1', 'creator2', 2000, 'NGN', 'Test2');
      engine.createTransaction('tenant2', 'creator3', 3000, 'NGN', 'Test3');

      const transactions = engine.getTenantTransactions('tenant1');

      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.tenantId === 'tenant1')).toBe(true);
    });
  });

  describe('calculateTransactionHash', () => {
    it('should calculate consistent hash for transaction', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      const hash1 = engine.calculateTransactionHash(transaction);
      const hash2 = engine.calculateTransactionHash(transaction);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });
  });

  describe('verifyTransactionIntegrity', () => {
    it('should verify transaction integrity', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');
      const hash = engine.calculateTransactionHash(transaction);

      expect(engine.verifyTransactionIntegrity(transaction, hash)).toBe(true);
    });

    it('should fail verification with incorrect hash', () => {
      const transaction = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test');

      expect(engine.verifyTransactionIntegrity(transaction, 'incorrect-hash')).toBe(false);
    });
  });

  describe('getTotalVolume', () => {
    it('should calculate total volume for completed transactions', () => {
      const t1 = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test1');
      const t2 = engine.createTransaction('tenant1', 'creator1', 2000, 'NGN', 'Test2');
      const t3 = engine.createTransaction('tenant1', 'creator1', 500, 'NGN', 'Test3');

      engine.completeTransaction(t1.transactionId, 'actor1');
      engine.completeTransaction(t2.transactionId, 'actor1');
      engine.completeTransaction(t3.transactionId, 'actor1');

      const volume = engine.getTotalVolume('tenant1');

      expect(volume).toBe(3500);
    });

    it('should not include pending transactions in volume', () => {
      const t1 = engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test1');
      const t2 = engine.createTransaction('tenant1', 'creator1', 2000, 'NGN', 'Test2');

      engine.completeTransaction(t1.transactionId, 'actor1');

      const volume = engine.getTotalVolume('tenant1');

      expect(volume).toBe(1000);
    });
  });

  describe('getTransactionCount', () => {
    it('should return correct transaction count', () => {
      engine.createTransaction('tenant1', 'creator1', 1000, 'NGN', 'Test1');
      engine.createTransaction('tenant1', 'creator1', 2000, 'NGN', 'Test2');

      expect(engine.getTransactionCount()).toBe(2);
    });
  });
});
