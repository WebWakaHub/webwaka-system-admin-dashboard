import { Request, Response } from 'express';
import { MemberService } from '../services/MemberService';
import { CreateMemberDto } from '../dto/CreateMemberDto';
import { UpdateMemberDto } from '../dto/UpdateMemberDto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * MemberController
 * Handles HTTP requests for member management.
 */
export class MemberController {
  constructor(private memberService: MemberService) {}

  /**
   * POST /api/v1/members
   * Create a new member
   */
  async createMember(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const userId = req.user?.id as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      // Validate DTO
      const dto = plainToClass(CreateMemberDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ errors: errors.map((e) => e.constraints) });
        return;
      }

      const member = await this.memberService.createMember(tenantId, userId, dto);
      res.status(201).json(member);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /api/v1/members/:id
   * Get member by ID
   */
  async getMemberById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const { id } = req.params;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const member = await this.memberService.getMemberById(tenantId, id);
      res.status(200).json(member);
    } catch (error: any) {
      if (error.message === 'Member not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * PUT /api/v1/members/:id
   * Update member
   */
  async updateMember(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const userId = req.user?.id as string;
      const { id } = req.params;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      // Validate DTO
      const dto = plainToClass(UpdateMemberDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ errors: errors.map((e) => e.constraints) });
        return;
      }

      const member = await this.memberService.updateMember(tenantId, userId, id, dto);
      res.status(200).json(member);
    } catch (error: any) {
      if (error.message === 'Member not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Optimistic locking conflict')) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * DELETE /api/v1/members/:id
   * Delete member (soft delete)
   */
  async deleteMember(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const userId = req.user?.id as string;
      const { id } = req.params;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      await this.memberService.deleteMember(tenantId, userId, id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Member not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /api/v1/members/search
   * Search members
   */
  async searchMembers(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const { query, status, tags, page, limit } = req.query;

      const filters = {
        query: query as string,
        status: status as string,
        tags: tags ? (tags as string).split(',') : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      };

      const result = await this.memberService.searchMembers(tenantId, filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/members/:id/status
   * Change member status
   */
  async changeMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      const userId = req.user?.id as string;
      const { id } = req.params;
      const { status, version } = req.body;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      if (!status || version === undefined) {
        res.status(400).json({ error: 'Status and version are required' });
        return;
      }

      const member = await this.memberService.changeMemberStatus(
        tenantId,
        userId,
        id,
        status,
        version
      );
      res.status(200).json(member);
    } catch (error: any) {
      if (error.message === 'Member not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Optimistic locking conflict')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /api/v1/members/export
   * Export members to CSV
   */
  async exportMembers(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const members = await this.memberService.exportMembers(tenantId);

      // Convert to CSV (simplified, use a library like fast-csv in production)
      const csv = [
        'ID,First Name,Last Name,Phone,Email,Status,Membership Date',
        ...members.map((m) =>
          [
            m.id,
            m.firstName,
            m.lastName,
            m.phone,
            m.email || '',
            m.status,
            m.membershipDate?.toISOString() || '',
          ].join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/members/statistics
   * Get member statistics
   */
  async getMemberStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID is required' });
        return;
      }

      const statistics = await this.memberService.getMemberStatistics(tenantId);
      res.status(200).json(statistics);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
