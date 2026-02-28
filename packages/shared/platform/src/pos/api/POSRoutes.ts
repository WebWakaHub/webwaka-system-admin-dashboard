import { Router, Request, Response } from 'express';
import { POSService } from '../services/POSService';

const router = Router();
const posService = new POSService();

/**
 * POST /api/v1/pos/cart
 * Create a new cart
 */
router.post('/cart', (req: Request, res: Response) => {
  try {
    const { customerId } = req.body;
    const cart = posService.createCart(customerId);
    res.json({
      status: 'success',
      data: cart.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'CART_CREATION_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * GET /api/v1/pos/cart
 * Get current cart
 */
router.get('/cart', (req: Request, res: Response) => {
  try {
    const cart = posService.getCurrentCart();
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'CART_NOT_FOUND',
          message: 'No active cart found',
        },
      });
    }
    res.json({
      status: 'success',
      data: cart.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'CART_RETRIEVAL_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * POST /api/v1/pos/cart/items
 * Add item to cart
 */
router.post('/cart/items', (req: Request, res: Response) => {
  try {
    const { productId, productName, sku, quantity, unitPrice } = req.body;
    const product = { id: productId, name: productName, sku } as any;
    posService.addToCart(product, quantity, unitPrice);
    const cart = posService.getCurrentCart();
    res.json({
      status: 'success',
      data: cart?.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'ADD_TO_CART_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * DELETE /api/v1/pos/cart/items/:productId
 * Remove item from cart
 */
router.delete('/cart/items/:productId', (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    posService.removeFromCart(productId);
    const cart = posService.getCurrentCart();
    res.json({
      status: 'success',
      data: cart?.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'REMOVE_FROM_CART_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * POST /api/v1/pos/sales
 * Complete a sale
 */
router.post('/sales', (req: Request, res: Response) => {
  try {
    const { paymentMethod, amountPaid, customerId, receiptNumber, merchantName } = req.body;
    const sale = posService.completeSale(paymentMethod, amountPaid, customerId, receiptNumber, merchantName);
    res.json({
      status: 'success',
      data: sale.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'SALE_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * GET /api/v1/pos/sales/:saleId
 * Get sale by ID
 */
router.get('/sales/:saleId', (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const sale = posService.getSale(saleId);
    if (!sale) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'SALE_NOT_FOUND',
          message: 'Sale not found',
        },
      });
    }
    res.json({
      status: 'success',
      data: sale.getSummary(),
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'SALE_RETRIEVAL_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * GET /api/v1/pos/receipts/:receiptId
 * Get receipt by ID
 */
router.get('/receipts/:receiptId', (req: Request, res: Response) => {
  try {
    const { receiptId } = req.params;
    const receipt = posService.getReceipt(receiptId);
    if (!receipt) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'RECEIPT_NOT_FOUND',
          message: 'Receipt not found',
        },
      });
    }
    res.json({
      status: 'success',
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'RECEIPT_RETRIEVAL_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

/**
 * GET /api/v1/pos/status
 * Get offline sync status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = posService.getOfflineSyncStatus();
    res.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'STATUS_RETRIEVAL_FAILED',
        message: (error as Error).message,
      },
    });
  }
});

export default router;
