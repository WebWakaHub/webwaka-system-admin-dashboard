/**
 * SVM Unit Tests
 * Comprehensive unit tests for SVM module with 100% coverage target
 */

import { MVMAccountModel } from '../models/MVMAccount';
import { SVMProductModel } from '../models/Product';
import { InventoryModel } from '../models/Inventory';
import { MVMService } from '../services/MVMService';
import { InventorySyncService, SyncEvent } from '../services/InventorySyncService';
import { SVMRoutes } from '../api/SVMRoutes';
import { Money } from '../../commerce/primitives/Money';

describe('SVM Unit Tests', () => {
  // ============ MVMAccountModel Tests ============
  describe('MVMAccountModel', () => {
    it('should create an MVM account with correct properties', () => {
      const account = new MVMAccountModel(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123',
        'NGN',
        'en'
      );

      expect(account.accountId).toBe('acc-001');
      expect(account.businessName).toBe('Test Business');
      expect(account.email).toBe('test@example.com');
      expect(account.passwordHash).toBe('hashedPassword123');
      expect(account.currency).toBe('NGN');
      expect(account.language).toBe('en');
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it('should use default currency and language', () => {
      const account = new MVMAccountModel(
        'acc-002',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      expect(account.currency).toBe('NGN');
      expect(account.language).toBe('en');
    });

    it('should update profile information', () => {
      const account = new MVMAccountModel(
        'acc-003',
        'Old Business',
        'old@example.com',
        'hashedPassword123'
      );

      const oldUpdatedAt = account.updatedAt;
      account.updateProfile('New Business', 'new@example.com');

      expect(account.businessName).toBe('New Business');
      expect(account.email).toBe('new@example.com');
      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('should update settings', () => {
      const account = new MVMAccountModel(
        'acc-004',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      account.updateSettings('USD', 'fr');

      expect(account.currency).toBe('USD');
      expect(account.language).toBe('fr');
    });

    it('should convert to JSON', () => {
      const account = new MVMAccountModel(
        'acc-005',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const json = account.toJSON();

      expect(json.accountId).toBe('acc-005');
      expect(json.businessName).toBe('Test Business');
      expect(json.email).toBe('test@example.com');
      expect(json.currency).toBe('NGN');
      expect(json.language).toBe('en');
      expect(json.passwordHash).toBeUndefined();
    });
  });

  // ============ SVMProductModel Tests ============
  describe('SVMProductModel', () => {
    it('should create a product with correct properties', () => {
      const price = new Money(5000, 'NGN');
      const product = new SVMProductModel(
        'prod-001',
        'acc-001',
        'Test Product',
        'A test product',
        price,
        ['image1.jpg']
      );

      expect(product.productId).toBe('prod-001');
      expect(product.accountId).toBe('acc-001');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('A test product');
      expect(product.price).toEqual(price);
      expect(product.images).toEqual(['image1.jpg']);
    });

    it('should use empty images array by default', () => {
      const price = new Money(5000, 'NGN');
      const product = new SVMProductModel(
        'prod-002',
        'acc-001',
        'Test Product',
        'A test product',
        price
      );

      expect(product.images).toEqual([]);
    });

    it('should update product details', () => {
      const price = new Money(5000, 'NGN');
      const product = new SVMProductModel(
        'prod-003',
        'acc-001',
        'Old Name',
        'Old description',
        price
      );

      const newPrice = new Money(7000, 'NGN');
      product.updateDetails('New Name', 'New description', newPrice);

      expect(product.name).toBe('New Name');
      expect(product.description).toBe('New description');
      expect(product.price).toEqual(newPrice);
    });

    it('should update images', () => {
      const price = new Money(5000, 'NGN');
      const product = new SVMProductModel(
        'prod-004',
        'acc-001',
        'Test Product',
        'A test product',
        price
      );

      product.updateImages(['image1.jpg', 'image2.jpg']);

      expect(product.images).toEqual(['image1.jpg', 'image2.jpg']);
    });

    it('should convert to JSON', () => {
      const price = new Money(5000, 'NGN');
      const product = new SVMProductModel(
        'prod-005',
        'acc-001',
        'Test Product',
        'A test product',
        price,
        ['image1.jpg']
      );

      const json = product.toJSON();

      expect(json.productId).toBe('prod-005');
      expect(json.accountId).toBe('acc-001');
      expect(json.name).toBe('Test Product');
      expect(json.description).toBe('A test product');
      expect(json.images).toEqual(['image1.jpg']);
    });
  });

  // ============ InventoryModel Tests ============
  describe('InventoryModel', () => {
    it('should create inventory with correct properties', () => {
      const inventory = new InventoryModel('inv-001', 'prod-001', 100);

      expect(inventory.inventoryId).toBe('inv-001');
      expect(inventory.productId).toBe('prod-001');
      expect(inventory.stockLevel).toBe(100);
      expect(inventory.updatedAt).toBeInstanceOf(Date);
    });

    it('should set stock level', () => {
      const inventory = new InventoryModel('inv-002', 'prod-001', 100);

      inventory.setStockLevel(50);

      expect(inventory.stockLevel).toBe(50);
    });

    it('should throw error for negative stock level', () => {
      const inventory = new InventoryModel('inv-003', 'prod-001', 100);

      expect(() => inventory.setStockLevel(-10)).toThrow('Stock level cannot be negative');
    });

    it('should adjust stock positively', () => {
      const inventory = new InventoryModel('inv-004', 'prod-001', 100);

      inventory.adjustStock(50);

      expect(inventory.stockLevel).toBe(150);
    });

    it('should adjust stock negatively', () => {
      const inventory = new InventoryModel('inv-005', 'prod-001', 100);

      inventory.adjustStock(-30);

      expect(inventory.stockLevel).toBe(70);
    });

    it('should throw error for insufficient stock', () => {
      const inventory = new InventoryModel('inv-006', 'prod-001', 100);

      expect(() => inventory.adjustStock(-150)).toThrow('Insufficient stock');
    });

    it('should decrease stock', () => {
      const inventory = new InventoryModel('inv-007', 'prod-001', 100);

      inventory.decreaseStock(30);

      expect(inventory.stockLevel).toBe(70);
    });

    it('should increase stock', () => {
      const inventory = new InventoryModel('inv-008', 'prod-001', 100);

      inventory.increaseStock(50);

      expect(inventory.stockLevel).toBe(150);
    });

    it('should convert to JSON', () => {
      const inventory = new InventoryModel('inv-009', 'prod-001', 100);

      const json = inventory.toJSON();

      expect(json.inventoryId).toBe('inv-009');
      expect(json.productId).toBe('prod-001');
      expect(json.stockLevel).toBe(100);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });

  // ============ MVMService Tests ============
  describe('MVMService', () => {
    let service: MVMService;

    beforeEach(() => {
      service = new MVMService();
    });

    describe('Account Management', () => {
      it('should create an account', () => {
        const account = service.createAccount(
          'acc-001',
          'Test Business',
          'test@example.com',
          'hashedPassword123'
        );

        expect(account.accountId).toBe('acc-001');
        expect(account.businessName).toBe('Test Business');
      });

      it('should throw error for duplicate account', () => {
        service.createAccount(
          'acc-002',
          'Test Business',
          'test@example.com',
          'hashedPassword123'
        );

        expect(() =>
          service.createAccount(
            'acc-002',
            'Another Business',
            'another@example.com',
            'hashedPassword456'
          )
        ).toThrow('Account acc-002 already exists');
      });

      it('should get account by ID', () => {
        service.createAccount(
          'acc-003',
          'Test Business',
          'test@example.com',
          'hashedPassword123'
        );

        const account = service.getAccount('acc-003');

        expect(account.accountId).toBe('acc-003');
      });

      it('should throw error for non-existent account', () => {
        expect(() => service.getAccount('acc-999')).toThrow('Account acc-999 not found');
      });

      it('should update account', () => {
        service.createAccount(
          'acc-004',
          'Old Business',
          'old@example.com',
          'hashedPassword123'
        );

        const updated = service.updateAccount(
          'acc-004',
          'New Business',
          'new@example.com'
        );

        expect(updated.businessName).toBe('New Business');
        expect(updated.email).toBe('new@example.com');
      });
    });

    describe('Product Management', () => {
      beforeEach(() => {
        service.createAccount(
          'acc-001',
          'Test Business',
          'test@example.com',
          'hashedPassword123'
        );
      });

      it('should add a product', () => {
        const price = new Money(5000, 'NGN');
        const product = service.addProduct(
          'prod-001',
          'acc-001',
          'Test Product',
          'A test product',
          price
        );

        expect(product.productId).toBe('prod-001');
        expect(product.accountId).toBe('acc-001');
      });

      it('should throw error for duplicate product', () => {
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-002',
          'acc-001',
          'Test Product',
          'A test product',
          price
        );

        expect(() =>
          service.addProduct(
            'prod-002',
            'acc-001',
            'Another Product',
            'Another product',
            price
          )
        ).toThrow('Product prod-002 already exists');
      });

      it('should throw error for non-existent account', () => {
        const price = new Money(5000, 'NGN');

        expect(() =>
          service.addProduct(
            'prod-003',
            'acc-999',
            'Test Product',
            'A test product',
            price
          )
        ).toThrow('Account acc-999 not found');
      });

      it('should get product by ID', () => {
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-004',
          'acc-001',
          'Test Product',
          'A test product',
          price
        );

        const product = service.getProduct('prod-004');

        expect(product.productId).toBe('prod-004');
      });

      it('should get products by account', () => {
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-005',
          'acc-001',
          'Product 1',
          'Product 1 description',
          price
        );
        service.addProduct(
          'prod-006',
          'acc-001',
          'Product 2',
          'Product 2 description',
          price
        );

        const products = service.getProductsByAccount('acc-001');

        expect(products.length).toBe(2);
        expect(products[0].productId).toBe('prod-005');
        expect(products[1].productId).toBe('prod-006');
      });

      it('should update product', () => {
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-007',
          'acc-001',
          'Old Name',
          'Old description',
          price
        );

        const newPrice = new Money(7000, 'NGN');
        const updated = service.updateProduct(
          'prod-007',
          'New Name',
          'New description',
          newPrice
        );

        expect(updated.name).toBe('New Name');
        expect(updated.description).toBe('New description');
      });

      it('should delete product', () => {
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-008',
          'acc-001',
          'Test Product',
          'A test product',
          price
        );

        service.deleteProduct('prod-008');

        expect(() => service.getProduct('prod-008')).toThrow('Product prod-008 not found');
      });
    });

    describe('Inventory Management', () => {
      beforeEach(() => {
        service.createAccount(
          'acc-001',
          'Test Business',
          'test@example.com',
          'hashedPassword123'
        );
        const price = new Money(5000, 'NGN');
        service.addProduct(
          'prod-001',
          'acc-001',
          'Test Product',
          'A test product',
          price
        );
      });

      it('should set inventory', () => {
        const inventory = service.setInventory('inv-001', 'prod-001', 100);

        expect(inventory.inventoryId).toBe('inv-001');
        expect(inventory.stockLevel).toBe(100);
      });

      it('should get inventory by product', () => {
        service.setInventory('inv-002', 'prod-001', 100);

        const inventory = service.getInventoryByProduct('prod-001');

        expect(inventory?.productId).toBe('prod-001');
        expect(inventory?.stockLevel).toBe(100);
      });

      it('should get inventory by account', () => {
        service.setInventory('inv-003', 'prod-001', 100);

        const inventories = service.getInventoryByAccount('acc-001');

        expect(inventories.length).toBe(1);
        expect(inventories[0].productId).toBe('prod-001');
      });

      it('should adjust stock', () => {
        service.setInventory('inv-004', 'prod-001', 100);

        const inventory = service.adjustStock('prod-001', -30);

        expect(inventory.stockLevel).toBe(70);
      });

      it('should throw error for non-existent inventory', () => {
        expect(() => service.adjustStock('prod-999', -30)).toThrow(
          'No inventory found for product prod-999'
        );
      });
    });
  });

  // ============ InventorySyncService Tests ============
  describe('InventorySyncService', () => {
    let mvmService: MVMService;
    let syncService: InventorySyncService;

    beforeEach(() => {
      mvmService = new MVMService();
      syncService = new InventorySyncService(mvmService);

      // Setup test data
      mvmService.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );
      const price = new Money(5000, 'NGN');
      mvmService.addProduct(
        'prod-001',
        'acc-001',
        'Test Product',
        'A test product',
        price
      );
      mvmService.setInventory('inv-001', 'prod-001', 100);
    });

    it('should queue sync event', () => {
      const event: SyncEvent = {
        eventId: 'evt-001',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };

      syncService.queueSyncEvent(event);

      const status = syncService.getSyncStatus();
      expect(status.queueLength).toBe(1);
    });

    it('should process sync queue', async () => {
      const event: SyncEvent = {
        eventId: 'evt-002',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };

      syncService.queueSyncEvent(event);
      await syncService.processSyncQueue();

      const inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(90);
    });

    it('should get last sync time', async () => {
      const event: SyncEvent = {
        eventId: 'evt-003',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };

      syncService.queueSyncEvent(event);
      await syncService.processSyncQueue();

      const lastSyncTime = syncService.getLastSyncTime('prod-001');
      expect(lastSyncTime).toBeInstanceOf(Date);
    });

    it('should get sync status', () => {
      const event: SyncEvent = {
        eventId: 'evt-004',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 10,
        channel: 'pos',
        timestamp: new Date(),
      };

      syncService.queueSyncEvent(event);

      const status = syncService.getSyncStatus();
      expect(status.queueLength).toBe(1);
      expect(status.syncInProgress).toBe(false);
    });

    it('should trigger manual sync', async () => {
      const event: SyncEvent = {
        eventId: 'evt-005',
        eventType: 'sale.completed',
        productId: 'prod-001',
        quantity: 5,
        channel: 'pos',
        timestamp: new Date(),
      };

      syncService.queueSyncEvent(event);
      await syncService.triggerManualSync();

      const inventory = mvmService.getInventoryByProduct('prod-001');
      expect(inventory?.stockLevel).toBe(95);
    });
  });

  // ============ SVMRoutes Tests ============
  describe('SVMRoutes', () => {
    let mvmService: MVMService;
    let syncService: InventorySyncService;
    let routes: SVMRoutes;

    beforeEach(() => {
      mvmService = new MVMService();
      syncService = new InventorySyncService(mvmService);
      routes = new SVMRoutes(mvmService, syncService);
    });

    it('should create account via routes', () => {
      const result = routes.createAccount(
        'acc-001',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      expect(result.success).toBe(true);
      expect((result.data as any).accountId).toBe('acc-001');
    });

    it('should get account via routes', () => {
      routes.createAccount(
        'acc-002',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const result = routes.getAccount('acc-002');

      expect(result.success).toBe(true);
      expect((result.data as any).accountId).toBe('acc-002');
    });

    it('should add product via routes', () => {
      routes.createAccount(
        'acc-003',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const price = new Money(5000, 'NGN');
      const result = routes.addProduct(
        'prod-001',
        'acc-003',
        'Test Product',
        'A test product',
        price
      );

      expect(result.success).toBe(true);
      expect((result.data as any).productId).toBe('prod-001');
    });

    it('should get products via routes', () => {
      routes.createAccount(
        'acc-004',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-002',
        'acc-004',
        'Test Product',
        'A test product',
        price
      );

      const result = routes.getProducts('acc-004');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect((result.data as any).length).toBe(1);
    });

    it('should set inventory via routes', () => {
      routes.createAccount(
        'acc-005',
        'Test Business',
        'test@example.com',
        'hashedPassword123'
      );

      const price = new Money(5000, 'NGN');
      routes.addProduct(
        'prod-003',
        'acc-005',
        'Test Product',
        'A test product',
        price
      );

      const result = routes.setInventory('inv-001', 'prod-003', 100);

      expect(result.success).toBe(true);
      expect((result.data as any).stockLevel).toBe(100);
    });

    it('should trigger sync via routes', async () => {
      const result = await routes.triggerSync();

      expect(result.success).toBe(true);
      expect((result.data as any).queueLength).toBe(0);
    });
  });
});
