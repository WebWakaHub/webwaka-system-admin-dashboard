/**
 * Inventory Synchronization Models
 * Defines data models for connections and inventory
 */

export interface Connection {
  connection_id: string;
  vendor_id: string;
  platform: 'shopify' | 'woocommerce';
  credentials: {
    api_key: string;
    api_secret: string;
    shop_url: string;
  };
  status: 'active' | 'inactive' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface Inventory {
  inventory_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  last_synced_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: Date;
  connection_id?: string;
  error?: string;
}

export interface SyncStatus {
  connection_id: string;
  platform: string;
  status: 'syncing' | 'synced' | 'error';
  last_sync_time: Date;
  next_sync_time: Date;
  error_message?: string;
}
