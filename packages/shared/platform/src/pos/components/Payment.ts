import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../commerce/primitives/Money';

/**
 * Represents a payment in the POS system
 */
export class Payment {
  readonly id: string;
  readonly saleId: string;
  readonly method: 'cash' | 'card' | 'transfer' | 'mobile_money';
  readonly amount: Money;
  status: 'pending' | 'authorized' | 'completed' | 'failed' | 'refunded';
  readonly reference?: string;
  readonly gateway?: string;
  readonly metadata?: Record<string, any>;
  readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    saleId: string,
    method: 'cash' | 'card' | 'transfer' | 'mobile_money',
    amount: Money,
    reference?: string,
    gateway?: string,
    metadata?: Record<string, any>
  ) {
    this.id = uuidv4();
    this.saleId = saleId;
    this.method = method;
    this.amount = amount;
    this.reference = reference;
    this.gateway = gateway;
    this.metadata = metadata;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Authorize payment
   */
  authorize(reference: string): void {
    this.status = 'authorized';
    this.reference = reference;
    this.updatedAt = new Date();
  }

  /**
   * Complete payment
   */
  complete(): void {
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  /**
   * Fail payment
   */
  fail(): void {
    this.status = 'failed';
    this.updatedAt = new Date();
  }

  /**
   * Refund payment
   */
  refund(): void {
    this.status = 'refunded';
    this.updatedAt = new Date();
  }

  /**
   * Check if payment is successful
   */
  isSuccessful(): boolean {
    return this.status === 'completed' || this.status === 'authorized';
  }

  /**
   * Get payment summary
   */
  getSummary(): PaymentSummary {
    return {
      id: this.id,
      saleId: this.saleId,
      method: this.method,
      amount: this.amount.amount,
      status: this.status,
      reference: this.reference,
      gateway: this.gateway,
      createdAt: this.createdAt,
    };
  }
}

/**
 * Summary of a payment
 */
export interface PaymentSummary {
  id: string;
  saleId: string;
  method: string;
  amount: number;
  status: string;
  reference?: string;
  gateway?: string;
  createdAt: Date;
}

/**
 * Manages multiple payment methods for split payments
 */
export class SplitPayment {
  readonly id: string;
  readonly saleId: string;
  private payments: Payment[] = [];
  readonly createdAt: Date;

  constructor(saleId: string) {
    this.id = uuidv4();
    this.saleId = saleId;
    this.createdAt = new Date();
  }

  /**
   * Add payment
   */
  addPayment(payment: Payment): void {
    this.payments.push(payment);
  }

  /**
   * Get total paid
   */
  getTotalPaid(): number {
    return this.payments
      .filter(p => p.isSuccessful())
      .reduce((sum, p) => sum + p.amount.amount, 0);
  }

  /**
   * Get all payments
   */
  getPayments(): Payment[] {
    return [...this.payments];
  }

  /**
   * Check if all payments are complete
   */
  areAllComplete(): boolean {
    return this.payments.length > 0 && this.payments.every(p => p.status === 'completed');
  }
}
