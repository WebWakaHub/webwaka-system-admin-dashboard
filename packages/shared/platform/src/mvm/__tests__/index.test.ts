/**
 * MVM Module Unit Tests
 */

import {
  VendorService,
  ProductService,
  OrderService,
  CommissionService,
  PayoutService,
} from '../services';
import {
  createVendor,
  createProduct,
  createOrder,
  createOrderItem,
  Vendor,
  Product,
  Order,
} from '../models';

describe('MVM Module', () => {
  let vendorService: VendorService;
  let productService: ProductService;
  let orderService: OrderService;
  let commissionService: CommissionService;
  let payoutService: PayoutService;

  beforeEach(() => {
    vendorService = new VendorService();
    productService = new ProductService();
    orderService = new OrderService();
    commissionService = new CommissionService();
    payoutService = new PayoutService();
  });

  describe('VendorService', () => {
    it('should register a new vendor', () => {
      const vendor = createVendor({
        email: 'vendor@example.com',
        store_name: 'Test Store',
        business_name: 'Test Business',
        business_address: '123 Main St',
        payment_method: 'bank_transfer',
        payment_details: { account: '123456' },
        status: 'pending',
      });

      const registered = vendorService.registerVendor(vendor);
      expect(registered.vendor_id).toBe(vendor.vendor_id);
      expect(registered.email).toBe('vendor@example.com');
    });

    it('should retrieve a vendor by ID', () => {
      const vendor = createVendor({
        email: 'vendor@example.com',
        store_name: 'Test Store',
        business_name: 'Test Business',
        business_address: '123 Main St',
        payment_method: 'bank_transfer',
        payment_details: {},
        status: 'pending',
      });

      vendorService.registerVendor(vendor);
      const retrieved = vendorService.getVendor(vendor.vendor_id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.email).toBe('vendor@example.com');
    });

    it('should approve a vendor', () => {
      const vendor = createVendor({
        email: 'vendor@example.com',
        store_name: 'Test Store',
        business_name: 'Test Business',
        business_address: '123 Main St',
        payment_method: 'bank_transfer',
        payment_details: {},
        status: 'pending',
      });

      vendorService.registerVendor(vendor);
      const approved = vendorService.approveVendor(vendor.vendor_id);
      expect(approved.status).toBe('approved');
    });

    it('should throw error when registering duplicate vendor', () => {
      const vendor = createVendor({
        email: 'vendor@example.com',
        store_name: 'Test Store',
        business_name: 'Test Business',
        business_address: '123 Main St',
        payment_method: 'bank_transfer',
        payment_details: {},
        status: 'pending',
      });

      vendorService.registerVendor(vendor);
      expect(() => vendorService.registerVendor(vendor)).toThrow();
    });
  });

  describe('ProductService', () => {
    it('should create a product', () => {
      const product = createProduct({
        vendor_id: 'vendor-1',
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        currency: 'NGN',
        inventory_count: 50,
        images: [],
        status: 'active',
      });

      const created = productService.createProduct(product);
      expect(created.product_id).toBe(product.product_id);
      expect(created.name).toBe('Test Product');
    });

    it('should retrieve vendor products', () => {
      const product1 = createProduct({
        vendor_id: 'vendor-1',
        name: 'Product 1',
        description: 'Test',
        price: 100,
        currency: 'NGN',
        inventory_count: 50,
        images: [],
        status: 'active',
      });

      const product2 = createProduct({
        vendor_id: 'vendor-1',
        name: 'Product 2',
        description: 'Test',
        price: 200,
        currency: 'NGN',
        inventory_count: 30,
        images: [],
        status: 'active',
      });

      productService.createProduct(product1);
      productService.createProduct(product2);

      const products = productService.getVendorProducts('vendor-1');
      expect(products.length).toBe(2);
    });

    it('should adjust inventory', () => {
      const product = createProduct({
        vendor_id: 'vendor-1',
        name: 'Test Product',
        description: 'Test',
        price: 100,
        currency: 'NGN',
        inventory_count: 50,
        images: [],
        status: 'active',
      });

      productService.createProduct(product);
      const updated = productService.adjustInventory(product.product_id, -10);
      expect(updated.inventory_count).toBe(40);
    });

    it('should throw error when adjusting inventory below zero', () => {
      const product = createProduct({
        vendor_id: 'vendor-1',
        name: 'Test Product',
        description: 'Test',
        price: 100,
        currency: 'NGN',
        inventory_count: 10,
        images: [],
        status: 'active',
      });

      productService.createProduct(product);
      expect(() => productService.adjustInventory(product.product_id, -20)).toThrow();
    });
  });

  describe('OrderService', () => {
    it('should create an order', () => {
      const order = createOrder({
        customer_id: 'customer-1',
        total_amount: 1000,
        currency: 'NGN',
        status: 'pending',
      });

      const created = orderService.createOrder(order);
      expect(created.order_id).toBe(order.order_id);
    });

    it('should add order items', () => {
      const order = createOrder({
        customer_id: 'customer-1',
        total_amount: 1000,
        currency: 'NGN',
        status: 'pending',
      });

      orderService.createOrder(order);

      const orderItem = createOrderItem({
        order_id: order.order_id,
        vendor_id: 'vendor-1',
        product_id: 'product-1',
        quantity: 2,
        unit_price: 500,
        subtotal: 1000,
        status: 'pending',
      });

      orderService.addOrderItem(orderItem);
      const items = orderService.getOrderItems(order.order_id);
      expect(items.length).toBe(1);
    });

    it('should retrieve vendor order items', () => {
      const order = createOrder({
        customer_id: 'customer-1',
        total_amount: 1000,
        currency: 'NGN',
        status: 'pending',
      });

      orderService.createOrder(order);

      const orderItem = createOrderItem({
        order_id: order.order_id,
        vendor_id: 'vendor-1',
        product_id: 'product-1',
        quantity: 2,
        unit_price: 500,
        subtotal: 1000,
        status: 'pending',
      });

      orderService.addOrderItem(orderItem);
      const vendorItems = orderService.getVendorOrderItems('vendor-1');
      expect(vendorItems.length).toBe(1);
    });
  });

  describe('CommissionService', () => {
    it('should calculate commission', () => {
      const orderItem = createOrderItem({
        order_id: 'order-1',
        vendor_id: 'vendor-1',
        product_id: 'product-1',
        quantity: 1,
        unit_price: 1000,
        subtotal: 1000,
        status: 'pending',
      });

      const commission = commissionService.calculateCommission(orderItem, 0.1);
      expect(commission.amount).toBe(100);
      expect(commission.rate).toBe(0.1);
    });

    it('should get total commission for vendor', () => {
      const orderItem1 = createOrderItem({
        order_id: 'order-1',
        vendor_id: 'vendor-1',
        product_id: 'product-1',
        quantity: 1,
        unit_price: 1000,
        subtotal: 1000,
        status: 'pending',
      });

      const orderItem2 = createOrderItem({
        order_id: 'order-2',
        vendor_id: 'vendor-1',
        product_id: 'product-2',
        quantity: 1,
        unit_price: 500,
        subtotal: 500,
        status: 'pending',
      });

      commissionService.calculateCommission(orderItem1, 0.1);
      commissionService.calculateCommission(orderItem2, 0.1);

      const total = commissionService.getTotalCommissionForVendor('vendor-1');
      expect(total).toBe(150); // 100 + 50
    });
  });

  describe('PayoutService', () => {
    it('should create a payout', () => {
      const payout = {
        payout_id: 'payout-1',
        vendor_id: 'vendor-1',
        amount: 5000,
        status: 'pending' as const,
        created_at: new Date(),
      };

      const created = payoutService.createPayout(payout);
      expect(created.payout_id).toBe('payout-1');
    });

    it('should mark payout as paid', () => {
      const payout = {
        payout_id: 'payout-1',
        vendor_id: 'vendor-1',
        amount: 5000,
        status: 'pending' as const,
        created_at: new Date(),
      };

      payoutService.createPayout(payout);
      const marked = payoutService.markPayoutAsPaid('payout-1');
      expect(marked.status).toBe('paid');
      expect(marked.paid_at).toBeDefined();
    });

    it('should get vendor payout history', () => {
      const payout1 = {
        payout_id: 'payout-1',
        vendor_id: 'vendor-1',
        amount: 5000,
        status: 'paid' as const,
        created_at: new Date(Date.now() - 1000),
        paid_at: new Date(),
      };

      const payout2 = {
        payout_id: 'payout-2',
        vendor_id: 'vendor-1',
        amount: 3000,
        status: 'pending' as const,
        created_at: new Date(),
      };

      payoutService.createPayout(payout1);
      payoutService.createPayout(payout2);

      const history = payoutService.getVendorPayoutHistory('vendor-1');
      expect(history.length).toBe(2);
      expect(history[0].payout_id).toBe('payout-2'); // Most recent first
    });
  });
});
