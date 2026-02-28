import { MemberRepository } from '../repositories/MemberRepository';
import { Member } from '../models/Member';
import { CreateMemberDto } from '../dto/CreateMemberDto';
import { UpdateMemberDto } from '../dto/UpdateMemberDto';
import { MemberEventPublisher } from '../events/MemberEventPublisher';
import { MemberAuditLogger } from '../utils/MemberAuditLogger';

/**
 * MemberService
 * Business logic for member management operations.
 */
export class MemberService {
  constructor(
    private memberRepository: MemberRepository,
    private eventPublisher: MemberEventPublisher,
    private auditLogger: MemberAuditLogger
  ) {}

  /**
   * Create a new member
   */
  async createMember(
    tenantId: string,
    userId: string,
    dto: CreateMemberDto
  ): Promise<Member> {
    // Check for duplicate phone number
    const existingMember = await this.memberRepository.findByPhone(tenantId, dto.phone);
    if (existingMember) {
      throw new Error('Member with this phone number already exists');
    }

    // Check for duplicate email if provided
    if (dto.email) {
      const existingEmail = await this.memberRepository.findByEmail(tenantId, dto.email);
      if (existingEmail) {
        throw new Error('Member with this email already exists');
      }
    }

    // Create member
    const member = await this.memberRepository.create(
      tenantId,
      {
        ...dto,
        status: dto.status || 'visitor',
      },
      userId
    );

    // Log audit trail
    await this.auditLogger.logCreate(tenantId, member.id, member, userId);

    // Publish event
    await this.eventPublisher.publishMemberCreated(tenantId, member);

    return member;
  }

  /**
   * Get member by ID
   */
  async getMemberById(tenantId: string, memberId: string): Promise<Member> {
    const member = await this.memberRepository.findById(tenantId, memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  }

  /**
   * Update member
   */
  async updateMember(
    tenantId: string,
    userId: string,
    memberId: string,
    dto: UpdateMemberDto
  ): Promise<Member> {
    // Get existing member for audit trail
    const oldMember = await this.getMemberById(tenantId, memberId);

    // Check for duplicate phone if changed
    if (dto.phone && dto.phone !== oldMember.phone) {
      const existingMember = await this.memberRepository.findByPhone(tenantId, dto.phone);
      if (existingMember) {
        throw new Error('Member with this phone number already exists');
      }
    }

    // Check for duplicate email if changed
    if (dto.email && dto.email !== oldMember.email) {
      const existingEmail = await this.memberRepository.findByEmail(tenantId, dto.email);
      if (existingEmail) {
        throw new Error('Member with this email already exists');
      }
    }

    // Update member with optimistic locking
    const { version, ...updateData } = dto;
    const updatedMember = await this.memberRepository.update(
      tenantId,
      memberId,
      updateData,
      version,
      userId
    );

    // Log audit trail
    await this.auditLogger.logUpdate(tenantId, memberId, oldMember, updatedMember, userId);

    // Publish event
    await this.eventPublisher.publishMemberUpdated(tenantId, updatedMember);

    return updatedMember;
  }

  /**
   * Delete member (soft delete)
   */
  async deleteMember(tenantId: string, userId: string, memberId: string): Promise<void> {
    const member = await this.getMemberById(tenantId, memberId);

    // Soft delete member
    await this.memberRepository.softDelete(tenantId, memberId, userId);

    // Log audit trail
    await this.auditLogger.logDelete(tenantId, memberId, member, userId);

    // Publish event
    await this.eventPublisher.publishMemberDeleted(tenantId, member);
  }

  /**
   * Change member status
   */
  async changeMemberStatus(
    tenantId: string,
    userId: string,
    memberId: string,
    newStatus: string,
    version: number
  ): Promise<Member> {
    const oldMember = await this.getMemberById(tenantId, memberId);
    const oldStatus = oldMember.status;

    // Update status
    const updatedMember = await this.memberRepository.update(
      tenantId,
      memberId,
      { status: newStatus as any },
      version,
      userId
    );

    // Log audit trail
    await this.auditLogger.logStatusChange(
      tenantId,
      memberId,
      oldStatus,
      newStatus,
      userId
    );

    // Publish event
    await this.eventPublisher.publishMemberStatusChanged(
      tenantId,
      updatedMember,
      oldStatus,
      newStatus
    );

    return updatedMember;
  }

  /**
   * Search members
   */
  async searchMembers(
    tenantId: string,
    filters: {
      query?: string;
      status?: string;
      tags?: string[];
      page?: number;
      limit?: number;
    }
  ): Promise<{ members: Member[]; total: number; page: number; limit: number }> {
    const { members, total } = await this.memberRepository.search(tenantId, filters);
    return {
      members,
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
    };
  }

  /**
   * Export members to CSV
   */
  async exportMembers(tenantId: string): Promise<Member[]> {
    return await this.memberRepository.findAll(tenantId);
  }

  /**
   * Get member statistics
   */
  async getMemberStatistics(tenantId: string): Promise<{
    total: number;
    visitors: number;
    members: number;
    inactive: number;
  }> {
    const [total, visitors, members, inactive] = await Promise.all([
      this.memberRepository.countByStatus(tenantId, ''),
      this.memberRepository.countByStatus(tenantId, 'visitor'),
      this.memberRepository.countByStatus(tenantId, 'member'),
      this.memberRepository.countByStatus(tenantId, 'inactive'),
    ]);

    return { total, visitors, members, inactive };
  }
}
