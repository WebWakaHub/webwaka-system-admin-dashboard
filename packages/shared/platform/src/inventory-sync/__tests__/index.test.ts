/**
 * Inventory Synchronization Unit Tests
 */

import { SyncService, ShopifyConnector, WooCommerceConnector, ConflictResolver } from '../services';
import { InventorySyncAPI } from '../api';
import { Connection, Inventory } from '../models';

describe('Inventory Synchronization Module', () => {
  let syncService: SyncService;
  let api: InventorySyncAPI;

  beforeEach(() => {
    syncService = new SyncService();
    api = new InventorySyncAPI();
  });

  describe('SyncService', () => {
    it('should create a connection successfully', async () => {
      const connection: Connection = {
        connection_id: 'conn-001',
        vendor_id: 'vendor-001',
        platform: 'shopify',
        credentials: {
          api_key: 'test-key',
          api_secret: 'test-secret',
          shop_url: 'test.myshopify.com',
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await syncService.createConnection(connection);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection created successfully');
    });

    it('should fail to create connection with missing fields', async () => {
      const connection: Connection = {
        connection_id: 'conn-002',
        vendor_id: '',
        platform: 'shopify',
        credentials: {
          api_key: 'test-key',
          api_secret: 'test-secret',
          shop_url: 'test.myshopify.com',
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await syncService.createConnection(connection);

      expect(result.success).toBe(false);
    });

    it('should retrieve connections for a vendor', async () => {
      const connection: Connection = {
        connection_id: 'conn-003',
        vendor_id: 'vendor-002',
        platform: 'woocommerce',
        credentials: {
          api_key: 'test-key',
          api_secret: 'test-secret',
          shop_url: 'test.com',
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await syncService.createConnection(connection);
      const connections = await syncService.getConnections('vendor-002');

      expect(connections.length).toBeGreaterThan(0);
      expect(connections[0].vendor_id).toBe('vendor-002');
    });

    it('should synchronize inventory', async () => {
      const connection: Connection = {
        connection_id: 'conn-004',
        vendor_id: 'vendor-003',
        platform: 'shopify',
        credentials: {
          api_key: 'test-key',
          api_secret: 'test-secret',
          shop_url: 'test.myshopify.com',
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await syncService.createConnection(connection);
      const result = await syncService.syncInventory('conn-004');

      expect(result.success).toBe(true);
    });

    it('should update inventory', async () => {
      const inventory: Inventory = {
        inventory_id: 'inv-001',
        product_id: 'prod-001',
        vendor_id: 'vendor-004',
        quantity: 100,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await syncService.updateInventory(inventory);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Inventory updated successfully');
    });

    it('should retrieve inventory for a vendor', async () => {
      const inventory: Inventory = {
        inventory_id: 'inv-002',
        product_id: 'prod-002',
        vendor_id: 'vendor-005',
        quantity: 50,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      await syncService.updateInventory(inventory);
      const inventories = await syncService.getInventory('vendor-005');

      expect(inventories.length).toBeGreaterThan(0);
      expect(inventories[0].vendor_id).toBe('vendor-005');
    });
  });

  describe('ShopifyConnector', () => {
    let connector: ShopifyConnector;

    beforeEach(() => {
      connector = new ShopifyConnector();
    });

    it('should authenticate with valid credentials', async () => {
      const credentials = {
        api_key: 'test-key',
        api_secret: 'test-secret',
        shop_url: 'test.myshopify.com',
      };

      const result = await connector.authenticate(credentials);

      expect(result).toBe(true);
    });

    it('should fail to authenticate with invalid credentials', async () => {
      const credentials = {
        api_key: '',
        api_secret: '',
        shop_url: '',
      };

      const result = await connector.authenticate(credentials);

      expect(result).toBe(false);
    });
  });

  describe('WooCommerceConnector', () => {
    let connector: WooCommerceConnector;

    beforeEach(() => {
      connector = new WooCommerceConnector();
    });

    it('should authenticate with valid credentials', async () => {
      const credentials = {
        api_key: 'test-key',
        api_secret: 'test-secret',
        shop_url: 'test.com',
      };

      const result = await connector.authenticate(credentials);

      expect(result).toBe(true);
    });

    it('should fail to authenticate with invalid credentials', async () => {
      const credentials = {
        api_key: '',
        api_secret: '',
        shop_url: '',
      };

      const result = await connector.authenticate(credentials);

      expect(result).toBe(false);
    });
  });

  describe('ConflictResolver', () => {
    let resolver: ConflictResolver;

    beforeEach(() => {
      resolver = new ConflictResolver();
    });

    it('should resolve conflict using latest timestamp', async () => {
      const local: Inventory = {
        inventory_id: 'inv-003',
        product_id: 'prod-003',
        vendor_id: 'vendor-006',
        quantity: 100,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(Date.now() + 1000), // Newer
      };

      const remote: Inventory = {
        inventory_id: 'inv-003',
        product_id: 'prod-003',
        vendor_id: 'vendor-006',
        quantity: 50,
        last_synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(Date.now() - 1000), // Older
      };

      const result = await resolver.resolveConflict(local, remote);

      expect(result.quantity).toBe(100);
    });
  });

  describe('InventorySyncAPI', () => {
    it('should handle create connection request', async () => {
      const req = {
        body: {
          platform: 'shopify',
          credentials: {
            api_key: 'test-key',
            api_secret: 'test-secret',
            shop_url: 'test.myshopify.com',
          },
        },
        user: { vendor_id: 'vendor-007' },
      };

      const response = await api.createConnection(req);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should handle invalid create connection request', async () => {
      const req = {
        body: {},
        user: { vendor_id: 'vendor-008' },
      };

      const response = await api.createConnection(req);

      expect(response.status).toBe(400);
    });
  });
});
