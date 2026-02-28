/**
 * Event Publisher
 * 
 * Publishes order lifecycle events to the event bus for integration
 * with other modules and external systems.
 */

import { Order } from '../models/Order';
import {
  OrderEventPayload,
  OrderConfirmedEventPayload,
  OrderCancelledEventPayload,
  OrderShippedEventPayload,
  OrderDeliveredEventPayload,
  ShipOrderDTO,
  DeliverOrderDTO
} from '../types';

export interface EventBus {
  publish(eventType: string, payload: any): Promise<void>;
}

export class EventPublisher {
  constructor(private eventBus: EventBus) {}

  /**
   * Publish order.created event
   */
  async publishOrderCreated(order: Order): Promise<void> {
    const payload: OrderEventPayload = {
      tenant_id: order.tenant_id,
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      timestamp: new Date()
    };

    await this.eventBus.publish('order.created', payload);
  }

  /**
   * Publish order.confirmed event
   */
  async publishOrderConfirmed(
    order: Order,
    reservations: Array<{ sku: string; quantity: number; reservation_id: string }>
  ): Promise<void> {
    const payload: OrderConfirmedEventPayload = {
      tenant_id: order.tenant_id,
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      timestamp: new Date(),
      inventory_reservations: reservations
    };

    await this.eventBus.publish('order.confirmed', payload);
  }

  /**
   * Publish order.cancelled event
   */
  async publishOrderCancelled(order: Order, reason: string, refund_amount?: number): Promise<void> {
    const payload: OrderCancelledEventPayload = {
      tenant_id: order.tenant_id,
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      timestamp: new Date(),
      reason,
      refund_amount
    };

    await this.eventBus.publish('order.cancelled', payload);
  }

  /**
   * Publish order.shipped event
   */
  async publishOrderShipped(order: Order, shipmentInfo: ShipOrderDTO): Promise<void> {
    const payload: OrderShippedEventPayload = {
      tenant_id: order.tenant_id,
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      timestamp: new Date(),
      carrier_code: shipmentInfo.carrier_code,
      tracking_number: shipmentInfo.tracking_number,
      shipment_date: shipmentInfo.shipment_date
    };

    await this.eventBus.publish('order.shipped', payload);
  }

  /**
   * Publish order.delivered event
   */
  async publishOrderDelivered(order: Order, deliveryInfo: DeliverOrderDTO): Promise<void> {
    const payload: OrderDeliveredEventPayload = {
      tenant_id: order.tenant_id,
      order_id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      timestamp: new Date(),
      delivery_date: deliveryInfo.delivery_date,
      delivered_to: deliveryInfo.delivered_to
    };

    await this.eventBus.publish('order.delivered', payload);
  }
}
