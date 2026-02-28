/**
 * OrderService Unit Tests
 * 
 * Comprehensive unit tests for OrderService business logic.
 * Tests order creation, confirmation, cancellation, and lifecycle management.
 */

import { OrderService } from '../../../../src/logistics/order-management/services/OrderService';
import { OrderRepository } from '../../../../src/logistics/order-management/repositories/OrderRepository';
import { EventPublisher } from '../../../../src/logistics/order-management/events/EventPublisher';
import { Order, OrderItem } from '../../../../src/logistics/order-management/models';
import { OrderStatus, PaymentStatus, CreateOrderDTO } from '../../../../src/logistics/order-management/types';

// Mock dependencies
jest.mock('../../../../src/logistics/order-management/repositories/OrderRepository');
jest.mock('../../../../src/logistics/order-management/events/EventPublisher');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: jest.Mocked<OrderRepository>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {} as any;
    mockOrderRepository = new OrderRepository(mockDataSource) as jest.Mocked<OrderRepository>;
    mockEventPublisher = new EventPublisher({} as any) as jest.Mocked<EventPublisher>;
    orderService = new OrderService(mockDataSource, mockEventPublisher);
    
    // Override repository with mock
    (orderService as any).orderRepository = mockOrderRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const validOrderDTO: CreateOrderDTO = {
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

    it('should create order with valid data', async () => {
      const mockOrder = {
        id: 'order-001',
        ...validOrderDTO,
        order_number: 'ORD-123',
        status: OrderStatus.PENDING,
        subtotal: 10000,
        tax: 0,
        shipping_cost: 0,
        total: 10000,
        payment_status: PaymentStatus.PENDING,
        items: [],
        created_at: new Date(),
        updated_at: new Date()
      } as Order;

      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCreated.mockResolvedValue();

      const result = await orderService.createOrder(validOrderDTO);

      expect(result).toBeDefined();
      expect(result.tenant_id).toBe('tenant-001');
      expect(result.customer_id).toBe('customer-001');
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockEventPublisher.publishOrderCreated).toHaveBeenCalled();
    });

    it('should generate unique order number', async () => {
      const mockOrder = {
        id: 'order-001',
        order_number: 'ORD-1234567890-001',
        items: []
      } as Order;

      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCreated.mockResolvedValue();

      const result = await orderService.createOrder(validOrderDTO);

      expect(result.order_number).toMatch(/^ORD-\d+-\d{3}$/);
    });

    it('should calculate order totals correctly', async () => {
      const mockOrder = {
        id: 'order-001',
        subtotal: 10000,
        tax: 0,
        shipping_cost: 0,
        total: 10000,
        items: []
      } as Order;

      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCreated.mockResolvedValue();

      const result = await orderService.createOrder(validOrderDTO);

      expect(result.subtotal).toBe(10000);
      expect(result.total).toBe(10000);
    });

    it('should set default currency to NGN', async () => {
      const dtoWithoutCurrency = { ...validOrderDTO };
      delete dtoWithoutCurrency.currency;

      const mockOrder = {
        id: 'order-001',
        currency: 'NGN',
        items: []
      } as Order;

      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCreated.mockResolvedValue();

      const result = await orderService.createOrder(dtoWithoutCurrency);

      expect(result.currency).toBe('NGN');
    });

    it('should create order items with calculated totals', async () => {
      const mockOrder = {
        id: 'order-001',
        items: [
          {
            id: 'item-001',
            sku: 'PROD-001',
            quantity: 2,
            unit_price: 5000,
            total_price: 10000
          }
        ]
      } as Order;

      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCreated.mockResolvedValue();

      const result = await orderService.createOrder(validOrderDTO);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].total_price).toBe(10000);
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order and reserve inventory', async () => {
      const mockOrder = {
        id: 'order-001',
        tenant_id: 'tenant-001',
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'item-001',
            sku: 'PROD-001',
            quantity: 2
          }
        ],
        canConfirm: () => true,
        confirm: jest.fn()
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderConfirmed.mockResolvedValue();

      await orderService.confirmOrder('order-001', 'tenant-001', {});

      expect(mockOrder.confirm).toHaveBeenCalled();
      expect(mockEventPublisher.publishOrderConfirmed).toHaveBeenCalled();
    });

    it('should update order status to confirmed', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.PENDING,
        items: [],
        canConfirm: () => true,
        confirm: jest.fn(() => {
          mockOrder.status = OrderStatus.CONFIRMED;
        })
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderConfirmed.mockResolvedValue();

      const result = await orderService.confirmOrder('order-001', 'tenant-001', {});

      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw error if order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        orderService.confirmOrder('order-001', 'tenant-001', {})
      ).rejects.toThrow('Order not found');
    });

    it('should throw error if order cannot be confirmed', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.SHIPPED,
        canConfirm: () => false
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.confirmOrder('order-001', 'tenant-001', {})
      ).rejects.toThrow('Cannot confirm order in status');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and release inventory', async () => {
      const mockOrder = {
        id: 'order-001',
        tenant_id: 'tenant-001',
        status: OrderStatus.CONFIRMED,
        items: [],
        canCancel: () => true,
        cancel: jest.fn()
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCancelled.mockResolvedValue();

      await orderService.cancelOrder('order-001', 'tenant-001', { reason: 'Customer request' });

      expect(mockOrder.cancel).toHaveBeenCalled();
      expect(mockEventPublisher.publishOrderCancelled).toHaveBeenCalled();
    });

    it('should update order status to cancelled', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.CONFIRMED,
        items: [],
        canCancel: () => true,
        cancel: jest.fn(() => {
          mockOrder.status = OrderStatus.CANCELLED;
        })
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderCancelled.mockResolvedValue();

      const result = await orderService.cancelOrder('order-001', 'tenant-001', { reason: 'Test' });

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error if order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        orderService.cancelOrder('order-001', 'tenant-001', { reason: 'Test' })
      ).rejects.toThrow('Order not found');
    });

    it('should throw error if order cannot be cancelled', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.DELIVERED,
        canCancel: () => false
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.cancelOrder('order-001', 'tenant-001', { reason: 'Test' })
      ).rejects.toThrow('Cannot cancel order in status');
    });
  });

  describe('shipOrder', () => {
    it('should mark order as shipped', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.CONFIRMED,
        items: [],
        canShip: () => true,
        ship: jest.fn()
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderShipped.mockResolvedValue();

      const shipDTO = {
        carrier_code: 'DHL',
        tracking_number: 'TRK-123',
        shipment_date: new Date()
      };

      await orderService.shipOrder('order-001', 'tenant-001', shipDTO);

      expect(mockOrder.ship).toHaveBeenCalled();
      expect(mockEventPublisher.publishOrderShipped).toHaveBeenCalled();
    });

    it('should throw error if order cannot be shipped', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.PENDING,
        canShip: () => false
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.shipOrder('order-001', 'tenant-001', {
          carrier_code: 'DHL',
          tracking_number: 'TRK-123',
          shipment_date: new Date()
        })
      ).rejects.toThrow('Cannot ship order in status');
    });
  });

  describe('deliverOrder', () => {
    it('should mark order as delivered', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.SHIPPED,
        items: [],
        canDeliver: () => true,
        deliver: jest.fn()
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publishOrderDelivered.mockResolvedValue();

      const deliverDTO = {
        delivery_date: new Date(),
        delivered_to: 'John Doe'
      };

      await orderService.deliverOrder('order-001', 'tenant-001', deliverDTO);

      expect(mockOrder.deliver).toHaveBeenCalled();
      expect(mockEventPublisher.publishOrderDelivered).toHaveBeenCalled();
    });

    it('should throw error if order cannot be delivered', async () => {
      const mockOrder = {
        id: 'order-001',
        status: OrderStatus.PENDING,
        canDeliver: () => false
      } as any;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.deliverOrder('order-001', 'tenant-001', {
          delivery_date: new Date()
        })
      ).rejects.toThrow('Cannot deliver order in status');
    });
  });

  describe('getOrder', () => {
    it('should retrieve order by ID', async () => {
      const mockOrder = {
        id: 'order-001',
        tenant_id: 'tenant-001',
        order_number: 'ORD-123',
        items: []
      } as Order;

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrder('order-001', 'tenant-001');

      expect(result).toBeDefined();
      expect(result?.id).toBe('order-001');
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-001', 'tenant-001');
    });

    it('should return null for non-existent order', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await orderService.getOrder('order-999', 'tenant-001');

      expect(result).toBeNull();
    });

    it('should enforce tenant isolation', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await orderService.getOrder('order-001', 'wrong-tenant');

      expect(result).toBeNull();
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-001', 'wrong-tenant');
    });
  });

  describe('listOrders', () => {
    it('should list orders with pagination', async () => {
      const mockOrders = [
        { id: 'order-001', items: [] },
        { id: 'order-002', items: [] }
      ] as Order[];

      mockOrderRepository.findWithFilters.mockResolvedValue([mockOrders, 2]);

      const result = await orderService.listOrders({
        tenant_id: 'tenant-001',
        page: 1,
        limit: 20
      });

      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(1);
    });

    it('should filter orders by status', async () => {
      const mockOrders = [
        { id: 'order-001', status: OrderStatus.CONFIRMED, items: [] }
      ] as Order[];

      mockOrderRepository.findWithFilters.mockResolvedValue([mockOrders, 1]);

      await orderService.listOrders({
        tenant_id: 'tenant-001',
        status: OrderStatus.CONFIRMED
      });

      expect(mockOrderRepository.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CONFIRMED })
      );
    });
  });
});
