/**
 * SVM Integration Tests
 * Comprehensive integration tests for SVM module workflows
 */

import { MVMService } from '../services/MVMService';
import { InventorySyncService, SyncEvent } from '../services/InventorySyncService';
import { SVMRoutes } from '../api/SVMRoutes';
import { Money } from '../../commerce/primitives/Money';

describe('SVM Integration Tests', () => {
  let mvmService: MVMService;
  let syncService: InventorySyncService;
  let routes: SVMRoutes;

  beforeEach(() => {
    mvmService = new MVMService();
    syncService = new InventorySyncService(mvmService);
    routes = new SVMRoutes(mvmService, syncService);
  });

  describe('Complete MVM Workflow', () => {
    it('should complete full MVM setup workflow', () => {
      // Step 1: Create account
      const accountResult = routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
      expect(accountResult.success).toBe(true);

      // Step 2: Add products
      const price1 = new Money(5000, 'NGN');
      const product1Result = routes.addProduct(
        'prod-001',
        'acc-001',
        'Product 1',
        'First product',
        price1
      );
      expect(product1Result.success).toBe(true);

      const price2 = new Money(7000, 'NGN');
      const product2Result = routes.addProduct(
        'prod-002',
        'acc-001',
        'Product 2',
        'Second product',
        price2
      );
      expect(product2Result.success).toBe(true);

      // Step 3: Set inventory
      const inv1Result = routes.setInventory('inv-001', 'prod-001', 100);
      expect(inv1Result.success).toBe(true);

      const inv2Result = routes.setInventory('inv-002', 'prod-002', 50);
      expect(inv2Result.success).toBe(true);

      // Step 4: Get all products
      const productsResult = routes.getProducts('acc-001');
      expect(productsResult.success).toBe(true);
      expect(Array.isArray(productsResult.data)).toBe(true);
      expect((productsResult.data as any).length).toBe(2);
    });

    it('should handle multiple accounts independently', () => {
      // Create account 1
      routes.createAccount(
        'acc-001',
        'Business 1',
        'business1@example.com',
        'hashedPassword123'
      );

      // Create account 2
      routes.createAccount(
        'acc-002',
        'Business 2',
        'business2@example.com',
        'hashedPassword456'
      );

      // Add products to account 1
      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-001',
        'acc-001',
        'Product 1',
        'First product',
        price
      );

      // Add products to account 2
      routes.addProduct(
        'prod-002',
        'acc-002',
        'Product 2',
        'Second product',
        price
      );

      // Verify products are separate
      const products1 = routes.getProducts('acc-001');
      const products2 = routes.getProducts('acc-002');

      expect((products1.data as any).length).toBe(1);
      expect((products2.data as any).length).toBe(1);
      expect((products1.data as any)[0].productId).toBe('prod-001');
      expect((products2.data as any)[0].productId).toBe('prod-002');
    });
  });

  describe('Inventory Synchronization Workflow', () => {
    beforeEach(() => {
      // Setup: Create account, product, and inventory
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-001',
        'acc-001',
        'Test Product',
        'A test product',
        price
      );
      routes.setInventory('inv-001', 'prod-001', 100);
    });

    it('should sync inventory after sale event', async () => {
      // Initial inventory
      let inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(100);

      // Queue sale event
      const saleEvent: SyncEvent = {
        eventId: 'evt-001',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };
      syncService.queueSyncEvent(saleEvent);

      // Process sync
      await syncService.processSyncQueue();

      // Verify inventory updated
      inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(90);
    });

    it('should handle multiple sync events in queue', async () => {
      // Queue multiple events
      const event1: SyncEvent = {
        eventId: 'evt-001',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };
      syncService.queueSyncEvent(event1);

      const event2: SyncEvent = {
        eventId: 'evt-002',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 5,
        channel: 'pos',
        timestamp: new Date(),
      };
      syncService.queueSyncEvent(event2);

      // Process all events
      await syncService.processSyncQueue();

      // Verify total reduction
      const inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(85);
    });

    it('should track sync status during processing', async () => {
      const event: SyncEvent = {
        eventId: 'evt-001',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };
      syncService.queueSyncEvent(event);

      // Check status before sync
      let status = syncService.getSyncStatus();
      expect(status.queueLength).toBe(1);

      // Process sync
      await syncService.processSyncQueue();

      // Check status after sync
      status = syncService.getSyncStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should record last sync time', async () => {
      const event: SyncEvent = {
        eventId: 'evt-001',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };
      syncService.queueSyncEvent(event);

      // Process sync
      await syncService.processSyncQueue();

      // Check last sync time
      const lastSyncTime = syncService.getLastSyncTime('prod-001');
      expect(lastSyncTime).toBeInstanceOf(Date);
      expect(lastSyncTime?.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Product Management Workflow', () => {
    beforeEach(() => {
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
    });

    it('should add, update, and delete products', () => {
      // Add product
      const price = new Money(5000, 'NGN');
      const addResult = routes.addProduct(
        'prod-001',
        'acc-001',
        'Original Name',
        'Original description',
        price
      );
      expect(addResult.success).toBe(true);

      // Update product
      const newPrice = new Money(7000, 'NGN');
      const updateResult = routes.updateProduct(
        'prod-001',
        'Updated Name',
        'Updated description',
        newPrice
      );
      expect(updateResult.success).toBe(true);

      // Verify update
      const getResult = routes.getProduct('prod-001');
      expect((getResult.data as any).name).toBe('Updated Name');
      expect((getResult.data as any).description).toBe('Updated description');

      // Delete product
      const deleteResult = routes.deleteProduct('prod-001');
      expect(deleteResult.success).toBe(true);

      // Verify deletion
      try {
        routes.getProduct('prod-001');
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('not found');
      }
    });

    it('should handle product images', () => {
      const price = new Money(5000, 'NGN');
      const addResult = routes.addProduct(
        'prod-001',
        'acc-001',
        'Product with Images',
        'Product with images',
        price,
        ['image1.jpg', 'image2.jpg']
      );
      expect(addResult.success).toBe(true);

      const getResult = routes.getProduct('prod-001');
      expect((getResult.data as any).images).toEqual(['image1.jpg', 'image2.jpg']);
    });
  });

  describe('Inventory Management Workflow', () => {
    beforeEach(() => {
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-001',
        'acc-001',
        'Test Product',
        'A test product',
        price
      );
    });

    it('should set and adjust inventory', () => {
      // Set initial inventory
      const setResult = routes.setInventory('inv-001', 'prod-001', 100);
      expect(setResult.success).toBe(true);
      expect((setResult.data as any).stockLevel).toBe(100);

      // Adjust inventory down
      const adjustDownResult = mvmService.adjustStock('prod-001', -20);
      expect(adjustDownResult.stockLevel).toBe(80);

      // Adjust inventory up
      const adjustUpResult = mvmService.adjustStock('prod-001', 30);
      expect(adjustUpResult.stockLevel).toBe(110);
    });

    it('should get inventory by account', () => {
      // Set inventory for multiple products
      routes.setInventory('inv-001', 'prod-001', 100);

      const price = new Money(3000, 'NGN');
      routes.addProduct(
        'prod-002',
        'acc-001',
        'Product 2',
        'Second product',
        price
      );
      routes.setInventory('inv-002', 'prod-002', 50);

      // Get inventory by account
      const inventoriesResult = routes.getInventory('acc-001');
      expect(inventoriesResult.success).toBe(true);
      expect(Array.isArray(inventoriesResult.data)).toBe(true);
      expect((inventoriesResult.data as any).length).toBe(2);
    });

    it('should prevent negative inventory', () => {
      routes.setInventory('inv-001', 'prod-001', 100);

      // Try to reduce below zero
      try {
        mvmService.adjustStock('prod-001', -150);
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('Insufficient stock');
      }

      // Verify inventory unchanged
      const inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(100);
    });
  });

  describe('Account Management Workflow', () => {
    it('should create and retrieve account', () => {
      const createResult = routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
      expect(createResult.success).toBe(true);

      const getResult = routes.getAccount('acc-001');
      expect(getResult.success).toBe(true);
      expect((getResult.data as any).accountId).toBe('acc-001');
      expect((getResult.data as any).businessName).toBe('Test Business');
    });

    it('should update account information', () => {
      routes.createAccount(
        'acc-001',
        'Old Business',
        'old@example.com',
        'hashedPassword123'
      );

      const updateResult = routes.updateAccount(
        'acc-001',
        'New Business',
        'new@example.com'
      );
      expect(updateResult.success).toBe(true);

      const getResult = routes.getAccount('acc-001');
      expect((getResult.data as any).businessName).toBe('New Business');
      expect((getResult.data as any).email).toBe('new@example.com');
    });

    it('should prevent duplicate account creation', () => {
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      try {
        routes.createAccount(
          'acc-001',
          'Another Business',
          'another@example.com',
          'hashedPassword456'
        );
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('already exists');
      }
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle non-existent account gracefully', () => {
      try {
        routes.getAccount('acc-999');
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('not found');
      }
    });

    it('should handle non-existent product gracefully', () => {
      try {
        routes.getProduct('prod-999');
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('not found');
      }
    });

    it('should handle operations on non-existent inventory', () => {
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      try {
        mvmService.adjustStock('prod-999', -10);
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('No inventory found');
      }
    });

    it('should handle invalid product addition', () => {
      try {
        routes.addProduct(
          'prod-001',
          'acc-999',
          'Product',
          'Description',
          new Money(5000, 'NGN')
        );
        expect(true).toBe(false); // Should throw error
      } catch (error) {
        expect((error as any).message).toContain('not found');
      }
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complete e-commerce workflow', async () => {
      // 1. Create merchant account
      routes.createAccount(
        'acc-001',
        'E-commerce Store',
        'store@example.com',
        'hashedPassword123'
      );

      // 2. Add multiple products
      const products = [
        { id: 'prod-001', name: 'Product 1', price: 5000 },
        { id: 'prod-002', name: 'Product 2', price: 7000 },
        { id: 'prod-003', name: 'Product 3', price: 3000 },
      ];

      for (const product of products) {
        routes.addProduct(
          product.id,
          'acc-001',
          product.name,
          `Description for ${product.name}`,
          new Money(product.price, 'NGN')
        );
      }

      // 3. Set initial inventory
      routes.setInventory('inv-001', 'prod-001', 100);
      routes.setInventory('inv-002', 'prod-002', 50);
      routes.setInventory('inv-003', 'prod-003', 200);

      // 4. Simulate sales with sync events
      const saleEvents: SyncEvent[] = [
        {
          eventId: 'evt-001',
          eventType: 'sale.completed',
          productId: 'prod-001',
          quantity: 5,
          channel: 'pos',
          timestamp: new Date(),
        },
        {
          eventId: 'evt-002',
          eventType: 'sale.completed',
          productId: 'prod-002',
          quantity: 3,
          channel: 'pos',
          timestamp: new Date(),
        },
        {
          eventId: 'evt-003',
          eventType: 'sale.completed',
          productId: 'prod-003',
          quantity: 10,
          channel: 'pos',
          timestamp: new Date(),
        },
      ];

      for (const event of saleEvents) {
        syncService.queueSyncEvent(event);
      }

      // 5. Process all sync events
      await syncService.processSyncQueue();

        // Verify final inventory levels
      const inv1 = mvmService.getInventoryByProduct('prod-001');
      const inv2 = mvmService.getInventoryByProduct('prod-002');
      const inv3 = mvmService.getInventoryByProduct('prod-003');

      expect(inv1?.stockLevel).toBe(95); // 100 - 5
      expect(inv2?.stockLevel).toBe(47); // 50 - 3
      expect(inv3?.stockLevel).toBe(190); // 200 - 10;

      // 7. Verify sync status
      const status = syncService.getSyncStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should handle concurrent product updates', () => {
      routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-001',
        'acc-001',
        'Product',
        'Description',
        price
      );

      // Simulate concurrent updates
      routes.updateProduct(
        'prod-001',
        'Updated 1',
        'Description 1',
        new Money(6000, 'NGN')
      );

      routes.updateProduct(
        'prod-001',
        'Updated 2',
        'Description 2',
        new Money(7000, 'NGN')
      );

      // Verify final state
      const result = routes.getProduct('prod-001');
      expect((result.data as any).name).toBe('Updated 2');
    });
  });
});
