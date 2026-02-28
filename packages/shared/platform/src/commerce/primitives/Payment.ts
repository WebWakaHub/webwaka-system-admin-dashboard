/**
 * Payment Primitive
 * Represents a payment transaction with authorization and capture
 */

import { Money } from './Money';

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  WALLET = 'wallet',
}

export interface IPaymentMetadata {
  [key: string]: string | number | boolean;
}

export interface IPayment {
  id: string;
  orderId: string;
  amount: Money;
  status: PaymentStatus;
  method: PaymentMethod;
  reference?: string;
  metadata?: IPaymentMetadata;
  authorizedAt?: Date;
  capturedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment {
  private _id: string;
  private _orderId: string;
  private _amount: Money;
  private _status: PaymentStatus = PaymentStatus.PENDING;
  private _method: PaymentMethod;
  private _reference?: string;
  private _metadata: IPaymentMetadata = {};
  private _authorizedAt?: Date;
  private _capturedAt?: Date;
  private _refundedAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    orderId: string,
    amount: Money,
    method: PaymentMethod,
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Payment ID is required');
    }

    if (!orderId || orderId.trim() === '') {
      throw new Error('Order ID is required');
    }

    if (!amount) {
      throw new Error('Amount is required');
    }

    if (!method) {
      throw new Error('Payment method is required');
    }

    this._id = id;
    this._orderId = orderId;
    this._amount = amount;
    this._method = method;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get amount(): Money {
    return this._amount;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get method(): PaymentMethod {
    return this._method;
  }

  get reference(): string | undefined {
    return this._reference;
  }

  get metadata(): IPaymentMetadata {
    return { ...this._metadata };
  }

  get authorizedAt(): Date | undefined {
    return this._authorizedAt ? new Date(this._authorizedAt) : undefined;
  }

  get capturedAt(): Date | undefined {
    return this._capturedAt ? new Date(this._capturedAt) : undefined;
  }

  get refundedAt(): Date | undefined {
    return this._refundedAt ? new Date(this._refundedAt) : undefined;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Authorize payment
   */
  authorize(reference: string, metadata?: IPaymentMetadata): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot authorize payment with status ${this._status}`);
    }

    if (!reference || reference.trim() === '') {
      throw new Error('Payment reference is required');
    }

    this._reference = reference;
    this._status = PaymentStatus.AUTHORIZED;
    this._authorizedAt = new Date();
    if (metadata) {
      this._metadata = { ...metadata };
    }
    this._updatedAt = new Date();
  }

  /**
   * Capture authorized payment
   */
  capture(): void {
    if (this._status !== PaymentStatus.AUTHORIZED) {
      throw new Error(`Cannot capture payment with status ${this._status}`);
    }

    this._status = PaymentStatus.CAPTURED;
    this._capturedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Refund payment
   */
  refund(refundAmount?: Money): void {
    if (![PaymentStatus.CAPTURED, PaymentStatus.AUTHORIZED].includes(this._status)) {
      throw new Error(`Cannot refund payment with status ${this._status}`);
    }

    if (refundAmount && refundAmount.greaterThan(this._amount)) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    this._status = PaymentStatus.REFUNDED;
    this._refundedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Fail payment
   */
  fail(reason?: string): void {
    if (this._status === PaymentStatus.CAPTURED || this._status === PaymentStatus.REFUNDED) {
      throw new Error(`Cannot fail payment with status ${this._status}`);
    }

    this._status = PaymentStatus.FAILED;
    if (reason) {
      this._metadata['failureReason'] = reason;
    }
    this._updatedAt = new Date();
  }

  /**
   * Cancel payment
   */
  cancel(): void {
    if (this._status === PaymentStatus.CAPTURED || this._status === PaymentStatus.REFUNDED) {
      throw new Error(`Cannot cancel payment with status ${this._status}`);
    }

    this._status = PaymentStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  /**
   * Set metadata
   */
  setMetadata(key: string, value: string | number | boolean): void {
    if (!key || key.trim() === '') {
      throw new Error('Metadata key is required');
    }

    this._metadata[key] = value;
    this._updatedAt = new Date();
  }

  /**
   * Get metadata value
   */
  getMetadata(key: string): string | number | boolean | undefined {
    return this._metadata[key];
  }

  /**
   * Check if payment is authorized
   */
  isAuthorized(): boolean {
    return this._status === PaymentStatus.AUTHORIZED;
  }

  /**
   * Check if payment is captured
   */
  isCaptured(): boolean {
    return this._status === PaymentStatus.CAPTURED;
  }

  /**
   * Check if payment is refunded
   */
  isRefunded(): boolean {
    return this._status === PaymentStatus.REFUNDED;
  }

  /**
   * Check if payment is failed
   */
  isFailed(): boolean {
    return this._status === PaymentStatus.FAILED;
  }

  /**
   * Convert to JSON
   */
  toJSON(): IPayment {
    return {
      id: this._id,
      orderId: this._orderId,
      amount: this._amount,
      status: this._status,
      method: this._method,
      reference: this._reference,
      metadata: this._metadata,
      authorizedAt: this._authorizedAt,
      capturedAt: this._capturedAt,
      refundedAt: this._refundedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
