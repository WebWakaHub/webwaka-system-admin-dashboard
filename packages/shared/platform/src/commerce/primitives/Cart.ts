/**
 * Cart Primitive
 * Represents a shopping cart with items and totals
 */

import { Money } from './Money';

export interface ICartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
  addedAt: Date;
}

export interface ICart {
  id: string;
  customerId?: string;
  items: ICartItem[];
  subtotal: Money;
  discount: Money;
  total: Money;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Cart {
  private _id: string;
  private _customerId?: string;
  private _items: Map<string, ICartItem> = new Map();
  private _subtotal: Money;
  private _discount: Money;
  private _total: Money;
  private _couponCode?: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: string, currency: string, customerId?: string) {
    if (!id || id.trim() === '') {
      throw new Error('Cart ID is required');
    }

    this._id = id;
    this._customerId = customerId;
    this._subtotal = Money.zero(currency);
    this._discount = Money.zero(currency);
    this._total = Money.zero(currency);
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get customerId(): string | undefined {
    return this._customerId;
  }

  get items(): ICartItem[] {
    return Array.from(this._items.values());
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  get discount(): Money {
    return this._discount;
  }

  get total(): Money {
    return this._total;
  }

  get couponCode(): string | undefined {
    return this._couponCode;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Add item to cart
   */
  addItem(
    productId: string,
    name: string,
    quantity: number,
    unitPrice: Money,
    variantId?: string,
  ): string {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID is required');
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    if (!unitPrice) {
      throw new Error('Unit price is required');
    }

    // Check if item already in cart
    const existingItemId = this._findItemId(productId, variantId);
    if (existingItemId) {
      this._updateItemQuantity(existingItemId, this._items.get(existingItemId)!.quantity + quantity);
      return existingItemId;
    }

    const itemId = `${productId}-${variantId || 'default'}-${Date.now()}`;
    const subtotal = unitPrice.multiply(quantity);

    this._items.set(itemId, {
      id: itemId,
      productId,
      variantId,
      name,
      quantity,
      unitPrice,
      subtotal,
      addedAt: new Date(),
    });

    this._recalculateTotals();
    this._updatedAt = new Date();
    return itemId;
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    const item = this._items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found in cart`);
    }

    this._updateItemQuantity(itemId, quantity);
  }

  /**
   * Internal update quantity
   */
  private _updateItemQuantity(itemId: string, quantity: number): void {
    const item = this._items.get(itemId);
    if (!item) {
      return;
    }

    item.quantity = quantity;
    item.subtotal = item.unitPrice.multiply(quantity);
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): void {
    if (!this._items.has(itemId)) {
      throw new Error(`Item ${itemId} not found in cart`);
    }

    this._items.delete(itemId);
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Clear cart
   */
  clear(): void {
    this._items.clear();
    this._discount = Money.zero(this._subtotal.currency);
    this._couponCode = undefined;
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Apply coupon code
   */
  applyCoupon(couponCode: string, discountAmount: Money): void {
    if (!couponCode || couponCode.trim() === '') {
      throw new Error('Coupon code is required');
    }

    if (!discountAmount) {
      throw new Error('Discount amount is required');
    }

    if (discountAmount.greaterThan(this._subtotal)) {
      throw new Error('Discount cannot exceed subtotal');
    }

    this._couponCode = couponCode;
    this._discount = discountAmount;
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Remove coupon
   */
  removeCoupon(): void {
    this._couponCode = undefined;
    this._discount = Money.zero(this._subtotal.currency);
    this._recalculateTotals();
    this._updatedAt = new Date();
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get unique item count
   */
  getUniqueItemCount(): number {
    return this._items.size;
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this._items.size === 0;
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): ICartItem | undefined {
    return this._items.get(itemId);
  }

  /**
   * Find item ID by product and variant
   */
  private _findItemId(productId: string, variantId?: string): string | undefined {
    for (const [itemId, item] of this._items.entries()) {
      if (item.productId === productId && item.variantId === variantId) {
        return itemId;
      }
    }
    return undefined;
  }

  /**
   * Recalculate totals
   */
  private _recalculateTotals(): void {
    const subtotal = Array.from(this._items.values()).reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero(this._subtotal.currency),
    );

    this._subtotal = subtotal;
    this._total = this._subtotal.subtract(this._discount);
  }

  /**
   * Convert to JSON
   */
  toJSON(): ICart {
    return {
      id: this._id,
      customerId: this._customerId,
      items: this.items,
      subtotal: this._subtotal,
      discount: this._discount,
      total: this._total,
      couponCode: this._couponCode,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
