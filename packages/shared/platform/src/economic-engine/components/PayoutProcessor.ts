/**
 * Payout Processor Component
 * Handles payout requests and processing
 */

import { EventEmitter } from 'events';

export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PayoutRequest {
  payoutId: string;
  participantId: string;
  tenantId: string;
  amount: number;
  currency: string;
  bankAccount?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  mobileWallet?: {
    phoneNumber: string;
    provider: string;
  };
  status: PayoutStatus;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface PayoutConfig {
  minPayoutAmount: number;
  maxPayoutAmount: number;
  payoutFrequency: 'daily' | 'weekly' | 'monthly';
  processingTimeHours: number;
  enableBankTransfers: boolean;
  enableMobileWallet: boolean;
  enableCrypto: boolean;
}

export class PayoutProcessor extends EventEmitter {
  private payouts: Map<string, PayoutRequest> = new Map();
  private config: PayoutConfig = {
    minPayoutAmount: 100,
    maxPayoutAmount: 1000000,
    payoutFrequency: 'weekly',
    processingTimeHours: 24,
    enableBankTransfers: true,
    enableMobileWallet: true,
    enableCrypto: false,
  };

  constructor(config?: Partial<PayoutConfig>) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public createPayoutRequest(
    participantId: string,
    tenantId: string,
    amount: number,
    currency: string,
    bankAccount?: any,
    mobileWallet?: any,
    metadata?: Record<string, any>
  ): PayoutRequest {
    if (amount < this.config.minPayoutAmount) {
      throw new Error(`Payout amount must be at least ${this.config.minPayoutAmount}`);
    }

    if (amount > this.config.maxPayoutAmount) {
      throw new Error(`Payout amount cannot exceed ${this.config.maxPayoutAmount}`);
    }

    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payout: PayoutRequest = {
      payoutId,
      participantId,
      tenantId,
      amount,
      currency,
      bankAccount,
      mobileWallet,
      status: PayoutStatus.PENDING,
      requestedAt: new Date(),
      metadata,
    };

    this.payouts.set(payoutId, payout);
    this.emit('payout-requested', payout);

    return payout;
  }

  public getPayout(payoutId: string): PayoutRequest | undefined {
    return this.payouts.get(payoutId);
  }

  public getPayoutsByParticipant(participantId: string, tenantId: string): PayoutRequest[] {
    return Array.from(this.payouts.values()).filter(
      p => p.participantId === participantId && p.tenantId === tenantId
    );
  }

  public getPayoutsByStatus(status: PayoutStatus): PayoutRequest[] {
    return Array.from(this.payouts.values()).filter(p => p.status === status);
  }

  public approvePayout(payoutId: string): PayoutRequest {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new Error(`Cannot approve payout with status ${payout.status}`);
    }

    payout.status = PayoutStatus.APPROVED;
    this.emit('payout-approved', payout);

    return payout;
  }

  public processPayout(payoutId: string): PayoutRequest {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    if (payout.status !== PayoutStatus.APPROVED) {
      throw new Error(`Cannot process payout with status ${payout.status}`);
    }

    payout.status = PayoutStatus.PROCESSING;
    payout.processedAt = new Date();
    this.emit('payout-processing', payout);

    return payout;
  }

  public completePayout(payoutId: string): PayoutRequest {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    if (payout.status !== PayoutStatus.PROCESSING) {
      throw new Error(`Cannot complete payout with status ${payout.status}`);
    }

    payout.status = PayoutStatus.COMPLETED;
    payout.completedAt = new Date();
    this.emit('payout-completed', payout);

    return payout;
  }

  public failPayout(payoutId: string, reason: string): PayoutRequest {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    payout.status = PayoutStatus.FAILED;
    payout.failureReason = reason;
    this.emit('payout-failed', payout);

    return payout;
  }

  public cancelPayout(payoutId: string): PayoutRequest {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    if (payout.status === PayoutStatus.COMPLETED || payout.status === PayoutStatus.FAILED) {
      throw new Error(`Cannot cancel payout with status ${payout.status}`);
    }

    payout.status = PayoutStatus.CANCELLED;
    this.emit('payout-cancelled', payout);

    return payout;
  }

  public getConfig(): PayoutConfig {
    return { ...this.config };
  }

  public setConfig(config: Partial<PayoutConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  public getAllPayouts(): PayoutRequest[] {
    return Array.from(this.payouts.values());
  }

  public getPayoutStats(): {
    totalPayouts: number;
    totalAmount: number;
    pendingCount: number;
    approvedCount: number;
    processingCount: number;
    completedCount: number;
    failedCount: number;
  } {
    const payouts = Array.from(this.payouts.values());
    return {
      totalPayouts: payouts.length,
      totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: payouts.filter(p => p.status === PayoutStatus.PENDING).length,
      approvedCount: payouts.filter(p => p.status === PayoutStatus.APPROVED).length,
      processingCount: payouts.filter(p => p.status === PayoutStatus.PROCESSING).length,
      completedCount: payouts.filter(p => p.status === PayoutStatus.COMPLETED).length,
      failedCount: payouts.filter(p => p.status === PayoutStatus.FAILED).length,
    };
  }

  public clearPayouts(): void {
    this.payouts.clear();
    this.emit('payouts-cleared');
  }
}
