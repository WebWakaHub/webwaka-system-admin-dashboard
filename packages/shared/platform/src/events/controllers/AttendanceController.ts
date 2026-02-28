import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { AttendanceService } from '../services/AttendanceService';
import { CheckInDto } from '../dto/CheckInDto';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor(dataSource: DataSource) {
    this.attendanceService = new AttendanceService(dataSource);
  }

  /**
   * POST /api/v1/attendance/check-in
   * Check in to an event
   */
  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.user.churchId;
      const userId = req.user.userId;
      const dto: CheckInDto = req.body;

      const attendance = await this.attendanceService.checkIn(churchId, userId, dto);

      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events/:eventId/attendance
   * Get event attendance
   */
  async getEventAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      const attendance = await this.attendanceService.getEventAttendance(eventId);

      res.status(200).json({ attendance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/members/:memberId/attendance
   * Get member's attendance history
   */
  async getMemberAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { memberId } = req.params;

      const attendance = await this.attendanceService.getMemberAttendance(memberId);

      res.status(200).json({ attendance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/events/:eventId/attendance/stats
   * Get attendance statistics
   */
  async getAttendanceStats(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      const stats = await this.attendanceService.getAttendanceStats(eventId);

      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
