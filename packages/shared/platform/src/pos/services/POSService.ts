import { Sale, SaleItem } from '../models/Sale';
import { Cart } from '../components/Cart';
import { Payment } from '../components/Payment';
import { Receipt } from '../components/Receipt';
import { OfflineSync } from '../components/OfflineSync';
import { Money } from '../../commerce/primitives/Money';
import { Product } from '../../commerce/primitives/Product';

/**
 * Main POS Service for managing point of sale operations
 */
export class POSService {
  private offlineSync: OfflineSync;
  private currentCart?: Cart;
  private sales: Map<string, Sale> = new Map();
  private receipts: Map<string, Receipt> = new Map();

  constructor() {
    this.offlineSync = new OfflineSync();
  }

  /**
   * Create a new cart
   */
  createCart(customerId?: string): Cart {
    this.currentCart = new Cart('NGN', customerId);
    return this.currentCart;
  }

  /**
   * Get current cart
   */
  getCurrentCart(): Cart | undefined {
    return this.currentCart;
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product, quantity: number, unitPrice: number): void {
    if (!product) {
      throw new Error('Product is required');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    if (!this.currentCart) {
      this.createCart();
    }
    this.currentCart!.addItem(product, quantity, unitPrice);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: string): void {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (!this.currentCart) {
      throw new Error('No active cart');
    }
    this.currentCart.removeItem(productId);
  }

  /**
   * Update cart item quantity
   */
  updateCartQuantity(productId: string, quantity: number): void {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!this.currentCart) {
      throw new Error('No active cart');
    }
    this.currentCart.updateQuantity(productId, quantity);
  }

  /**
   * Apply discount to cart item
   */
  applyItemDiscount(productId: string, discountAmount: number): void {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    if (!this.currentCart) {
      throw new Error('No active cart');
    }
    this.currentCart.applyItemDiscount(productId, discountAmount);
  }

  /**
   * Apply discount to cart
   */
  applyCartDiscount(discountAmount: number): void {
    if (discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    if (!this.currentCart) {
      throw new Error('No active cart');
    }
    const discount = new Money(discountAmount, 'NGN');
    this.currentCart.applyCartDiscount(discount);
  }

  /**
   * Apply tax to cart
   */
  applyTax(taxAmount: number): void {
    if (taxAmount < 0) {
      throw new Error('Tax amount cannot be negative');
    }
    if (!this.currentCart) {
      throw new Error('No active cart');
    }
    const tax = new Money(taxAmount, 'NGN');
    this.currentCart.applyTax(tax);
  }

  /**
   * Complete a sale
   */
  completeSale(
    paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile_money',
    amountPaid: number,
    customerId?: string,
    receiptNumber?: string,
    merchantName?: string
  ): Sale {
    if (!this.currentCart || this.currentCart.isEmpty()) {
      throw new Error('Cart is empty');
    }

    const cartTotal = this.currentCart.getTotal();
    const amountPaidMoney = new Money(amountPaid, 'NGN');

    if (amountPaid < cartTotal) {
      throw new Error('Insufficient payment');
    }

    // Create sale
    const sale = new Sale(
      this.currentCart.id,
      paymentMethod,
      amountPaidMoney,
      new Money(this.currentCart.getTax(), 'NGN'),
      new Money(cartTotal, 'NGN'),
      this.currentCart.getItems(),
      customerId || this.currentCart.customerId,
      this.currentCart.getDiscount() > 0 ? new Money(this.currentCart.getDiscount(), 'NGN') : undefined
    );

    // Store sale
    this.sales.set(sale.id, sale);

    // Queue for sync if offline
    if (!this.offlineSync.getIsOnline()) {
      this.offlineSync.queueTransaction(sale.id, 'sale', sale);
    }

    // Generate receipt
    const receipt = new Receipt(
      sale,
      receiptNumber || `RCP-${Date.now()}`,
      merchantName || 'WebWaka POS',
      undefined,
      undefined,
      customerId
    );
    this.receipts.set(receipt.id, receipt);
    
    // Set receiptId on sale
    sale.receiptId = receipt.id;

    // Clear cart
    this.currentCart.clear();

    return sale;
  }

  /**
   * Get sale by ID
   */
  getSale(saleId: string): Sale | undefined {
    return this.sales.get(saleId);
  }

  /**
   * Get all sales
   */
  getAllSales(): Sale[] {
    return Array.from(this.sales.values());
  }

  /**
   * Get receipt by ID
   */
  getReceipt(receiptId: string): Receipt | undefined {
    return this.receipts.get(receiptId);
  }

  /**
   * Generate receipt text
   */
  generateReceiptText(receiptId: string): string | undefined {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) {
      return undefined;
    }
    return receipt.generateText();
  }

  /**
   * Generate receipt HTML
   */
  generateReceiptHTML(receiptId: string): string | undefined {
    const receipt = this.receipts.get(receiptId);
    if (!receipt) {
      return undefined;
    }
    return receipt.generateHTML();
  }

  /**
   * Get offline sync status
   */
  getOfflineSyncStatus(): OfflineSyncStatus {
    return {
      isOnline: this.offlineSync.getIsOnline(),
      queueSize: this.offlineSync.getQueueSize(),
      pendingTransactions: this.offlineSync.getPendingTransactions().length,
      failedTransactions: this.offlineSync.getFailedTransactions().length,
    };
  }

  /**
   * Sync pending transactions
   */
  async syncPendingTransactions(): Promise<void> {
    await this.offlineSync.syncPendingTransactions();
  }

  /**
   * Get cart summary
   */
  getCartSummary() {
    if (!this.currentCart) {
      return null;
    }
    return this.currentCart.getSummary();
  }

  /**
   * Clear current cart
   */
  clearCart(): void {
    if (this.currentCart) {
      this.currentCart.clear();
    }
  }

  /**
   * Get receipt by sale ID
   */
  getReceiptBySaleId(saleId: string): Receipt | undefined {
    const sale = this.sales.get(saleId);
    if (!sale || !sale.receiptId) {
      return undefined;
    }
    return this.receipts.get(sale.receiptId);
  }

  /**
   * Refund a sale
   */
  refundSale(saleId: string): Sale {
    const sale = this.sales.get(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    if (sale.status === 'refunded') {
      throw new Error('Sale already refunded');
    }
    sale.refund();
    return sale;
  }
}

/**
 * Offline sync status
 */
export interface OfflineSyncStatus {
  isOnline: boolean;
  queueSize: number;
  pendingTransactions: number;
  failedTransactions: number;
}
