/**
 * Order Management Module - Type Definitions
 * 
 * This file defines TypeScript interfaces and types for the Order Management module.
 * All types support multi-tenant isolation and follow WebWaka architectural patterns.
 */

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CreateOrderDTO {
  tenant_id: string;
  customer_id: string;
  items: CreateOrderItemDTO[];
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  currency?: string;
}

export interface CreateOrderItemDTO {
  sku: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateOrderDTO {
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
}

export interface ConfirmOrderDTO {
  payment_method?: string;
  payment_reference?: string;
}

export interface CancelOrderDTO {
  reason: string;
  refund_amount?: number;
}

export interface ShipOrderDTO {
  carrier_code: string;
  tracking_number: string;
  shipment_date: Date;
}

export interface DeliverOrderDTO {
  delivery_date: Date;
  delivered_to?: string;
  signature?: string;
  photo_url?: string;
}

export interface OrderFilterDTO {
  tenant_id: string;
  customer_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  from_date?: Date;
  to_date?: Date;
  page?: number;
  limit?: number;
}

export interface OrderResponseDTO {
  id: string;
  tenant_id: string;
  order_number: string;
  customer_id: string;
  order_date: Date;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_status: PaymentStatus;
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  items: OrderItemResponseDTO[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemResponseDTO {
  id: string;
  order_id: string;
  sku: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  inventory_reservation_id?: string;
}

export interface OrderListResponseDTO {
  orders: OrderResponseDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrderEventPayload {
  tenant_id: string;
  order_id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  timestamp: Date;
}

export interface OrderConfirmedEventPayload extends OrderEventPayload {
  inventory_reservations: Array<{
    sku: string;
    quantity: number;
    reservation_id: string;
  }>;
}

export interface OrderCancelledEventPayload extends OrderEventPayload {
  reason: string;
  refund_amount?: number;
}

export interface OrderShippedEventPayload extends OrderEventPayload {
  carrier_code: string;
  tracking_number: string;
  shipment_date: Date;
}

export interface OrderDeliveredEventPayload extends OrderEventPayload {
  delivery_date: Date;
  delivered_to?: string;
}
