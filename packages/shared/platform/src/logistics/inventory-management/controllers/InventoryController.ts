/**
 * Inventory Controller
 * 
 * REST API endpoints for inventory operations
 * Handles request validation, authentication, and response formatting
 */

import { Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';
import { ApiResponse } from '../types';

export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * GET /api/v1/inventory/:sku
   * Get inventory by SKU
   */
  async getInventoryBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const { location_id } = req.query;
      const tenant_id = req.user?.tenant_id; // From authentication middleware

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      const inventory = await this.inventoryService.getInventoryBySku(
        tenant_id,
        sku,
        location_id as string | undefined
      );

      if (!inventory) {
        res.status(404).json({
          status: 'error',
          error: {
            code: 'INVENTORY_NOT_FOUND',
            message: `Inventory not found for SKU: ${sku}`
          }
        } as ApiResponse<never>);
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          sku: inventory.sku,
          product_name: 'Product Name', // TODO: Fetch from Product Management module
          location_id: inventory.location_id,
          location_name: 'Location Name', // TODO: Fetch from Location Management module
          on_hand: inventory.on_hand,
          available: inventory.available,
          reserved: inventory.reserved,
          allocated: inventory.allocated,
          committed: inventory.committed,
          reorder_point: inventory.reorder_point,
          safety_stock: inventory.safety_stock,
          unit_cost: inventory.unit_cost,
          total_value: inventory.total_value,
          currency: inventory.currency,
          last_updated: inventory.updated_at
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error getting inventory:', error);
      res.status(500).json({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Internal server error'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/v1/inventory
   * Get inventory list (with filters)
   */
  async getInventoryList(req: Request, res: Response): Promise<void> {
    try {
      const { sku, product_id, location_id } = req.query;
      const tenant_id = req.user?.tenant_id;

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      const inventories = await this.inventoryService.getInventory({
        tenant_id,
        sku: sku as string | undefined,
        product_id: product_id as string | undefined,
        location_id: location_id as string | undefined
      });

      res.status(200).json({
        status: 'success',
        data: inventories
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error getting inventory list:', error);
      res.status(500).json({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Internal server error'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/v1/inventory
   * Create new inventory record
   */
  async createInventory(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      const inventory = await this.inventoryService.createInventory({
        tenant_id,
        ...req.body
      });

      res.status(201).json({
        status: 'success',
        data: inventory
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error creating inventory:', error);
      res.status(400).json({
        status: 'error',
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Bad request'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * PUT /api/v1/inventory/:id
   * Update inventory record
   */
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.user?.tenant_id;

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      const inventory = await this.inventoryService.updateInventory(id, {
        tenant_id,
        ...req.body
      });

      res.status(200).json({
        status: 'success',
        data: inventory
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      res.status(400).json({
        status: 'error',
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Bad request'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/v1/inventory/reserve
   * Reserve inventory for order
   */
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      const reservation = await this.inventoryService.reserveInventory({
        tenant_id,
        ...req.body
      });

      res.status(201).json({
        status: 'success',
        data: reservation
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error reserving inventory:', error);
      res.status(400).json({
        status: 'error',
        error: {
          code: 'INSUFFICIENT_INVENTORY',
          message: error.message || 'Insufficient inventory'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/v1/inventory/reserve/:id/release
   * Release inventory reservation
   */
  async releaseReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.inventoryService.releaseReservation(id);

      res.status(200).json({
        status: 'success',
        data: { message: 'Reservation released successfully' }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error releasing reservation:', error);
      res.status(400).json({
        status: 'error',
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Bad request'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * POST /api/v1/inventory/reserve/:id/allocate
   * Allocate inventory reservation
   */
  async allocateReservation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.inventoryService.allocateReservation(id);

      res.status(200).json({
        status: 'success',
        data: { message: 'Reservation allocated successfully' }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error allocating reservation:', error);
      res.status(400).json({
        status: 'error',
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Bad request'
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * GET /api/v1/inventory/availability
   * Check inventory availability
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { sku, location_id, quantity } = req.query;
      const tenant_id = req.user?.tenant_id;

      if (!tenant_id) {
        res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as ApiResponse<never>);
        return;
      }

      if (!sku || !location_id || !quantity) {
        res.status(400).json({
          status: 'error',
          error: {
            code: 'BAD_REQUEST',
            message: 'SKU, location_id, and quantity are required'
          }
        } as ApiResponse<never>);
        return;
      }

      const available = await this.inventoryService.checkAvailability(
        tenant_id,
        sku as string,
        location_id as string,
        parseInt(quantity as string, 10)
      );

      res.status(200).json({
        status: 'success',
        data: { available }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error checking availability:', error);
      res.status(500).json({
        status: 'error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Internal server error'
        }
      } as ApiResponse<never>);
    }
  }
}
