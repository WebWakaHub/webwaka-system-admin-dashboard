/**
 * Inventory Synchronization API Endpoints
 * REST API for managing synchronization settings and inventory
 */

import { SyncService, ShopifyConnector, WooCommerceConnector } from '../services';
import { Connection, Inventory } from '../models';

export class InventorySyncAPI {
  private syncService: SyncService;
  private shopifyConnector: ShopifyConnector;
  private woocommerceConnector: WooCommerceConnector;

  constructor() {
    this.syncService = new SyncService();
    this.shopifyConnector = new ShopifyConnector();
    this.woocommerceConnector = new WooCommerceConnector();
  }

  /**
   * POST /sync/connections
   * Creates a new connection to an external platform
   */
  async createConnection(req: any): Promise<any> {
    try {
      const { platform, credentials } = req.body;

      if (!platform || !credentials) {
        return {
          status: 400,
          body: { error: 'Missing platform or credentials' },
        };
      }

      // Validate platform is one of the supported types
      if (platform !== 'shopify' && platform !== 'woocommerce') {
        return {
          status: 400,
          body: { error: 'Invalid platform. Must be shopify or woocommerce' },
        };
      }

      // Validate credentials object has required fields
      if (!credentials.api_key || !credentials.api_secret || !credentials.shop_url) {
        return {
          status: 400,
          body: { error: 'Missing required credential fields' },
        };
      }

      // Validate credentials based on platform
      let isValid = false;
      if (platform === 'shopify') {
        isValid = await this.shopifyConnector.authenticate(credentials);
      } else if (platform === 'woocommerce') {
        isValid = await this.woocommerceConnector.authenticate(credentials);
      }

      if (!isValid) {
        return {
          status: 400,
          body: { error: 'Invalid credentials for platform' },
        };
      }

      const connection: Connection = {
        connection_id: `conn-${Date.now()}`,
        vendor_id: req.user?.vendor_id || 'default',
        platform: platform as 'shopify' | 'woocommerce',
        credentials,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await this.syncService.createConnection(connection);

      return {
        status: result.success ? 201 : 400,
        body: result,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }

  /**
   * GET /sync/connections
   * Retrieves all connections for the current vendor
   */
  async getConnections(req: any): Promise<any> {
    try {
      const vendor_id = req.user?.vendor_id || 'default';
      const connections = await this.syncService.getConnections(vendor_id);

      return {
        status: 200,
        body: connections,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }

  /**
   * POST /sync/trigger
   * Triggers a manual synchronization for all connected platforms
   */
  async triggerSync(req: any): Promise<any> {
    try {
      const { connection_id } = req.body;

      if (!connection_id) {
        return {
          status: 400,
          body: { error: 'Missing connection_id' },
        };
      }

      const result = await this.syncService.syncInventory(connection_id);

      return {
        status: result.success ? 202 : 400,
        body: result,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }

  /**
   * GET /inventory
   * Retrieves the current inventory levels for all products
   */
  async getInventory(req: any): Promise<any> {
    try {
      const vendor_id = req.user?.vendor_id || 'default';
      const inventory = await this.syncService.getInventory(vendor_id);

      return {
        status: 200,
        body: inventory,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }

  /**
   * PUT /inventory/:inventory_id
   * Updates inventory for a specific product
   */
  async updateInventory(req: any): Promise<any> {
    try {
      const { inventory_id } = req.params;
      const { quantity } = req.body;

      if (!inventory_id || quantity === undefined) {
        return {
          status: 400,
          body: { error: 'Missing inventory_id or quantity' },
        };
      }

      const inventory: Inventory = {
        inventory_id,
        product_id: req.body.product_id || 'unknown',
        vendor_id: req.user?.vendor_id || 'default',
        quantity,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await this.syncService.updateInventory(inventory);

      return {
        status: result.success ? 200 : 400,
        body: result,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }

  /**
   * GET /sync/status/:connection_id
   * Retrieves the synchronization status for a connection
   */
  async getSyncStatus(req: any): Promise<any> {
    try {
      const { connection_id } = req.params;

      if (!connection_id) {
        return {
          status: 400,
          body: { error: 'Missing connection_id' },
        };
      }

      const status = await this.syncService.getSyncStatus(connection_id);

      if (!status) {
        return {
          status: 404,
          body: { error: 'Sync status not found' },
        };
      }

      return {
        status: 200,
        body: status,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
      };
    }
  }
}
