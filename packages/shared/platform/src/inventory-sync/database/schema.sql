-- Inventory Synchronization Database Schema

-- Connections table
CREATE TABLE IF NOT EXISTS inventory_sync_connections (
  connection_id UUID PRIMARY KEY,
  vendor_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  credentials JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_platform (platform),
  INDEX idx_status (status)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory_sync_inventory (
  inventory_id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_product_id (product_id),
  INDEX idx_last_synced_at (last_synced_at)
);

-- Sync Status table
CREATE TABLE IF NOT EXISTS inventory_sync_status (
  connection_id UUID PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'synced',
  last_sync_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  next_sync_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  FOREIGN KEY (connection_id) REFERENCES inventory_sync_connections(connection_id),
  INDEX idx_status (status),
  INDEX idx_next_sync_time (next_sync_time)
);

-- Sync Audit Log table
CREATE TABLE IF NOT EXISTS inventory_sync_audit_log (
  audit_id UUID PRIMARY KEY,
  connection_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES inventory_sync_connections(connection_id),
  INDEX idx_connection_id (connection_id),
  INDEX idx_created_at (created_at)
);
