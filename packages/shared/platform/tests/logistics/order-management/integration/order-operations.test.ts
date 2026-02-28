/**
 * Order Operations Integration Tests
 * 
 * Integration tests for complete order workflows including database operations.
 */

import { DataSource } from 'typeorm';
import { OrderService } from '../../../../src/logistics/order-management/services/OrderService';
import { EventPublisher, EventBus } from '../../../../src/logistics/order-management/events/EventPublisher';
import { Order, OrderItem } from '../../../../src/logistics/order-management/models';
import { OrderStatus, PaymentStatus, CreateOrderDTO } from '../../../../src/logistics/order-management/types';

describe('Order Operations Integration Tests', () => {
  let dataSource: DataSource;
  let orderService: OrderService;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeAll(async () => {
    // Initialize test database connection
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Order, OrderItem],
      synchronize: true,
      logging: false
    });

    await dataSource.initialize();

    // Create mock event bus
    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined)
    };

    const eventPublisher = new EventPublisher(mockEventBus);
    orderService = new OrderService(dataSource, eventPublisher);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // Clear database before each test
    await dataSource.getRepository(OrderItem).clear();
    await dataSource.getRepository(Order).clear();
    jest.clearAllMocks();
  });

  describe('Complete Order Lifecycle', () => {
    it('should create, confirm, ship, and deliver order', async () => {
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [
          {
            sku: 'PROD-001',
            product_id: 'product-001',
            quantity: 2,
            unit_price: 5000
          }
        ],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        },
        currency: 'NGN'
      };

      // Step 1: Create order
      const createdOrder = await orderService.createOrder(createDTO);
      expect(createdOrder.status).toBe(OrderStatus.PENDING);
      expect(createdOrder.items).toHaveLength(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('order.created', expect.any(Object));

      // Step 2: Confirm order
      const confirmedOrder = await orderService.confirmOrder(
        createdOrder.id,
        'tenant-001',
        { payment_method: 'card' }
      );
      expect(confirmedOrder.status).toBe(OrderStatus.CONFIRMED);
      expect(confirmedOrder.payment_status).toBe(PaymentStatus.PAID);
      expect(mockEventBus.publish).toHaveBeenCalledWith('order.confirmed', expect.any(Object));

      // Step 3: Ship order
      const shippedOrder = await orderService.shipOrder(
        createdOrder.id,
        'tenant-001',
        {
          carrier_code: 'DHL',
          tracking_number: 'TRK-123',
          shipment_date: new Date()
        }
      );
      expect(shippedOrder.status).toBe(OrderStatus.SHIPPED);
      expect(mockEventBus.publish).toHaveBeenCalledWith('order.shipped', expect.any(Object));

      // Step 4: Deliver order
      const deliveredOrder = await orderService.deliverOrder(
        createdOrder.id,
        'tenant-001',
        {
          delivery_date: new Date(),
          delivered_to: 'John Doe'
        }
      );
      expect(deliveredOrder.status).toBe(OrderStatus.DELIVERED);
      expect(mockEventBus.publish).toHaveBeenCalledWith('order.delivered', expect.any(Object));
    });

    it('should create and cancel order', async () => {
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [
          {
            sku: 'PROD-001',
            product_id: 'product-001',
            quantity: 1,
            unit_price: 10000
          }
        ],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      // Create order
      const createdOrder = await orderService.createOrder(createDTO);
      expect(createdOrder.status).toBe(OrderStatus.PENDING);

      // Confirm order
      await orderService.confirmOrder(createdOrder.id, 'tenant-001', {});

      // Cancel order
      const cancelledOrder = await orderService.cancelOrder(
        createdOrder.id,
        'tenant-001',
        { reason: 'Customer request' }
      );
      expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);
      expect(mockEventBus.publish).toHaveBeenCalledWith('order.cancelled', expect.any(Object));
    });
  });

  describe('Multi-Item Orders', () => {
    it('should handle orders with multiple items', async () => {
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [
          {
            sku: 'PROD-001',
            product_id: 'product-001',
            quantity: 2,
            unit_price: 5000
          },
          {
            sku: 'PROD-002',
            product_id: 'product-002',
            quantity: 1,
            unit_price: 3000
          },
          {
            sku: 'PROD-003',
            product_id: 'product-003',
            quantity: 3,
            unit_price: 2000
          }
        ],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      const order = await orderService.createOrder(createDTO);

      expect(order.items).toHaveLength(3);
      expect(order.subtotal).toBe(19000); // (2*5000) + (1*3000) + (3*2000)
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should prevent cross-tenant access', async () => {
      // Create order for tenant-001
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [
          {
            sku: 'PROD-001',
            product_id: 'product-001',
            quantity: 1,
            unit_price: 5000
          }
        ],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      const order = await orderService.createOrder(createDTO);

      // Try to access with wrong tenant
      const result = await orderService.getOrder(order.id, 'tenant-002');

      expect(result).toBeNull();
    });

    it('should isolate orders by tenant in list', async () => {
      // Create orders for different tenants
      const createDTO1: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [{ sku: 'PROD-001', product_id: 'product-001', quantity: 1, unit_price: 5000 }],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      const createDTO2: CreateOrderDTO = {
        ...createDTO1,
        tenant_id: 'tenant-002'
      };

      await orderService.createOrder(createDTO1);
      await orderService.createOrder(createDTO2);

      // List orders for tenant-001
      const result = await orderService.listOrders({
        tenant_id: 'tenant-001',
        page: 1,
        limit: 20
      });

      expect(result.total).toBe(1);
      expect(result.orders[0].tenant_id).toBe('tenant-001');
    });
  });

  describe('Order Filtering', () => {
    it('should filter orders by status', async () => {
      // Create multiple orders with different statuses
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [{ sku: 'PROD-001', product_id: 'product-001', quantity: 1, unit_price: 5000 }],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      const order1 = await orderService.createOrder(createDTO);
      const order2 = await orderService.createOrder(createDTO);
      await orderService.confirmOrder(order2.id, 'tenant-001', {});

      // Filter by pending status
      const pendingOrders = await orderService.listOrders({
        tenant_id: 'tenant-001',
        status: OrderStatus.PENDING
      });

      expect(pendingOrders.total).toBe(1);
      expect(pendingOrders.orders[0].status).toBe(OrderStatus.PENDING);
    });
  });

  describe('Order Statistics', () => {
    it('should calculate order statistics', async () => {
      const createDTO: CreateOrderDTO = {
        tenant_id: 'tenant-001',
        customer_id: 'customer-001',
        items: [{ sku: 'PROD-001', product_id: 'product-001', quantity: 1, unit_price: 10000 }],
        shipping_address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          postal_code: '100001',
          country: 'Nigeria'
        }
      };

      // Create and confirm multiple orders
      const order1 = await orderService.createOrder(createDTO);
      await orderService.confirmOrder(order1.id, 'tenant-001', {});

      const order2 = await orderService.createOrder(createDTO);
      await orderService.confirmOrder(order2.id, 'tenant-001', {});

      const stats = await orderService.getStatistics('tenant-001');

      expect(stats.total_orders).toBe(2);
      expect(stats.total_revenue).toBe(20000);
      expect(stats.average_order_value).toBe(10000);
    });
  });
});
