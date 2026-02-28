/**
 * MVM (Multi-Vendor Management) Data Models
 * Defines all data entities for the multi-vendor marketplace
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Vendor entity - represents a seller in the marketplace
 */
export interface Vendor {
  vendor_id: string;
  email: string;
  store_name: string;
  business_name: string;
  business_address: string;
  payment_method: string;
  payment_details: Record<string, any>;
  status: 'pending' | 'approved' | 'suspended' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

/**
 * Product entity - represents a product listed by a vendor
 */
export interface Product {
  product_id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  inventory_count: number;
  images: string[];
  status: 'active' | 'inactive' | 'archived';
  created_at: Date;
  updated_at: Date;
}

/**
 * Order entity - represents a customer order
 */
export interface Order {
  order_id: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

/**
 * OrderItem entity - represents individual items in an order
 */
export interface OrderItem {
  order_item_id: string;
  order_id: string;
  vendor_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

/**
 * Commission entity - records platform commission from sales
 */
export interface Commission {
  commission_id: string;
  order_item_id: string;
  vendor_id: string;
  amount: number;
  rate: number;
  created_at: Date;
}

/**
 * Payout entity - represents vendor payment records
 */
export interface Payout {
  payout_id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  created_at: Date;
  paid_at?: Date;
}

/**
 * Factory functions for creating entities
 */
export const createVendor = (data: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'>): Vendor => ({
  vendor_id: uuidv4(),
  ...data,
  created_at: new Date(),
  updated_at: new Date(),
});

export const createProduct = (data: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>): Product => ({
  product_id: uuidv4(),
  ...data,
  created_at: new Date(),
  updated_at: new Date(),
});

export const createOrder = (data: Omit<Order, 'order_id' | 'created_at' | 'updated_at'>): Order => ({
  order_id: uuidv4(),
  ...data,
  created_at: new Date(),
  updated_at: new Date(),
});

export const createOrderItem = (data: Omit<OrderItem, 'order_item_id' | 'created_at' | 'updated_at'>): OrderItem => ({
  order_item_id: uuidv4(),
  ...data,
  created_at: new Date(),
  updated_at: new Date(),
});

export const createCommission = (data: Omit<Commission, 'commission_id' | 'created_at'>): Commission => ({
  commission_id: uuidv4(),
  ...data,
  created_at: new Date(),
});

export const createPayout = (data: Omit<Payout, 'payout_id' | 'created_at'>): Payout => ({
  payout_id: uuidv4(),
  ...data,
  created_at: new Date(),
});
