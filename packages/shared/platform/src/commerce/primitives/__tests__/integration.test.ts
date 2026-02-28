/**
 * Commerce Shared Primitives Integration Tests
 * Tests interaction between all 8 primitives
 */

import { Money } from '../Money';
import { Product } from '../Product';
import { Order } from '../Order';
import { Payment, PaymentStatus } from '../Payment';
import { Inventory } from '../Inventory';
import { Shipment, ShipmentCarrier, ShipmentStatus } from '../Shipment';
import { Customer, CustomerStatus, CustomerTier } from '../Customer';
import { Cart, CartStatus } from '../Cart';

describe('Commerce Shared Primitives Integration Tests', () => {
  describe('Complete Order Workflow', () => {
    it('should execute complete order-to-delivery workflow', () => {
      // Create customer
      const customer = new Customer('cust-1', 'john@example.com', 'John Doe');
      customer.setPhone('+234-8012345678');
      customer.verifyEmail();
      expect(customer.status).toBe(CustomerStatus.ACTIVE);

      // Create products
      const product1 = new Product('prod-1', 'Laptop', 'High-performance laptop', new Money(500000, 'NGN'));
      const product2 = new Product('prod-2', 'Mouse', 'Wireless mouse', new Money(5000, 'NGN'));

      // Create cart and add items
      const cart = new Cart(customer.id);
      const item1 = cart.addItem(product1.id, product1.name, 1, product1.price);
      const item2 = cart.addItem(product2.id, product2.name, 2, product2.price);
      expect(cart.items.length).toBe(2);

      // Set cart addresses and shipping
      cart.setShippingAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria');
      cart.setBillingAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria');
      cart.setShippingMethod('STANDARD', new Money(2000, 'NGN'));
      cart.setPaymentMethod('CREDIT_CARD');

      // Calculate totals
      const subtotal = cart.subtotal;
      expect(subtotal.amount).toBe(510000); // 500000 + (5000 * 2)

      // Checkout
      cart.checkout();
      expect(cart.status).toBe(CartStatus.CHECKED_OUT);

      // Create order from cart
      const order = new Order('order-1', customer.id);
      order.addItem(product1.id, product1.name, 1, product1.price);
      order.addItem(product2.id, product2.name, 2, product2.price);
      order.setShippingAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria');
      order.setBillingAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria');
      order.setShippingMethod('STANDARD', new Money(2000, 'NGN'));

      // Create payment
      const payment = new Payment('pay-1', order.id, order.total);
      payment.authorize();
      expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
      payment.capture();
      expect(payment.status).toBe(PaymentStatus.CAPTURED);

      // Update order status
      order.markPaid();
      expect(order.paid).toBe(true);

      // Create inventory and check stock
      const inventory1 = new Inventory('inv-1', product1.id);
      inventory1.addStock(10);
      inventory1.reserveStock(1);
      expect(inventory1.availableStock).toBe(9);

      const inventory2 = new Inventory('inv-2', product2.id);
      inventory2.addStock(100);
      inventory2.reserveStock(2);
      expect(inventory2.availableStock).toBe(98);

      // Create shipment
      const shipment = new Shipment('ship-1', order.id, ShipmentCarrier.FEDEX);
      shipment.addItem(product1.id, product1.name, 1);
      shipment.addItem(product2.id, product2.name, 2);
      shipment.setShippingAddress('123 Street', 'Lagos', 'Lagos', '100001', 'Nigeria');
      shipment.setTrackingNumber('TRACK123456789');

      // Track shipment
      shipment.markPickedUp();
      expect(shipment.status).toBe(ShipmentStatus.PICKED_UP);
      shipment.markInTransit();
      expect(shipment.status).toBe(ShipmentStatus.IN_TRANSIT);
      shipment.markOutForDelivery();
      expect(shipment.status).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
      shipment.markDelivered();
      expect(shipment.status).toBe(ShipmentStatus.DELIVERED);

      // Confirm delivery
      shipment.confirmDelivery('John Doe', 'Signature');
      expect(shipment.deliveredAt).toBeDefined();

      // Update order status
      order.markShipped();
      order.markDelivered();
      expect(order.status).toBe('DELIVERED');

      // Record customer order
      customer.recordOrder(order.id);
      customer.recordSpending(order.total.amount);
      expect(customer.orderCount).toBe(1);
      expect(customer.totalSpent).toBe(order.total.amount);

      // Award loyalty points
      customer.addLoyaltyPoints(Math.floor(order.total.amount / 1000));
      expect(customer.loyaltyPoints).toBeGreaterThan(0);
    });
  });

  describe('Multi-Product Order', () => {
    it('should handle order with multiple products and variants', () => {
      const customer = new Customer('cust-2', 'jane@example.com', 'Jane Smith');
      
      // Create product with variants
      const product = new Product('prod-3', 'T-Shirt', 'Cotton T-Shirt', new Money(3000, 'NGN'));
      const variant1 = product.addVariant('SIZE_S', 'Small', new Money(3000, 'NGN'));
      const variant2 = product.addVariant('SIZE_M', 'Medium', new Money(3000, 'NGN'));
      const variant3 = product.addVariant('SIZE_L', 'Large', new Money(3500, 'NGN'));

      // Create order with variants
      const order = new Order('order-2', customer.id);
      order.addItem(product.id, product.name, 2, new Money(3000, 'NGN'));
      order.addItem(product.id, `${product.name} - Large`, 1, new Money(3500, 'NGN'));

      expect(order.items.length).toBe(2);
      expect(order.subtotal.amount).toBe(9500);

      // Create payment
      const payment = new Payment('pay-2', order.id, order.total);
      payment.authorize();
      payment.capture();

      // Manage inventory for each variant
      const inv1 = new Inventory('inv-3', `${product.id}-SIZE_S`);
      inv1.addStock(50);
      inv1.reserveStock(2);

      const inv2 = new Inventory('inv-4', `${product.id}-SIZE_L`);
      inv2.addStock(30);
      inv2.reserveStock(1);

      expect(inv1.availableStock).toBe(48);
      expect(inv2.availableStock).toBe(29);

      // Create shipment
      const shipment = new Shipment('ship-2', order.id, ShipmentCarrier.DHL);
      shipment.addItem(product.id, `${product.name} - Small`, 2);
      shipment.addItem(product.id, `${product.name} - Large`, 1);
      expect(shipment.items.length).toBe(2);
    });
  });

  describe('Payment Processing', () => {
    it('should handle payment authorization and capture', () => {
      const order = new Order('order-3', 'cust-3');
      const product = new Product('prod-4', 'Phone', 'Smartphone', new Money(200000, 'NGN'));
      order.addItem(product.id, product.name, 1, product.price);

      const payment = new Payment('pay-3', order.id, order.total);
      expect(payment.status).toBe(PaymentStatus.PENDING);

      // Authorize payment
      payment.authorize();
      expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
      expect(payment.authorizedAt).toBeDefined();

      // Capture payment
      payment.capture();
      expect(payment.status).toBe(PaymentStatus.CAPTURED);
      expect(payment.capturedAt).toBeDefined();

      // Mark order as paid
      order.markPaid();
      expect(order.paid).toBe(true);
    });

    it('should handle payment refund', () => {
      const order = new Order('order-4', 'cust-4');
      const product = new Product('prod-5', 'Tablet', 'Tablet device', new Money(150000, 'NGN'));
      order.addItem(product.id, product.name, 1, product.price);

      const payment = new Payment('pay-4', order.id, order.total);
      payment.authorize();
      payment.capture();

      // Refund payment
      payment.refund();
      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(payment.refundedAt).toBeDefined();
    });
  });

  describe('Inventory Management', () => {
    it('should manage inventory across multiple orders', () => {
      const product = new Product('prod-6', 'Keyboard', 'Mechanical keyboard', new Money(15000, 'NGN'));
      const inventory = new Inventory('inv-5', product.id);

      // Add initial stock
      inventory.addStock(100);
      expect(inventory.totalStock).toBe(100);

      // Create multiple orders and reserve stock
      const order1 = new Order('order-5', 'cust-5');
      order1.addItem(product.id, product.name, 5, product.price);
      inventory.reserveStock(5);

      const order2 = new Order('order-6', 'cust-6');
      order2.addItem(product.id, product.name, 10, product.price);
      inventory.reserveStock(10);

      const order3 = new Order('order-7', 'cust-7');
      order3.addItem(product.id, product.name, 3, product.price);
      inventory.reserveStock(3);

      expect(inventory.reservedStock).toBe(18);
      expect(inventory.availableStock).toBe(82);

      // Release stock for cancelled order
      inventory.releaseStock(5);
      expect(inventory.reservedStock).toBe(13);
      expect(inventory.availableStock).toBe(87);
    });
  });

  describe('Shipment Tracking', () => {
    it('should track shipment through all stages', () => {
      const shipment = new Shipment('ship-3', 'order-8', ShipmentCarrier.UPS);
      shipment.addItem('prod-7', 'Product', 1);
      shipment.setShippingAddress('100 Main St', 'New York', 'NY', '10001', 'USA');
      shipment.setTrackingNumber('1Z999AA10123456784');

      // Add tracking events
      shipment.addTrackingEvent('Picked up', 'Package picked up from warehouse');
      shipment.addTrackingEvent('In transit', 'Package in transit to destination');
      shipment.addTrackingEvent('Out for delivery', 'Package out for delivery');
      shipment.addTrackingEvent('Delivered', 'Package delivered');

      expect(shipment.trackingEvents.length).toBe(4);
      expect(shipment.getLatestTrackingEvent()?.status).toBe('Delivered');
    });
  });

  describe('Customer Loyalty', () => {
    it('should manage customer loyalty points and tier', () => {
      const customer = new Customer('cust-8', 'loyal@example.com', 'Loyal Customer');

      // Create and process orders
      for (let i = 0; i < 5; i++) {
        const order = new Order(`order-${i}`, customer.id);
        const product = new Product(`prod-${i}`, `Product ${i}`, `Description`, new Money(50000, 'NGN'));
        order.addItem(product.id, product.name, 1, product.price);

        customer.recordOrder(order.id);
        customer.recordSpending(order.total.amount);
        customer.addLoyaltyPoints(Math.floor(order.total.amount / 1000));
      }

      expect(customer.orderCount).toBe(5);
      expect(customer.totalSpent).toBe(250000);
      expect(customer.loyaltyPoints).toBe(250);

      // Upgrade tier based on spending
      if (customer.totalSpent >= 200000) {
        customer.upgradeTier(CustomerTier.GOLD);
      }
      expect(customer.tier).toBe(CustomerTier.GOLD);
    });
  });

  describe('Cart to Order Conversion', () => {
    it('should convert cart to order with all data', () => {
      const customer = new Customer('cust-9', 'cart@example.com', 'Cart User');
      
      // Create cart
      const cart = new Cart(customer.id);
      const product1 = new Product('prod-8', 'Item 1', 'Description', new Money(10000, 'NGN'));
      const product2 = new Product('prod-9', 'Item 2', 'Description', new Money(20000, 'NGN'));

      cart.addItem(product1.id, product1.name, 2, product1.price);
      cart.addItem(product2.id, product2.name, 1, product2.price);
      cart.setShippingAddress('200 Oak St', 'Lagos', 'Lagos', '100001', 'Nigeria');
      cart.setBillingAddress('200 Oak St', 'Lagos', 'Lagos', '100001', 'Nigeria');
      cart.setShippingMethod('EXPRESS', new Money(5000, 'NGN'));
      cart.setPaymentMethod('BANK_TRANSFER');

      // Convert to order
      const order = new Order('order-9', customer.id);
      for (const item of cart.items) {
        order.addItem(item.productId, item.productName, item.quantity, item.unitPrice);
      }
      order.setShippingAddress(
        cart.shippingAddress!.street,
        cart.shippingAddress!.city,
        cart.shippingAddress!.state,
        cart.shippingAddress!.postalCode,
        cart.shippingAddress!.country
      );
      order.setBillingAddress(
        cart.billingAddress!.street,
        cart.billingAddress!.city,
        cart.billingAddress!.state,
        cart.billingAddress!.postalCode,
        cart.billingAddress!.country
      );
      order.setShippingMethod(cart.shippingMethod!, cart.shipping!);

      expect(order.items.length).toBe(2);
      expect(order.subtotal.amount).toBe(40000);
      expect(order.total.amount).toBe(45000);

      // Checkout cart
      cart.checkout();
      expect(cart.status).toBe(CartStatus.CHECKED_OUT);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle insufficient inventory', () => {
      const product = new Product('prod-10', 'Limited Item', 'Limited stock', new Money(100000, 'NGN'));
      const inventory = new Inventory('inv-6', product.id);
      inventory.addStock(5);

      const order = new Order('order-10', 'cust-10');
      order.addItem(product.id, product.name, 10, product.price);

      // Try to reserve more than available
      expect(() => inventory.reserveStock(10)).toThrow('Insufficient stock');
    });

    it('should prevent checkout of empty cart', () => {
      const cart = new Cart('cust-11');
      expect(() => cart.checkout()).toThrow('Cannot checkout empty cart');
    });

    it('should prevent invalid state transitions', () => {
      const shipment = new Shipment('ship-4', 'order-11', ShipmentCarrier.FEDEX);
      // Try to mark in transit without picking up first
      expect(() => shipment.markInTransit()).toThrow('Invalid status transition');
    });
  });

  describe('Performance and Scale', () => {
    it('should handle large orders with many items', () => {
      const order = new Order('order-12', 'cust-12');
      const product = new Product('prod-11', 'Bulk Item', 'Description', new Money(1000, 'NGN'));

      // Add 100 items
      for (let i = 0; i < 100; i++) {
        order.addItem(product.id, product.name, 1, product.price);
      }

      expect(order.items.length).toBe(100);
      expect(order.subtotal.amount).toBe(100000);
    });

    it('should handle shipment with many items', () => {
      const shipment = new Shipment('ship-5', 'order-13', ShipmentCarrier.DHL);
      const product = new Product('prod-12', 'Bulk Product', 'Description', new Money(5000, 'NGN'));

      // Add 50 items to shipment
      for (let i = 0; i < 50; i++) {
        shipment.addItem(product.id, product.name, 1);
      }

      expect(shipment.items.length).toBe(50);
    });

    it('should handle customer with many orders', () => {
      const customer = new Customer('cust-13', 'bulk@example.com', 'Bulk Customer');

      // Record 50 orders
      for (let i = 0; i < 50; i++) {
        customer.recordOrder(`order-${i}`);
        customer.recordSpending(10000);
      }

      expect(customer.orderCount).toBe(50);
      expect(customer.totalSpent).toBe(500000);
    });
  });
});
