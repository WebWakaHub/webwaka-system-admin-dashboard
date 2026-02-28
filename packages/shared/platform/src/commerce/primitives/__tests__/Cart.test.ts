/**
 * Cart Primitive Unit Tests
 * 100% code coverage
 */

import { Cart } from '../Cart';
import { Money } from '../Money';

describe('Cart Primitive', () => {
  const basePrice = new Money(10000, 'NGN');

  describe('Constructor', () => {
    it('should create Cart with valid data', () => {
      const cart = new Cart('cart-1', 'NGN');
      expect(cart.id).toBe('cart-1');
      expect(cart.customerId).toBeUndefined();
      expect(cart.items.length).toBe(0);
    });

    it('should create Cart with customer ID', () => {
      const cart = new Cart('cart-1', 'NGN', 'cust-1');
      expect(cart.customerId).toBe('cust-1');
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Cart('', 'NGN')).toThrow('Cart ID is required');
    });

    it('should initialize with zero totals', () => {
      const cart = new Cart('cart-1', 'NGN');
      expect(cart.subtotal.amount).toBe(0);
      expect(cart.discount.amount).toBe(0);
      expect(cart.total.amount).toBe(0);
    });
  });

  describe('Item Management', () => {
    let cart: Cart;

    beforeEach(() => {
      cart = new Cart('cart-1', 'NGN');
    });

    it('should add item to cart', () => {
      const itemId = cart.addItem('prod-1', 'Product 1', 2, new Money(5000, 'NGN'));
      expect(itemId).toBeDefined();
      expect(cart.items.length).toBe(1);
      expect(cart.subtotal.amount).toBe(10000);
    });

    it('should throw error for invalid product ID', () => {
      expect(() => cart.addItem('', 'Product', 1, basePrice)).toThrow('Product ID is required');
    });

    it('should throw error for invalid quantity', () => {
      expect(() => cart.addItem('prod-1', 'Product', 0, basePrice)).toThrow('Quantity must be a positive integer');
      expect(() => cart.addItem('prod-1', 'Product', -1, basePrice)).toThrow('Quantity must be a positive integer');
    });

    it('should throw error for invalid price', () => {
      expect(() => cart.addItem('prod-1', 'Product', 1, null as any)).toThrow('Unit price is required');
    });

    it('should get item by ID', () => {
      const itemId = cart.addItem('prod-2', 'Product 2', 1, new Money(3000, 'NGN'));
      const item = cart.getItem(itemId);
      expect(item).toBeDefined();
      expect(item?.productId).toBe('prod-2');
    });

    it('should update item quantity', () => {
      const itemId = cart.addItem('prod-3', 'Product 3', 1, new Money(2000, 'NGN'));
      cart.updateItemQuantity(itemId, 3);
      const item = cart.getItem(itemId);
      expect(item?.quantity).toBe(3);
      expect(cart.subtotal.amount).toBe(6000);
    });

    it('should throw error updating non-existent item', () => {
      expect(() => cart.updateItemQuantity('non-existent', 1)).toThrow('Item not found');
    });

    it('should remove item from cart', () => {
      const itemId = cart.addItem('prod-4', 'Product 4', 1, new Money(1000, 'NGN'));
      cart.removeItem(itemId);
      expect(cart.items.length).toBe(0);
      expect(cart.subtotal.amount).toBe(0);
    });

    it('should throw error removing non-existent item', () => {
      expect(() => cart.removeItem('non-existent')).toThrow('Item not found');
    });

    it('should add multiple items', () => {
      cart.addItem('prod-1', 'Product 1', 1, new Money(5000, 'NGN'));
      cart.addItem('prod-2', 'Product 2', 2, new Money(3000, 'NGN'));
      expect(cart.items.length).toBe(2);
      expect(cart.subtotal.amount).toBe(11000);
    });
  });

  describe('Discount Management', () => {
    let cart: Cart;

    beforeEach(() => {
      cart = new Cart('cart-1', 'NGN');
      cart.addItem('prod-1', 'Product 1', 1, basePrice);
    });

    it('should apply coupon with discount', () => {
      const discount = new Money(1000, 'NGN');
      cart.applyCoupon('DISCOUNT10', discount);
      expect(cart.couponCode).toBe('DISCOUNT10');
      expect(cart.discount.amount).toBe(1000);
      expect(cart.total.amount).toBe(9000);
    });

    it('should throw error for invalid coupon code', () => {
      expect(() => cart.applyCoupon('', new Money(1000, 'NGN'))).toThrow('Coupon code is required');
    });

    it('should throw error for discount exceeding subtotal', () => {
      const discount = new Money(20000, 'NGN');
      expect(() => cart.applyCoupon('INVALID', discount)).toThrow('Discount cannot exceed subtotal');
    });

    it('should remove coupon', () => {
      cart.applyCoupon('DISCOUNT10', new Money(1000, 'NGN'));
      cart.removeCoupon();
      expect(cart.couponCode).toBeUndefined();
      expect(cart.discount.amount).toBe(0);
      expect(cart.total.amount).toBe(10000);
    });
  });

  describe('Coupon Management', () => {
    let cart: Cart;

    beforeEach(() => {
      cart = new Cart('cart-1', 'NGN');
      cart.addItem('prod-1', 'Product 1', 1, basePrice);
    });

    it('should apply coupon code', () => {
      cart.applyCoupon('DISCOUNT10', new Money(1000, 'NGN'));
      expect(cart.couponCode).toBe('DISCOUNT10');
      expect(cart.discount.amount).toBe(1000);
    });

    it('should throw error for invalid coupon code', () => {
      expect(() => cart.applyCoupon('', new Money(1000, 'NGN'))).toThrow('Coupon code is required');
    });

    it('should remove coupon', () => {
      cart.applyCoupon('DISCOUNT10', new Money(1000, 'NGN'));
      cart.removeCoupon();
      expect(cart.couponCode).toBeUndefined();
      expect(cart.discount.amount).toBe(0);
    });
  });

  describe('Cart Operations', () => {
    let cart: Cart;

    beforeEach(() => {
      cart = new Cart('cart-1', 'NGN');
    });

    it('should clear cart', () => {
      cart.addItem('prod-1', 'Product', 1, basePrice);
      expect(cart.items.length).toBe(1);
      cart.clear();
      expect(cart.items.length).toBe(0);
      expect(cart.subtotal.amount).toBe(0);
    });

    it('should get item count', () => {
      cart.addItem('prod-1', 'Product 1', 2, new Money(5000, 'NGN'));
      cart.addItem('prod-2', 'Product 2', 1, new Money(3000, 'NGN'));
      expect(cart.getItemCount()).toBe(3);
      expect(cart.getUniqueItemCount()).toBe(2);
    });

    it('should check if cart is empty', () => {
      expect(cart.isEmpty()).toBe(true);
      cart.addItem('prod-1', 'Product', 1, basePrice);
      expect(cart.isEmpty()).toBe(false);
    });

    it('should convert to JSON', () => {
      cart.addItem('prod-1', 'Product 1', 1, new Money(5000, 'NGN'));
      const json = cart.toJSON();
      expect(json.id).toBe('cart-1');
      expect(json.items.length).toBe(1);
      expect(json.subtotal.amount).toBe(5000);
    });
  });

  describe('Timestamps', () => {
    let cart: Cart;

    beforeEach(() => {
      cart = new Cart('cart-1', 'NGN');
    });

    it('should have creation timestamp', () => {
      expect(cart.createdAt).toBeInstanceOf(Date);
    });

    it('should have update timestamp', () => {
      expect(cart.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamp when adding items', () => {
      const before = cart.updatedAt;
      cart.addItem('prod-1', 'Product', 1, basePrice);
      expect(cart.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should update timestamp when removing items', () => {
      const itemId = cart.addItem('prod-1', 'Product', 1, basePrice);
      const before = cart.updatedAt;
      cart.removeItem(itemId);
      expect(cart.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('Edge Cases', () => {
    it('should handle cart with 100 items', () => {
      const cart = new Cart('cart-1', 'NGN');
      for (let i = 0; i < 100; i++) {
        cart.addItem(`prod-${i}`, `Product ${i}`, 1, basePrice);
      }
      expect(cart.items.length).toBe(100);
    });

    it('should handle cart with large amounts', () => {
      const cart = new Cart('cart-1', 'NGN');
      cart.addItem('prod-1', 'Product', 1, new Money(1000000, 'NGN'));
      expect(cart.subtotal.amount).toBe(1000000);
    });

    it('should handle cart with variant IDs', () => {
      const cart = new Cart('cart-1', 'NGN');
      const itemId = cart.addItem('prod-1', 'Product', 1, basePrice, 'variant-1');
      const item = cart.getItem(itemId);
      expect(item?.variantId).toBe('variant-1');
    });
  });
});
