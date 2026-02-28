/**
 * Order Primitive
 * Represents a customer order with items, totals, and status
 */

import { Money } from './Money';

export interface IOrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
}

export interface IOrderAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface IOrder {
  id: string;
  customerId: string;
  items: IOrderItem[];
  subtotal: Money;
  tax: Money;
  shipping: Money;
  discount: Money;
  total: Money;
  status: OrderStatus;
  billingAddress: IOrderAddress;
  shippingAddress: IOrderAddress;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private _id: string;
  private _customerId: string;
  private _items: IOrderItem[] = [];
  private _subtotal: Money;
  private _tax: Money;
  private _shipping: Money;
  private _discount: Money;
  private _total: Money;
  private _status: OrderStatus = OrderStatus.PENDING;
  private _billingAddress: IOrderAddress;
  private _shippingAddress: IOrderAddress;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    customerId: string,
    currency: string,
    billingAddress: IOrderAddress,
    shippingAddress: IOrderAddress,
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Order ID is required');
    }

    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }

    this._id = id;
    this._customerId = customerId;
    this._subtotal = Money.zero(currency);
    this._tax = Money.zero(currency);
    this._shipping = Money.zero(currency);
    this._discount = Money.zero(currency);
    this._total = Money.zero(currency);
    this._billingAddress = billingAddress;
    this._shippingAddress = shippingAddress;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): IOrderItem[] {
    return [...this._items];
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  get tax(): Money {
    return this._tax;
  }

  get shipping(): Money {
    return this._shipping;
  }

  get discount(): Money {
    return this._discount;
  }

  get total(): Money {
    return this._total;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get billingAddress(): IOrderAddress {
    return { ...this._billingAddress };
  }

  get shippingAddress(): IOrderAddress {
    return { ...this._shippingAddress };
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Add item to order
   */
  addItem(
    productId: string,
    name: string,
    quantity: number,
    unitPrice: Money,
    variantId?: string,
  ): void {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const subtotal = unitPrice.multiply(quantity);
    const itemId = `${productId}-${variantId || 'default'}-${Date.now()}`;

    this._items.push({
      id: itemId,
      productId,
      variantId,
      name,
      quantity,
      unitPrice,
      subtotal,
    });

    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Remove item from order
   */
  removeItem(itemId: string): void {
    const index = this._items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error(`Item with ID ${itemId} not found`);
    }

    this._items.splice(index, 1);
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const item = this._items.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }

    item.quantity = quantity;
    item.subtotal = item.unitPrice.multiply(quantity);
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Set tax amount
   */
  setTax(tax: Money): void {
    if (!tax) {
      throw new Error('Tax is required');
    }

    this._tax = tax;
    this._recalculateTotal();
    this._updatedAt = new Date();
  }

  /**
   * Set shipping cost
   */
  setShipping(shipping: Money): void {
    if (!shipping) {
      throw new Error('Shipping is required');
    }

    this._shipping = shipping;
    this._recalculateTotal();
    this._updatedAt = new Date();
  }

  /**
   * Apply discount
   */
  applyDiscount(discount: Money): void {
    if (!discount) {
      throw new Error('Discount is required');
    }

    if (discount.greaterThan(this._subtotal)) {
      throw new Error('Discount cannot exceed subtotal');
    }

    this._discount = discount;
    this._recalculateTotal();
    this._updatedAt = new Date();
  }

  /**
   * Clear discount
   */
  clearDiscount(): void {
    this._discount = Money.zero(this._subtotal.currency);
    this._recalculateTotal();
    this._updatedAt = new Date();
  }

  /**
   * Set order status
   */
  setStatus(status: OrderStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  /**
   * Confirm order
   */
  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error(`Cannot confirm order with status ${this._status}`);
    }

    this.setStatus(OrderStatus.CONFIRMED);
  }

  /**
   * Cancel order
   */
  cancel(): void {
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.REFUNDED].includes(this._status)) {
      throw new Error(`Cannot cancel order with status ${this._status}`);
    }

    this.setStatus(OrderStatus.CANCELLED);
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Check if order is empty
   */
  isEmpty(): boolean {
    return this._items.length === 0;
  }

  /**
   * Recalculate subtotal and totals
   */
  private _recalculateTotals(): void {
    const subtotal = this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero(this._subtotal.currency),
    );
    this._subtotal = subtotal;
    this._recalculateTotal();
  }

  /**
   * Recalculate total
   */
  private _recalculateTotal(): void {
    this._total = this._subtotal
      .add(this._tax)
      .add(this._shipping)
      .subtract(this._discount);
  }

  /**
   * Convert to JSON
   */
  toJSON(): IOrder {
    return {
      id: this._id,
      customerId: this._customerId,
      items: this._items,
      subtotal: this._subtotal,
      tax: this._tax,
      shipping: this._shipping,
      discount: this._discount,
      total: this._total,
      status: this._status,
      billingAddress: this._billingAddress,
      shippingAddress: this._shippingAddress,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
