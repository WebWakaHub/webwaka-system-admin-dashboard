import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../commerce/primitives/Money';
import { Product } from '../../commerce/primitives/Product';

/**
 * Represents a shopping cart in the POS system
 */
export class Cart {
  readonly id: string;
  readonly customerId?: string;
  readonly currency: string;
  private items: CartItem[] = [];
  private discount?: Money;
  private tax?: Money;
  readonly createdAt: Date;
  private updatedAt: Date;

  constructor(currency: string = 'NGN', customerId?: string) {
    this.id = uuidv4();
    this.currency = currency;
    this.customerId = customerId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Add product to cart
   */
  addItem(product: Product, quantity: number, unitPrice: number): CartItem {
    const existingItem = this.items.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const item: CartItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        discount: 0,
        tax: 0,
        total: quantity * unitPrice,
      };
      this.items.push(item);
    }

    this.updatedAt = new Date();
    return this.items.find(item => item.productId === product.id)!;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId);
    this.updatedAt = new Date();
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: string, quantity: number): void {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      item.total = quantity * item.unitPrice;
      this.updatedAt = new Date();
    }
  }

  /**
   * Apply discount to item
   */
  applyItemDiscount(productId: string, discountAmount: number): void {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      item.discount = discountAmount;
      item.total = item.quantity * item.unitPrice - discountAmount;
      this.updatedAt = new Date();
    }
  }

  /**
   * Apply discount to entire cart
   */
  applyCartDiscount(discount: Money): void {
    this.discount = discount;
    this.updatedAt = new Date();
  }

  /**
   * Apply tax
   */
  applyTax(tax: Money): void {
    this.tax = tax;
    this.updatedAt = new Date();
  }

  /**
   * Get cart subtotal
   */
  getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Get cart discount
   */
  getDiscount(): number {
    return this.discount?.amount || 0;
  }

  /**
   * Get cart tax
   */
  getTax(): number {
    return this.tax?.amount || 0;
  }

  /**
   * Get cart total
   */
  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getTax();
  }

  /**
   * Get cart items
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Get quantity count
   */
  getQuantityCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Clear cart
   */
  clear(): void {
    this.items = [];
    this.discount = undefined;
    this.tax = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get cart summary
   */
  getSummary(): CartSummary {
    return {
      id: this.id,
      customerId: this.customerId,
      currency: this.currency,
      itemCount: this.getItemCount(),
      quantityCount: this.getQuantityCount(),
      subtotal: this.getSubtotal(),
      discount: this.getDiscount(),
      tax: this.getTax(),
      total: this.getTotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Represents an item in a cart
 */
export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Summary of a cart
 */
export interface CartSummary {
  id: string;
  customerId?: string;
  currency: string;
  itemCount: number;
  quantityCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
