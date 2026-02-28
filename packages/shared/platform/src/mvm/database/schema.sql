/**
 * MVM (Multi-Vendor Management) Database Schema
 * PostgreSQL schema for multi-vendor marketplace
 */

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  store_name VARCHAR(255) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  business_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_vendor_status (status),
  INDEX idx_vendor_email (email)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  inventory_count INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_product_vendor (vendor_id),
  INDEX idx_product_status (status)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_order_customer (customer_id),
  INDEX idx_order_status (status)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id),
  product_id UUID NOT NULL REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_order_item_order (order_id),
  INDEX idx_order_item_vendor (vendor_id),
  INDEX idx_order_item_product (product_id),
  INDEX idx_order_item_status (status)
);

-- Commissions table (immutable ledger)
CREATE TABLE IF NOT EXISTS commissions (
  commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(order_item_id),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id),
  amount DECIMAL(12, 2) NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  INDEX idx_commission_vendor (vendor_id),
  INDEX idx_commission_order_item (order_item_id)
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  INDEX idx_payout_vendor (vendor_id),
  INDEX idx_payout_status (status)
);

-- Create indexes for performance
CREATE INDEX idx_products_vendor_status ON products(vendor_id, status);
CREATE INDEX idx_order_items_vendor_status ON order_items(vendor_id, status);
CREATE INDEX idx_commissions_vendor_created ON commissions(vendor_id, created_at);
CREATE INDEX idx_payouts_vendor_created ON payouts(vendor_id, created_at);

-- Create views for common queries
CREATE VIEW vendor_earnings AS
SELECT 
  v.vendor_id,
  v.store_name,
  COUNT(DISTINCT oi.order_id) as total_orders,
  COUNT(oi.order_item_id) as total_items,
  SUM(oi.subtotal) as gross_revenue,
  SUM(c.amount) as total_commissions,
  SUM(oi.subtotal) - SUM(c.amount) as net_earnings
FROM vendors v
LEFT JOIN order_items oi ON v.vendor_id = oi.vendor_id
LEFT JOIN commissions c ON oi.order_item_id = c.order_item_id
GROUP BY v.vendor_id, v.store_name;

CREATE VIEW pending_payouts AS
SELECT 
  p.payout_id,
  p.vendor_id,
  v.store_name,
  p.amount,
  p.created_at
FROM payouts p
JOIN vendors v ON p.vendor_id = v.vendor_id
WHERE p.status = 'pending'
ORDER BY p.created_at ASC;
