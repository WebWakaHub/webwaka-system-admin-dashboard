/**
 * MVM Services
 * Core business logic for multi-vendor management
 */

import { Vendor, Product, Order, OrderItem, Commission, Payout, createCommission, createPayout } from '../models';

/**
 * Vendor Service - manages vendor lifecycle
 */
export class VendorService {
  private vendors: Map<string, Vendor> = new Map();
  private vendorsByEmail: Map<string, string> = new Map(); // email -> vendor_id mapping

  registerVendor(vendor: Vendor): Vendor {
    if (this.vendors.has(vendor.vendor_id)) {
      throw new Error(`Vendor ${vendor.vendor_id} already exists`);
    }
    // Check for duplicate email
    if (this.vendorsByEmail.has(vendor.email)) {
      throw new Error(`Email ${vendor.email} is already registered`);
    }
    this.vendors.set(vendor.vendor_id, vendor);
    this.vendorsByEmail.set(vendor.email, vendor.vendor_id);
    return vendor;
  }

  getVendor(vendorId: string): Vendor | undefined {
    return this.vendors.get(vendorId);
  }

  updateVendor(vendorId: string, updates: Partial<Vendor>): Vendor {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }
    const updated = { ...vendor, ...updates, updated_at: new Date() };
    this.vendors.set(vendorId, updated);
    return updated;
  }

  approveVendor(vendorId: string): Vendor {
    return this.updateVendor(vendorId, { status: 'approved' });
  }

  getAllVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }
}

/**
 * Product Service - manages vendor products
 */
export class ProductService {
  private products: Map<string, Product> = new Map();

  createProduct(product: Product): Product {
    if (this.products.has(product.product_id)) {
      throw new Error(`Product ${product.product_id} already exists`);
    }
    this.products.set(product.product_id, product);
    return product;
  }

  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  getVendorProducts(vendorId: string): Product[] {
    return Array.from(this.products.values()).filter(p => p.vendor_id === vendorId);
  }

  updateProduct(productId: string, updates: Partial<Product>, vendorId?: string): Product {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    // Verify vendor authorization if vendorId is provided
    if (vendorId && product.vendor_id !== vendorId) {
      throw new Error('Unauthorized: Vendor cannot update another vendor\'s product');
    }
    const updated = { ...product, ...updates, updated_at: new Date() };
    this.products.set(productId, updated);
    return updated;
  }

  deleteProduct(productId: string, vendorId?: string): void {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    // Verify vendor authorization if vendorId is provided
    if (vendorId && product.vendor_id !== vendorId) {
      throw new Error('Unauthorized: Vendor cannot delete another vendor\'s product');
    }
    this.products.delete(productId);
  }

  adjustInventory(productId: string, quantity: number): Product {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    const newCount = product.inventory_count + quantity;
    if (newCount < 0) {
      throw new Error('Insufficient inventory');
    }
    return this.updateProduct(productId, { inventory_count: newCount });
  }
}

/**
 * Order Service - manages order routing and fulfillment
 */
export class OrderService {
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();

  createOrder(order: Order): Order {
    if (this.orders.has(order.order_id)) {
      throw new Error(`Order ${order.order_id} already exists`);
    }
    this.orders.set(order.order_id, order);
    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  addOrderItem(orderItem: OrderItem): OrderItem {
    if (this.orderItems.has(orderItem.order_item_id)) {
      throw new Error(`OrderItem ${orderItem.order_item_id} already exists`);
    }
    this.orderItems.set(orderItem.order_item_id, orderItem);
    return orderItem;
  }

  getOrderItems(orderId: string): OrderItem[] {
    return Array.from(this.orderItems.values()).filter(oi => oi.order_id === orderId);
  }

  getVendorOrderItems(vendorId: string): OrderItem[] {
    return Array.from(this.orderItems.values()).filter(oi => oi.vendor_id === vendorId);
  }

  updateOrderItemStatus(orderItemId: string, status: string): OrderItem {
    const orderItem = this.orderItems.get(orderItemId);
    if (!orderItem) {
      throw new Error(`OrderItem ${orderItemId} not found`);
    }
    const updated = { ...orderItem, status: status as any, updated_at: new Date() };
    this.orderItems.set(orderItemId, updated);
    return updated;
  }

  updateOrderStatus(orderId: string, status: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    const updated = { ...order, status: status as any, updated_at: new Date() };
    this.orders.set(orderId, updated);
    return updated;
  }
}

/**
 * Commission Service - calculates and records platform commissions
 */
export class CommissionService {
  private commissions: Map<string, Commission> = new Map();

  calculateCommission(orderItem: OrderItem, commissionRate: number): Commission {
    // Validate commission rate
    if (commissionRate < 0 || commissionRate > 1) {
      throw new Error('Commission rate must be between 0 and 1');
    }
    // Calculate with proper precision (2 decimal places for currency)
    const amount = Math.round(orderItem.subtotal * commissionRate * 100) / 100;
    const commission = createCommission({
      order_item_id: orderItem.order_item_id,
      vendor_id: orderItem.vendor_id,
      amount,
      rate: commissionRate,
    });
    this.commissions.set(commission.commission_id, commission);
    return commission;
  }

  getCommission(commissionId: string): Commission | undefined {
    return this.commissions.get(commissionId);
  }

  getVendorCommissions(vendorId: string): Commission[] {
    return Array.from(this.commissions.values()).filter(c => c.vendor_id === vendorId);
  }

  getTotalCommissionForVendor(vendorId: string): number {
    // Calculate with proper precision to avoid floating point errors
    const total = this.getVendorCommissions(vendorId).reduce((sum, c) => sum + c.amount, 0);
    return Math.round(total * 100) / 100;
  }
}

/**
 * Payout Service - manages vendor payouts
 */
export class PayoutService {
  private payouts: Map<string, Payout> = new Map();

  createPayout(payout: Payout): Payout {
    if (this.payouts.has(payout.payout_id)) {
      throw new Error(`Payout ${payout.payout_id} already exists`);
    }
    // Validate payout amount
    if (payout.amount <= 0) {
      throw new Error('Payout amount must be greater than 0');
    }
    this.payouts.set(payout.payout_id, payout);
    return payout;
  }

  getPayout(payoutId: string): Payout | undefined {
    return this.payouts.get(payoutId);
  }

  getVendorPayouts(vendorId: string): Payout[] {
    return Array.from(this.payouts.values()).filter(p => p.vendor_id === vendorId);
  }

  getPendingPayouts(): Payout[] {
    return Array.from(this.payouts.values()).filter(p => p.status === 'pending');
  }

  markPayoutAsPaid(payoutId: string): Payout {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }
    // Prevent marking already paid payouts as paid again
    if (payout.status === 'paid') {
      throw new Error(`Payout ${payoutId} is already marked as paid`);
    }
    const updated = { ...payout, status: 'paid' as const, paid_at: new Date() };
    this.payouts.set(payoutId, updated);
    return updated;
  }

  getVendorPayoutHistory(vendorId: string): Payout[] {
    return this.getVendorPayouts(vendorId).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }
}
