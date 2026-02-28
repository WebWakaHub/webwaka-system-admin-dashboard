import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RecurringDonationService } from '../services/RecurringDonationService';
import { CreateRecurringDonationDto } from '../dto/CreateRecurringDonationDto';
import { UpdateRecurringDonationDto } from '../dto/UpdateRecurringDonationDto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class RecurringDonationController {
  private service: RecurringDonationService;

  constructor(dataSource: DataSource) {
    this.service = new RecurringDonationService(dataSource);
  }

  /**
   * POST /api/v1/donations/recurring
   * Create recurring donation schedule
   */
  async createRecurringDonation(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateRecurringDonationDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const churchId = req.user?.churchId || req.body.churchId;
      const userId = req.user?.userId || req.body.userId;

      const schedule = await this.service.createRecurringDonation(churchId, userId, dto);

      res.status(201).json({
        scheduleId: schedule.scheduleId,
        nextPaymentDate: schedule.nextPaymentDate,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create recurring donation' });
    }
  }

  /**
   * PATCH /api/v1/donations/recurring/:id
   * Update recurring donation schedule
   */
  async updateRecurringDonation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = plainToClass(UpdateRecurringDonationDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const schedule = await this.service.updateRecurringDonation(id, dto);

      if (!schedule) {
        res.status(404).json({ error: 'Recurring donation not found' });
        return;
      }

      res.status(200).json(schedule);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update recurring donation' });
    }
  }

  /**
   * GET /api/v1/donations/recurring/:id
   * Get recurring donation by ID
   */
  async getRecurringDonation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await this.service.getRecurringDonationById(id);

      if (!schedule) {
        res.status(404).json({ error: 'Recurring donation not found' });
        return;
      }

      res.status(200).json(schedule);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get recurring donation' });
    }
  }

  /**
   * GET /api/v1/donations/recurring/donor/:donorId
   * Get recurring donations by donor
   */
  async getRecurringDonationsByDonor(req: Request, res: Response): Promise<void> {
    try {
      const { donorId } = req.params;
      const schedules = await this.service.getRecurringDonationsByDonor(donorId);

      res.status(200).json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get recurring donations' });
    }
  }
}
