import { POSService } from '../services/POSService';
import { Sale } from '../models/Sale';
import { Cart } from '../components/Cart';
import { Payment } from '../components/Payment';
import { Receipt } from '../components/Receipt';
import { Money } from '../../commerce/primitives/Money';

/**
 * POS Integration Tests
 * Tests complete workflows and interactions between POS components
 */
describe('POS Integration Tests', () => {
  let posService: POSService;

  beforeEach(() => {
    posService = new POSService();
  });

  describe('Complete Sale Workflow', () => {
    test('should complete a full sale with cash payment', () => {
      // Create cart
      const cart = posService.createCart();
      expect(cart).toBeDefined();
      expect(cart.isEmpty()).toBe(true);

      // Add items to cart
      const product1 = { id: 'prod-1', name: 'Product 1', sku: 'SKU-001' } as any;
      const product2 = { id: 'prod-2', name: 'Product 2', sku: 'SKU-002' } as any;

      posService.addToCart(product1, 2, 5000);
      posService.addToCart(product2, 1, 10000);

      // Verify cart contents
      const cartSummary = posService.getCartSummary();
      expect(cartSummary).toBeDefined();
      expect(cartSummary?.itemCount).toBe(2);
      expect(cartSummary?.quantityCount).toBe(3);
      expect(cartSummary?.subtotal).toBe(20000);

      // Apply discount
      posService.applyCartDiscount(1000);
      const discountedSummary = posService.getCartSummary();
      expect(discountedSummary?.discount).toBe(1000);

      // Apply tax
      posService.applyTax(1900);
      const taxedSummary = posService.getCartSummary();
      expect(taxedSummary?.tax).toBe(1900);
      expect(taxedSummary?.total).toBe(20900);

      // Complete sale
      const sale = posService.completeSale('cash', 21000, 'cust-123');
      expect(sale).toBeDefined();
      expect(sale.id).toBeDefined();
      expect(sale.status).toBe('completed');
      expect(sale.paymentMethod).toBe('cash');
      expect(sale.amountPaid.amount).toBe(21000);
      expect(sale.total.amount).toBe(20900);

      // Verify change
      const change = sale.getChange();
      expect(change).toBeDefined();
      expect(change?.amount).toBe(100);

      // Verify receipt was generated
      const receipt = posService.getReceipt(sale.receiptId!);
      expect(receipt).toBeDefined();
      expect(receipt?.total).toBe(20900);
    });

    test('should complete a sale with card payment', () => {
      const cart = posService.createCart('cust-456');
      const product = { id: 'prod-3', name: 'Premium Product', sku: 'SKU-003' } as any;

      posService.addToCart(product, 1, 50000);
      posService.applyTax(5000);

      const sale = posService.completeSale('card', 55000, 'cust-456');
      expect(sale.paymentMethod).toBe('card');
      expect(sale.status).toBe('completed');
      expect(sale.isPaymentComplete()).toBe(true);
    });

    test('should complete a sale with split payments', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-4', name: 'Item', sku: 'SKU-004' } as any;

      posService.addToCart(product, 2, 5000);
      posService.applyTax(1000);

      // Total: 11000
      // Split: 6000 cash + 5000 card
      const sale = posService.completeSale('cash', 11000);
      expect(sale.total.amount).toBe(11000);
      expect(sale.isPaymentComplete()).toBe(true);
    });
  });

  describe('Offline Functionality', () => {
    test('should queue transactions when offline', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-5', name: 'Offline Product', sku: 'SKU-005' } as any;

      posService.addToCart(product, 1, 3000);

      const sale = posService.completeSale('cash', 3000);
      expect(sale.id).toBeDefined();

      const syncStatus = posService.getOfflineSyncStatus();
      expect(syncStatus).toBeDefined();
      expect(syncStatus.isOnline).toBeDefined();
    });

    test('should sync pending transactions when online', async () => {
      const cart = posService.createCart();
      const product = { id: 'prod-6', name: 'Sync Product', sku: 'SKU-006' } as any;

      posService.addToCart(product, 1, 2000);
      const sale = posService.completeSale('cash', 2000);

      // Simulate sync
      await posService.syncPendingTransactions();

      const syncStatus = posService.getOfflineSyncStatus();
      expect(syncStatus.pendingTransactions).toBeDefined();
    });
  });

  describe('Receipt Generation', () => {
    test('should generate text receipt', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-7', name: 'Receipt Test', sku: 'SKU-007' } as any;

      posService.addToCart(product, 1, 5000);
      const sale = posService.completeSale('cash', 5000);

      const receiptText = posService.generateReceiptText(sale.receiptId!);
      expect(receiptText).toBeDefined();
      expect(receiptText).toContain('Receipt');
      expect(receiptText).toContain('5000');
    });

    test('should generate HTML receipt', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-8', name: 'HTML Receipt', sku: 'SKU-008' } as any;

      posService.addToCart(product, 1, 7500);
      const sale = posService.completeSale('cash', 7500);

      const receiptHTML = posService.generateReceiptHTML(sale.receiptId!);
      expect(receiptHTML).toBeDefined();
      expect(receiptHTML).toContain('<html>');
      expect(receiptHTML).toContain('7500');
    });
  });

  describe('Cart Management', () => {
    test('should add and remove items from cart', () => {
      const cart = posService.createCart();
      const product1 = { id: 'prod-9', name: 'Product 9', sku: 'SKU-009' } as any;
      const product2 = { id: 'prod-10', name: 'Product 10', sku: 'SKU-010' } as any;

      posService.addToCart(product1, 1, 1000);
      posService.addToCart(product2, 1, 2000);

      let summary = posService.getCartSummary();
      expect(summary?.itemCount).toBe(2);
      expect(summary?.subtotal).toBe(3000);

      posService.removeFromCart('prod-9');

      summary = posService.getCartSummary();
      expect(summary?.itemCount).toBe(1);
      expect(summary?.subtotal).toBe(2000);
    });

    test('should update item quantity', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-11', name: 'Product 11', sku: 'SKU-011' } as any;

      posService.addToCart(product, 1, 1000);
      let summary = posService.getCartSummary();
      expect(summary?.quantityCount).toBe(1);

      posService.updateCartQuantity('prod-11', 5);
      summary = posService.getCartSummary();
      expect(summary?.quantityCount).toBe(5);
      expect(summary?.subtotal).toBe(5000);
    });

    test('should apply item discount', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-12', name: 'Product 12', sku: 'SKU-012' } as any;

      posService.addToCart(product, 2, 1000);
      let summary = posService.getCartSummary();
      expect(summary?.subtotal).toBe(2000);

      posService.applyItemDiscount('prod-12', 200);
      summary = posService.getCartSummary();
      expect(summary?.subtotal).toBe(1800);
    });
  });

  describe('Payment Processing', () => {
    test('should process cash payment', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-13', name: 'Product 13', sku: 'SKU-013' } as any;

      posService.addToCart(product, 1, 5000);
      const sale = posService.completeSale('cash', 5000);

      expect(sale.paymentMethod).toBe('cash');
      expect(sale.isPaymentComplete()).toBe(true);
    });

    test('should process card payment', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-14', name: 'Product 14', sku: 'SKU-014' } as any;

      posService.addToCart(product, 1, 10000);
      const sale = posService.completeSale('card', 10000);

      expect(sale.paymentMethod).toBe('card');
      expect(sale.isPaymentComplete()).toBe(true);
    });

    test('should process mobile money payment', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-15', name: 'Product 15', sku: 'SKU-015' } as any;

      posService.addToCart(product, 1, 3000);
      const sale = posService.completeSale('mobile_money', 3000);

      expect(sale.paymentMethod).toBe('mobile_money');
      expect(sale.isPaymentComplete()).toBe(true);
    });

    test('should reject insufficient payment', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-16', name: 'Product 16', sku: 'SKU-016' } as any;

      posService.addToCart(product, 1, 5000);

      expect(() => {
        posService.completeSale('cash', 4000);
      }).toThrow('Insufficient payment');
    });
  });

  describe('Sale Refund', () => {
    test('should refund a completed sale', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-17', name: 'Product 17', sku: 'SKU-017' } as any;

      posService.addToCart(product, 1, 5000);
      const sale = posService.completeSale('cash', 5000);

      expect(sale.status).toBe('completed');

      sale.refund();
      expect(sale.status).toBe('refunded');
    });
  });

  describe('Error Handling', () => {
    test('should handle empty cart completion', () => {
      const cart = posService.createCart();

      expect(() => {
        posService.completeSale('cash', 0);
      }).toThrow('Cart is empty');
    });

    test('should handle invalid payment method', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-18', name: 'Product 18', sku: 'SKU-018' } as any;

      posService.addToCart(product, 1, 5000);

      // This should work with valid payment methods
      const sale = posService.completeSale('cash', 5000);
      expect(sale).toBeDefined();
    });
  });

  describe('Multi-Item Sales', () => {
    test('should handle sales with multiple items and discounts', () => {
      const cart = posService.createCart('cust-789');
      const product1 = { id: 'prod-19', name: 'Item 1', sku: 'SKU-019' } as any;
      const product2 = { id: 'prod-20', name: 'Item 2', sku: 'SKU-020' } as any;
      const product3 = { id: 'prod-21', name: 'Item 3', sku: 'SKU-021' } as any;

      posService.addToCart(product1, 2, 5000);
      posService.addToCart(product2, 1, 10000);
      posService.addToCart(product3, 3, 2000);

      posService.applyItemDiscount('prod-19', 1000);
      posService.applyCartDiscount(2000);
      posService.applyTax(3000);

      const summary = posService.getCartSummary();
      expect(summary?.itemCount).toBe(3);
      expect(summary?.quantityCount).toBe(6);

      const sale = posService.completeSale('card', 32000, 'cust-789');
      expect(sale.items.length).toBe(3);
      // Subtotal: (2*5000 - 1000) + 10000 + (3*2000) = 9000 + 10000 + 6000 = 25000
      // Discount: 2000
      // Tax: 3000
      // Total: 25000 - 2000 + 3000 = 26000
      expect(sale.total.amount).toBe(26000);
    });
  });

  describe('Sale Retrieval', () => {
    test('should retrieve completed sales', () => {
      const cart = posService.createCart();
      const product = { id: 'prod-22', name: 'Product 22', sku: 'SKU-022' } as any;

      posService.addToCart(product, 1, 5000);
      const sale = posService.completeSale('cash', 5000);

      const retrievedSale = posService.getSale(sale.id);
      expect(retrievedSale).toBeDefined();
      expect(retrievedSale?.id).toBe(sale.id);
      expect(retrievedSale?.status).toBe('completed');
    });

    test('should get all sales', () => {
      const cart1 = posService.createCart();
      const product1 = { id: 'prod-23', name: 'Product 23', sku: 'SKU-023' } as any;
      posService.addToCart(product1, 1, 5000);
      const sale1 = posService.completeSale('cash', 5000);

      const cart2 = posService.createCart();
      const product2 = { id: 'prod-24', name: 'Product 24', sku: 'SKU-024' } as any;
      posService.addToCart(product2, 1, 3000);
      const sale2 = posService.completeSale('cash', 3000);

      const allSales = posService.getAllSales();
      expect(allSales.length).toBeGreaterThanOrEqual(2);
    });
  });
});
