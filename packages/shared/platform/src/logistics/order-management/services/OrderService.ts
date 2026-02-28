/**
 * Order Service
 * 
 * Core business logic for order management including order lifecycle,
 * inventory integration, and event publishing.
 */

import { DataSource } from 'typeorm';
import { Order, OrderItem } from '../models';
import { OrderRepository } from '../repositories/OrderRepository';
import { EventPublisher } from '../events/EventPublisher';
import {
  CreateOrderDTO,
  UpdateOrderDTO,
  ConfirmOrderDTO,
  CancelOrderDTO,
  ShipOrderDTO,
  DeliverOrderDTO,
  OrderFilterDTO,
  OrderResponseDTO,
  OrderListResponseDTO,
  OrderStatus
} from '../types';

export class OrderService {
  private orderRepository: OrderRepository;
  private eventPublisher: EventPublisher;

  constructor(
    private dataSource: DataSource,
    eventPublisher: EventPublisher
  ) {
    this.orderRepository = new OrderRepository(dataSource);
    this.eventPublisher = eventPublisher;
  }

  /**
   * Create a new order
   */
  async createOrder(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    // Generate unique order number
    const order_number = await this.generateOrderNumber(dto.tenant_id);

    // Create order entity
    const order = new Order();
    order.tenant_id = dto.tenant_id;
    order.customer_id = dto.customer_id;
    order.order_number = order_number;
    order.shipping_address = dto.shipping_address;
    order.billing_address = dto.billing_address || dto.shipping_address;
    order.notes = dto.notes;
    order.currency = dto.currency || 'NGN';
    order.status = OrderStatus.PENDING;

    // Create order items
    order.items = dto.items.map(itemDto => {
      const item = new OrderItem();
      item.sku = itemDto.sku;
      item.product_id = itemDto.product_id;
      item.quantity = itemDto.quantity;
      item.unit_price = itemDto.unit_price;
      item.validate();
      return item;
    });

    // Calculate totals
    order.calculateTotals();

    // Save order
    const savedOrder = await this.orderRepository.create(order);

    // Publish order.created event
    await this.eventPublisher.publishOrderCreated(savedOrder);

    return this.toResponseDTO(savedOrder);
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string, tenant_id: string): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      return null;
    }
    return this.toResponseDTO(order);
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(order_number: string, tenant_id: string): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepository.findByOrderNumber(order_number, tenant_id);
    if (!order) {
      return null;
    }
    return this.toResponseDTO(order);
  }

  /**
   * List orders with filters
   */
  async listOrders(filters: OrderFilterDTO): Promise<OrderListResponseDTO> {
    const [orders, total] = await this.orderRepository.findWithFilters(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    return {
      orders: orders.map(order => this.toResponseDTO(order)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  /**
   * Update order
   */
  async updateOrder(id: string, tenant_id: string, dto: UpdateOrderDTO): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      return null;
    }

    // Only allow updates for pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Cannot update order that is not in pending status');
    }

    if (dto.shipping_address) {
      order.shipping_address = dto.shipping_address;
    }

    if (dto.billing_address) {
      order.billing_address = dto.billing_address;
    }

    if (dto.notes !== undefined) {
      order.notes = dto.notes;
    }

    const updatedOrder = await this.orderRepository.save(order);
    return this.toResponseDTO(updatedOrder);
  }

  /**
   * Confirm order and reserve inventory
   */
  async confirmOrder(id: string, tenant_id: string, dto: ConfirmOrderDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canConfirm()) {
      throw new Error(`Cannot confirm order in status: ${order.status}`);
    }

    // TODO: Integrate with Inventory Management to reserve inventory
    // For now, we'll simulate successful reservation
    const reservations = order.items.map(item => ({
      sku: item.sku,
      quantity: item.quantity,
      reservation_id: `RES-${Date.now()}-${item.sku}`
    }));

    // Update order items with reservation IDs
    order.items.forEach((item, index) => {
      item.inventory_reservation_id = reservations[index].reservation_id;
    });

    // Confirm the order
    order.confirm();

    // Save order
    const confirmedOrder = await this.orderRepository.save(order);

    // Publish order.confirmed event
    await this.eventPublisher.publishOrderConfirmed(confirmedOrder, reservations);

    return this.toResponseDTO(confirmedOrder);
  }

  /**
   * Cancel order and release inventory
   */
  async cancelOrder(id: string, tenant_id: string, dto: CancelOrderDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canCancel()) {
      throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    // TODO: Integrate with Inventory Management to release reservations
    // TODO: Integrate with Payment system to process refund

    // Cancel the order
    order.cancel();

    // Save order
    const cancelledOrder = await this.orderRepository.save(order);

    // Publish order.cancelled event
    await this.eventPublisher.publishOrderCancelled(cancelledOrder, dto.reason, dto.refund_amount);

    return this.toResponseDTO(cancelledOrder);
  }

  /**
   * Mark order as shipped
   */
  async shipOrder(id: string, tenant_id: string, dto: ShipOrderDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canShip()) {
      throw new Error(`Cannot ship order in status: ${order.status}`);
    }

    // Ship the order
    order.ship();

    // Save order
    const shippedOrder = await this.orderRepository.save(order);

    // Publish order.shipped event
    await this.eventPublisher.publishOrderShipped(shippedOrder, dto);

    return this.toResponseDTO(shippedOrder);
  }

  /**
   * Mark order as delivered
   */
  async deliverOrder(id: string, tenant_id: string, dto: DeliverOrderDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(id, tenant_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canDeliver()) {
      throw new Error(`Cannot deliver order in status: ${order.status}`);
    }

    // Deliver the order
    order.deliver();

    // Save order
    const deliveredOrder = await this.orderRepository.save(order);

    // Publish order.delivered event
    await this.eventPublisher.publishOrderDelivered(deliveredOrder, dto);

    return this.toResponseDTO(deliveredOrder);
  }

  /**
   * Get order statistics
   */
  async getStatistics(tenant_id: string, from_date?: Date, to_date?: Date) {
    return await this.orderRepository.getStatistics(tenant_id, from_date, to_date);
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(tenant_id: string): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Convert Order entity to response DTO
   */
  private toResponseDTO(order: Order): OrderResponseDTO {
    return {
      id: order.id,
      tenant_id: order.tenant_id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      order_date: order.order_date,
      status: order.status,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping_cost: Number(order.shipping_cost),
      total: Number(order.total),
      currency: order.currency,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes,
      items: order.items.map(item => ({
        id: item.id,
        order_id: item.order_id,
        sku: item.sku,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        inventory_reservation_id: item.inventory_reservation_id
      })),
      created_at: order.created_at,
      updated_at: order.updated_at
    };
  }
}
