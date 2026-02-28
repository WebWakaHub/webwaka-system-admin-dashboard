/**
 * WarehouseController
 * 
 * REST API endpoints for warehouse management.
 */

import { Request, Response } from 'express';
import { WarehouseService } from '../services/WarehouseService';
import {
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateLocationDTO,
  CreatePickingListDTO,
  PickItemDTO
} from '../types';

export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  /**
   * POST /api/v1/warehouses - Create warehouse
   */
  async createWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto: CreateWarehouseDTO = {
        tenant_id,
        ...req.body
      };

      const warehouse = await this.warehouseService.createWarehouse(dto);
      res.status(201).json({ status: 'success', data: warehouse });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/warehouses/:id - Get warehouse
   */
  async getWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const warehouse = await this.warehouseService.getWarehouse(id, tenant_id);

      if (!warehouse) {
        res.status(404).json({ status: 'error', error: 'Warehouse not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: warehouse });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/warehouses - List warehouses
   */
  async listWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.warehouseService.listWarehouses({
        tenant_id,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      });

      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * PUT /api/v1/warehouses/:id - Update warehouse
   */
  async updateWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const dto: UpdateWarehouseDTO = req.body;

      const warehouse = await this.warehouseService.updateWarehouse(id, tenant_id, dto);
      res.status(200).json({ status: 'success', data: warehouse });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/warehouses/:id/locations - Create location
   */
  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id: warehouse_id } = req.params;
      const dto: CreateLocationDTO = {
        tenant_id,
        warehouse_id,
        ...req.body
      };

      const location = await this.warehouseService.createLocation(dto);
      res.status(201).json({ status: 'success', data: location });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/warehouses/:id/locations - List locations
   */
  async listLocations(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id: warehouse_id } = req.params;
      const result = await this.warehouseService.listLocations({
        tenant_id,
        warehouse_id,
        zone: req.query.zone as string,
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      });

      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/picking-lists - Create picking list
   */
  async createPickingList(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const dto: CreatePickingListDTO = {
        tenant_id,
        ...req.body
      };

      const pickingList = await this.warehouseService.createPickingList(dto);
      res.status(201).json({ status: 'success', data: pickingList });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/picking-lists - List picking lists
   */
  async listPickingLists(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.warehouseService.listPickingLists({
        tenant_id,
        warehouse_id: req.query.warehouse_id as string,
        status: req.query.status as any,
        assigned_to: req.query.assigned_to as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      });

      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/picking-lists/:id - Get picking list
   */
  async getPickingList(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const pickingList = await this.warehouseService.getPickingList(id, tenant_id);

      if (!pickingList) {
        res.status(404).json({ status: 'error', error: 'Picking list not found' });
        return;
      }

      res.status(200).json({ status: 'success', data: pickingList });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/picking-lists/:id/start - Start picking
   */
  async startPicking(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      const staff_id = req.user?.id;
      if (!tenant_id || !staff_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const pickingList = await this.warehouseService.startPicking(id, tenant_id, staff_id);

      res.status(200).json({ status: 'success', data: pickingList });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/picking-lists/:id/items/:item_id/pick - Pick item
   */
  async pickItem(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id, item_id } = req.params;
      const dto: PickItemDTO = req.body;

      const pickingList = await this.warehouseService.pickItem(id, item_id, tenant_id, dto);

      res.status(200).json({ status: 'success', data: pickingList });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * POST /api/v1/picking-lists/:id/complete - Complete picking
   */
  async completePicking(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const pickingList = await this.warehouseService.completePicking(id, tenant_id);

      res.status(200).json({ status: 'success', data: pickingList });
    } catch (error: any) {
      res.status(400).json({ status: 'error', error: error.message });
    }
  }

  /**
   * GET /api/v1/warehouses/:id/statistics - Get warehouse statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.user?.tenant_id;
      if (!tenant_id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const stats = await this.warehouseService.getWarehouseStatistics(id, tenant_id);

      res.status(200).json({ status: 'success', data: stats });
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  }
}
