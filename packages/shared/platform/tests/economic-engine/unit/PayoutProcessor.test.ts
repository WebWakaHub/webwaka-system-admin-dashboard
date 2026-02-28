/**
 * PayoutProcessor Unit Tests
 */

import { PayoutProcessor, PayoutStatus } from '../../../src/economic-engine/components/PayoutProcessor';

describe('PayoutProcessor', () => {
  let processor: PayoutProcessor;

  beforeEach(() => {
    processor = new PayoutProcessor();
  });

  describe('createPayoutRequest', () => {
    it('should create a payout request', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      expect(payout).toBeDefined();
      expect(payout.participantId).toBe('participant1');
      expect(payout.tenantId).toBe('tenant1');
      expect(payout.amount).toBe(5000);
      expect(payout.currency).toBe('NGN');
      expect(payout.status).toBe(PayoutStatus.PENDING);
    });

    it('should throw error if amount is below minimum', () => {
      expect(() => processor.createPayoutRequest('participant1', 'tenant1', 50, 'NGN')).toThrow();
    });

    it('should throw error if amount exceeds maximum', () => {
      expect(() => processor.createPayoutRequest('participant1', 'tenant1', 2000000, 'NGN')).toThrow();
    });

    it('should emit payout-requested event', (done) => {
      processor.on('payout-requested', (payout) => {
        expect(payout).toBeDefined();
        done();
      });

      processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
    });

    it('should include bank account details', () => {
      const bankAccount = {
        accountNumber: '1234567890',
        bankCode: '044',
        accountName: 'John Doe',
      };

      const payout = processor.createPayoutRequest(
        'participant1',
        'tenant1',
        5000,
        'NGN',
        bankAccount
      );

      expect(payout.bankAccount).toEqual(bankAccount);
    });

    it('should include mobile wallet details', () => {
      const mobileWallet = {
        phoneNumber: '+2348012345678',
        provider: 'MTN',
      };

      const payout = processor.createPayoutRequest(
        'participant1',
        'tenant1',
        5000,
        'NGN',
        undefined,
        mobileWallet
      );

      expect(payout.mobileWallet).toEqual(mobileWallet);
    });
  });

  describe('getPayout', () => {
    it('should retrieve a payout request', () => {
      const createdPayout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      const retrievedPayout = processor.getPayout(createdPayout.payoutId);

      expect(retrievedPayout).toBeDefined();
      expect(retrievedPayout?.payoutId).toBe(createdPayout.payoutId);
    });

    it('should return undefined for non-existent payout', () => {
      const payout = processor.getPayout('non-existent');
      expect(payout).toBeUndefined();
    });
  });

  describe('getPayoutsByParticipant', () => {
    it('should retrieve all payouts for a participant', () => {
      processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.createPayoutRequest('participant1', 'tenant1', 3000, 'NGN');
      processor.createPayoutRequest('participant2', 'tenant1', 2000, 'NGN');

      const payouts = processor.getPayoutsByParticipant('participant1', 'tenant1');

      expect(payouts.length).toBe(2);
      expect(payouts.every(p => p.participantId === 'participant1')).toBe(true);
    });
  });

  describe('getPayoutsByStatus', () => {
    it('should retrieve all payouts with a specific status', () => {
      const payout1 = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      const payout2 = processor.createPayoutRequest('participant2', 'tenant1', 3000, 'NGN');

      processor.approvePayout(payout1.payoutId);

      const pendingPayouts = processor.getPayoutsByStatus(PayoutStatus.PENDING);
      const approvedPayouts = processor.getPayoutsByStatus(PayoutStatus.APPROVED);

      expect(pendingPayouts.length).toBe(1);
      expect(approvedPayouts.length).toBe(1);
    });
  });

  describe('approvePayout', () => {
    it('should approve a pending payout', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      const approved = processor.approvePayout(payout.payoutId);

      expect(approved.status).toBe(PayoutStatus.APPROVED);
    });

    it('should emit payout-approved event', (done) => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      processor.on('payout-approved', (approvedPayout) => {
        expect(approvedPayout.payoutId).toBe(payout.payoutId);
        done();
      });

      processor.approvePayout(payout.payoutId);
    });

    it('should throw error if payout is not pending', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);

      expect(() => processor.approvePayout(payout.payoutId)).toThrow();
    });
  });

  describe('processPayout', () => {
    it('should process an approved payout', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);

      const processed = processor.processPayout(payout.payoutId);

      expect(processed.status).toBe(PayoutStatus.PROCESSING);
      expect(processed.processedAt).toBeDefined();
    });

    it('should emit payout-processing event', (done) => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);

      processor.on('payout-processing', (processingPayout) => {
        expect(processingPayout.payoutId).toBe(payout.payoutId);
        done();
      });

      processor.processPayout(payout.payoutId);
    });
  });

  describe('completePayout', () => {
    it('should complete a processing payout', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);
      processor.processPayout(payout.payoutId);

      const completed = processor.completePayout(payout.payoutId);

      expect(completed.status).toBe(PayoutStatus.COMPLETED);
      expect(completed.completedAt).toBeDefined();
    });

    it('should emit payout-completed event', (done) => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);
      processor.processPayout(payout.payoutId);

      processor.on('payout-completed', (completedPayout) => {
        expect(completedPayout.payoutId).toBe(payout.payoutId);
        done();
      });

      processor.completePayout(payout.payoutId);
    });
  });

  describe('failPayout', () => {
    it('should fail a payout with reason', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      const failed = processor.failPayout(payout.payoutId, 'Insufficient funds');

      expect(failed.status).toBe(PayoutStatus.FAILED);
      expect(failed.failureReason).toBe('Insufficient funds');
    });

    it('should emit payout-failed event', (done) => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      processor.on('payout-failed', (failedPayout) => {
        expect(failedPayout.payoutId).toBe(payout.payoutId);
        done();
      });

      processor.failPayout(payout.payoutId, 'Insufficient funds');
    });
  });

  describe('cancelPayout', () => {
    it('should cancel a pending payout', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      const cancelled = processor.cancelPayout(payout.payoutId);

      expect(cancelled.status).toBe(PayoutStatus.CANCELLED);
    });

    it('should emit payout-cancelled event', (done) => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');

      processor.on('payout-cancelled', (cancelledPayout) => {
        expect(cancelledPayout.payoutId).toBe(payout.payoutId);
        done();
      });

      processor.cancelPayout(payout.payoutId);
    });

    it('should throw error if payout is already completed', () => {
      const payout = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.approvePayout(payout.payoutId);
      processor.processPayout(payout.payoutId);
      processor.completePayout(payout.payoutId);

      expect(() => processor.cancelPayout(payout.payoutId)).toThrow();
    });
  });

  describe('getPayoutStats', () => {
    it('should return payout statistics', () => {
      processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.createPayoutRequest('participant2', 'tenant1', 3000, 'NGN');

      const stats = processor.getPayoutStats();

      expect(stats.totalPayouts).toBe(2);
      expect(stats.totalAmount).toBe(8000);
      expect(stats.pendingCount).toBe(2);
    });

    it('should track payout status counts', () => {
      const payout1 = processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      const payout2 = processor.createPayoutRequest('participant2', 'tenant1', 3000, 'NGN');

      processor.approvePayout(payout1.payoutId);
      processor.processPayout(payout1.payoutId);

      const stats = processor.getPayoutStats();

      expect(stats.approvedCount).toBe(0);
      expect(stats.processingCount).toBe(1);
      expect(stats.pendingCount).toBe(1);
    });
  });

  describe('config management', () => {
    it('should get default config', () => {
      const config = processor.getConfig();

      expect(config.minPayoutAmount).toBe(100);
      expect(config.maxPayoutAmount).toBe(1000000);
      expect(config.payoutFrequency).toBe('weekly');
    });

    it('should set custom config', (done) => {
      processor.on('config-updated', (config) => {
        expect(config.minPayoutAmount).toBe(500);
        done();
      });

      processor.setConfig({ minPayoutAmount: 500 });
    });

    it('should enforce updated config', () => {
      processor.setConfig({ minPayoutAmount: 500 });

      expect(() => processor.createPayoutRequest('participant1', 'tenant1', 200, 'NGN')).toThrow();
    });
  });

  describe('clearPayouts', () => {
    it('should clear all payouts', (done) => {
      processor.createPayoutRequest('participant1', 'tenant1', 5000, 'NGN');
      processor.createPayoutRequest('participant2', 'tenant1', 3000, 'NGN');

      processor.on('payouts-cleared', () => {
        const stats = processor.getPayoutStats();
        expect(stats.totalPayouts).toBe(0);
        done();
      });

      processor.clearPayouts();
    });
  });
});
