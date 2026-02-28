import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../commerce/primitives/Money';

/**
 * Represents a single POS transaction (sale)
 */
export class Sale {
  readonly id: string;
  readonly cartId: string;
  readonly customerId?: string;
  readonly paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_money';
  readonly amountPaid: Money;
  readonly discount?: Money;
  readonly tax: Money;
  readonly total: Money;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  readonly items: SaleItem[];
  readonly createdAt: Date;
  updatedAt: Date;
  receiptId?: string;
  readonly paymentReference?: string;
  readonly notes?: string;

  constructor(
    cartId: string,
    paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_money',
    amountPaid: Money,
    tax: Money,
    total: Money,
    items: SaleItem[],
    customerId?: string,
    discount?: Money,
    receiptId?: string,
    paymentReference?: string,
    notes?: string
  ) {
    this.id = uuidv4();
    this.cartId = cartId;
    this.customerId = customerId;
    this.paymentMethod = paymentMethod;
    this.amountPaid = amountPaid;
    this.discount = discount;
    this.tax = tax;
    this.total = total;
    this.items = items;
    this.status = 'completed';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.receiptId = receiptId;
    this.paymentReference = paymentReference;
    this.notes = notes;
  }

  /**
   * Calculate change for cash payments
   */
  getChange(): Money | null {
    if (this.paymentMethod !== 'cash') {
      return null;
    }
    return this.amountPaid.subtract(this.total);
  }

  /**
   * Check if payment is complete
   */
  isPaymentComplete(): boolean {
    return this.amountPaid.amount >= this.total.amount;
  }

  /**
   * Refund the sale
   */
  refund(): void {
    this.status = 'refunded';
    this.updatedAt = new Date();
  }

  /**
   * Mark as failed
   */
  markFailed(): void {
    this.status = 'failed';
    this.updatedAt = new Date();
  }

  /**
   * Get sale summary
   */
  getSummary(): SaleSummary {
    return {
      id: this.id,
      cartId: this.cartId,
      customerId: this.customerId,
      paymentMethod: this.paymentMethod,
      amountPaid: this.amountPaid.amount,
      discount: this.discount?.amount || 0,
      tax: this.tax.amount,
      total: this.total.amount,
      itemCount: this.items.length,
      status: this.status,
      createdAt: this.createdAt,
      receiptId: this.receiptId,
    };
  }
}

/**
 * Represents an item in a sale
 */
export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

/**
 * Summary of a sale
 */
export interface SaleSummary {
  id: string;
  cartId: string;
  customerId?: string;
  paymentMethod: string;
  amountPaid: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
  status: string;
  createdAt: Date;
  receiptId?: string;
}
