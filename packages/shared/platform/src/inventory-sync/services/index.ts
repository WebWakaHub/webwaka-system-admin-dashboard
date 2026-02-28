/**
 * Inventory Synchronization Services
 * Core business logic for inventory synchronization
 */

import { Connection, Inventory, SyncResult, SyncStatus } from '../models';

export class SyncService {
  private connections: Map<string, Connection> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private syncStatus: Map<string, SyncStatus> = new Map();

  async createConnection(connection: Connection): Promise<SyncResult> {
    try {
      if (!connection.vendor_id || !connection.platform) {
        throw new Error('Missing required connection fields');
      }
      
      this.connections.set(connection.connection_id, connection);
      
      return {
        success: true,
        message: 'Connection created successfully',
        timestamp: new Date(),
        connection_id: connection.connection_id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create connection',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getConnections(vendor_id: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.vendor_id === vendor_id
    );
  }

  async syncInventory(connection_id: string): Promise<SyncResult> {
    try {
      const connection = this.connections.get(connection_id);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Simulate API call to external platform
      const platformInventory = await this.fetchPlatformInventory(connection);
      
      // Update local inventory
      for (const item of platformInventory) {
        this.inventory.set(item.inventory_id, item);
      }

      // Update sync status
      this.syncStatus.set(connection_id, {
        connection_id,
        platform: connection.platform,
        status: 'synced',
        last_sync_time: new Date(),
        next_sync_time: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });

      return {
        success: true,
        message: `Synchronized ${platformInventory.length} items`,
        timestamp: new Date(),
        connection_id,
      };
    } catch (error) {
      this.syncStatus.set(connection_id, {
        connection_id,
        platform: 'unknown',
        status: 'error',
        last_sync_time: new Date(),
        next_sync_time: new Date(Date.now() + 60 * 1000), // Retry in 1 minute
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        message: 'Synchronization failed',
        timestamp: new Date(),
        connection_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getInventory(vendor_id: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (inv) => inv.vendor_id === vendor_id
    );
  }

  async updateInventory(inventory: Inventory): Promise<SyncResult> {
    try {
      if (!inventory.inventory_id || !inventory.product_id || !inventory.vendor_id) {
        throw new Error('Missing required inventory fields');
      }

      // Validate quantity is non-negative
      if (inventory.quantity < 0) {
        throw new Error('Inventory quantity cannot be negative');
      }

      this.inventory.set(inventory.inventory_id, {
        ...inventory,
        updated_at: new Date(),
      });

      return {
        success: true,
        message: 'Inventory updated successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update inventory',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSyncStatus(connection_id: string): Promise<SyncStatus | null> {
    return this.syncStatus.get(connection_id) || null;
  }

  private async fetchPlatformInventory(connection: Connection): Promise<Inventory[]> {
    // Simulate fetching inventory from external platform
    return [
      {
        inventory_id: `inv-${Date.now()}-1`,
        product_id: 'prod-001',
        vendor_id: connection.vendor_id,
        quantity: 100,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        inventory_id: `inv-${Date.now()}-2`,
        product_id: 'prod-002',
        vendor_id: connection.vendor_id,
        quantity: 50,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
  }
}

export class ShopifyConnector {
  async authenticate(credentials: any): Promise<boolean> {
    // Validate Shopify credentials
    if (!credentials) return false;
    if (!credentials.api_key || !credentials.api_secret || !credentials.shop_url) return false;
    // Validate credential format
    if (typeof credentials.api_key !== 'string' || credentials.api_key.length === 0) return false;
    if (typeof credentials.api_secret !== 'string' || credentials.api_secret.length === 0) return false;
    if (typeof credentials.shop_url !== 'string' || credentials.shop_url.length === 0) return false;
    return true;
  }

  async fetchInventory(credentials: any): Promise<any[]> {
    // Simulate Shopify API call
    return [];
  }

  async updateInventory(credentials: any, inventory: any[]): Promise<boolean> {
    // Simulate Shopify API call
    return true;
  }
}

export class WooCommerceConnector {
  async authenticate(credentials: any): Promise<boolean> {
    // Validate WooCommerce credentials
    if (!credentials) return false;
    if (!credentials.api_key || !credentials.api_secret || !credentials.shop_url) return false;
    // Validate credential format
    if (typeof credentials.api_key !== 'string' || credentials.api_key.length === 0) return false;
    if (typeof credentials.api_secret !== 'string' || credentials.api_secret.length === 0) return false;
    if (typeof credentials.shop_url !== 'string' || credentials.shop_url.length === 0) return false;
    return true;
  }

  async fetchInventory(credentials: any): Promise<any[]> {
    // Simulate WooCommerce API call
    return [];
  }

  async updateInventory(credentials: any, inventory: any[]): Promise<boolean> {
    // Simulate WooCommerce API call
    return true;
  }
}

export class ConflictResolver {
  async resolveConflict(local: Inventory, remote: Inventory): Promise<Inventory> {
    // Use timestamp-based conflict resolution (latest wins)
    if (local.updated_at > remote.updated_at) {
      return local;
    }
    return remote;
  }
}
