import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { EventService } from '../services/EventService';
import { CreateEventDto } from '../dto/CreateEventDto';
import { EventStatus } from '../models/Event';

export class EventController {
  private eventService: EventService;

  constructor(dataSource: DataSource) {
    this.eventService = new EventService(dataSource);
  }

  /**
   * POST /api/v1/events
   * Create a new event
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const userId = req.user.userId;
      const dto: CreateEventDto = req.body;

      const event = await this.eventService.createEvent(churchId, userId, dto);

      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events/:id
   * Get event by ID
   */
  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await this.eventService.getEvent(id);

      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.status(200).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events
   * List events
   */
  async listEvents(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const { status, eventType, startDate, endDate } = req.query;

      const filters: any = {};
      if (status) filters.status = status as EventStatus;
      if (eventType) filters.eventType = eventType;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await this.eventService.listEvents(churchId, filters);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/events/:id/publish
   * Publish an event
   */
  async publishEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const event = await this.eventService.publishEvent(id, userId);

      res.status(200).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/events/:id/cancel
   * Cancel an event
   */
  async cancelEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const event = await this.eventService.cancelEvent(id, userId);

      res.status(200).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events/upcoming
   * Get upcoming events
   */
  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const limit = parseInt(req.query.limit as string) || 10;

      const events = await this.eventService.getUpcomingEvents(churchId, limit);

      res.status(200).json({ events });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
